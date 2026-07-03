import { KafkaTopics } from "../../../contracts/kafka-events";
import { kafkaTrendDiscoveredSchema } from "../../../contracts/validation-schemas";
import { createIdempotencyKey } from "../../shared/idempotency";
import { parseEvent } from "../../shared/event-validation";
import { startKafkaWorker } from "../../shared/kafka-consumer-runner";
import { PrismaService } from "../../shared/prisma.service";
import { ScriptService } from "./script.service";

export async function startScriptWorker() {
  const prisma = new PrismaService();
  const service = new ScriptService(prisma);
  await prisma.$connect();

  await startKafkaWorker({
    service: "script-service",
    groupId: "script-service-trend-consumer",
    topics: [KafkaTopics.TREND_DISCOVERED],
    prisma,
    parse: (raw, topic) =>
      parseEvent({
        service: "script-service",
        topic,
        raw,
        schema: kafkaTrendDiscoveredSchema,
      }),
    idempotencyKey: (event) =>
      createIdempotencyKey({
        topic: KafkaTopics.TREND_DISCOVERED,
        entityId: event.trendId,
        action: "generate-script",
      }),
    handle: async (event) => {
      await service.generateFromTrend({
        trendId: event.trendId,
      });
    },
  });
}
