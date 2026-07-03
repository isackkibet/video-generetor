import { KafkaTopics } from "../../../contracts/kafka-events";
import { kafkaVideoRenderedSchema } from "../../../contracts/validation-schemas";
import { createIdempotencyKey } from "../../shared/idempotency";
import { parseEvent } from "../../shared/event-validation";
import { startKafkaWorker } from "../../shared/kafka-consumer-runner";
import { PrismaService } from "../../shared/prisma.service";
import { ModerationService } from "./moderation.service";

export async function startModerationWorker() {
  const prisma = new PrismaService();
  const service = new ModerationService(prisma);
  await prisma.$connect();

  await startKafkaWorker({
    service: "moderation-service",
    groupId: "moderation-service-render-consumer",
    topics: [KafkaTopics.VIDEO_RENDERED],
    prisma,
    parse: (raw, topic) =>
      parseEvent({
        service: "moderation-service",
        topic,
        raw,
        schema: kafkaVideoRenderedSchema,
      }),
    idempotencyKey: (event) =>
      createIdempotencyKey({
        topic: KafkaTopics.VIDEO_RENDERED,
        entityId: event.videoId,
        action: "moderate-and-publish",
      }),
    handle: async (event) => {
      const result = await service.moderateVideo({
        videoId: event.videoId,
      });
      if (result.video.status === "APPROVED") {
        await service.publishApprovedVideo(event.videoId);
      }
    },
  });
}
