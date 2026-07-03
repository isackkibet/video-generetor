import { KafkaTopics } from "../../contracts/kafka-events";
import { publishEvent } from "./kafka";
import { logError, logInfo, logWarn } from "./logger";
import { PrismaService } from "./prisma.service";
import { EventProcessingService } from "./event-processing.service";

export async function startKafkaWorker<T>(input: {
  service: string;
  groupId: string;
  topics: string[];
  parse: (raw: string, topic: string) => T;
  idempotencyKey: (event: T, topic: string) => string;
  handle: (event: T, topic: string) => Promise<void>;
  prisma: PrismaService;
  maxAttempts?: number;
}) {
  const { createConsumer } = await import("./kafka");
  const processing = new EventProcessingService(input.prisma);

  await createConsumer(
    input.groupId,
    input.topics,
    async ({ topic, message }) => {
      const raw = message.value?.toString();
      if (!raw) return;

      let event: T;
      let idempotencyKey: string;

      try {
        event = input.parse(raw, topic);
        idempotencyKey = input.idempotencyKey(event, topic);

        if (await processing.alreadyProcessed(idempotencyKey)) {
          logInfo({
            service: input.service,
            message: "Kafka event skipped because already processed",
            metadata: { topic, idempotencyKey },
          });
          return;
        }

        const log = await processing.start({
          idempotencyKey,
          topic,
          payload: event,
        });

        logInfo({
          service: input.service,
          message: "Kafka event processing started",
          metadata: {
            topic,
            idempotencyKey,
            attempts: log.attempts,
          },
        });

        await input.handle(event, topic);

        await processing.success(idempotencyKey);

        logInfo({
          service: input.service,
          message: "Kafka event processing completed",
          metadata: { topic, idempotencyKey },
        });
      } catch (error) {
        const messageText =
          error instanceof Error
            ? error.message
            : "Unknown Kafka worker failure";

        logError({
          service: input.service,
          message: "Kafka event processing failed",
          metadata: {
            topic,
            error: messageText,
          },
        });

        try {
          const parsed = JSON.parse(raw);
          const key =
            typeof parsed.idempotencyKey === "string"
              ? parsed.idempotencyKey
              : `${topic}:${message.offset}`;

          await processing
            .fail({
              idempotencyKey: key,
              errorMessage: messageText,
            })
            .catch(() => null);

          const maxAttempts = input.maxAttempts || 3;
          const attempt = Number(parsed.attempt || 1);

          if (attempt < maxAttempts) {
            const retryEvent = {
              originalTopic: topic,
              payload: parsed,
              errorMessage: messageText,
              attempt: attempt + 1,
              nextRunAt: new Date(Date.now() + 30000).toISOString(),
              idempotencyKey: key,
            };

            await publishEvent(KafkaTopics.PIPELINE_RETRY, retryEvent, key);

            logWarn({
              service: input.service,
              message: "Kafka event sent to retry topic",
              metadata: retryEvent,
            });
          } else {
            // ✅ Batch 43: Persist dead-letter record
            await input.prisma.eventProcessingLog.upsert({
              where: { idempotencyKey: key },
              create: {
                idempotencyKey: key,
                topic,
                status: "DEAD_LETTERED",
                attempts: attempt,
                errorMessage: messageText,
                payload: parsed,
              },
              update: {
                status: "DEAD_LETTERED",
                attempts: attempt,
                errorMessage: messageText,
                payload: parsed,
              },
            });

            const deadLetterEvent = {
              originalTopic: topic,
              payload: parsed,
              errorMessage: messageText,
              attempts: attempt,
              failedAt: new Date().toISOString(),
              idempotencyKey: key,
            };

            await publishEvent(
              KafkaTopics.PIPELINE_DEAD_LETTER,
              deadLetterEvent,
              key,
            );

            logError({
              service: input.service,
              message: "Kafka event sent to dead-letter topic",
              metadata: deadLetterEvent,
            });
          }
        } catch (err) {
          logError({
            service: input.service,
            message: "Kafka failure could not be routed to retry/dead-letter",
            metadata: { topic },
          });
        }
      }
    },
  );
}
