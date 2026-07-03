import { KafkaTopics } from "../../../contracts/kafka-events";
import { kafkaScriptCreatedSchema } from "../../../contracts/validation-schemas";
import { createIdempotencyKey } from "../../shared/idempotency";
import { parseEvent } from "../../shared/event-validation";
import { startKafkaWorker } from "../../shared/kafka-consumer-runner";
import { PrismaService } from "../../shared/prisma.service";
import { RenderService } from "./render.service";

export async function startRenderWorker() {
  const prisma = new PrismaService();
  const service = new RenderService(prisma);
  await prisma.$connect();

  await startKafkaWorker({
    service: "render-service",
    groupId: "render-service-script-consumer",
    topics: [KafkaTopics.SCRIPT_CREATED],
    prisma,
    parse: (raw, topic) =>
      parseEvent({
        service: "render-service",
        topic,
        raw,
        schema: kafkaScriptCreatedSchema,
      }),
    idempotencyKey: (event) =>
      createIdempotencyKey({
        topic: KafkaTopics.SCRIPT_CREATED,
        entityId: event.scriptId,
        action: "create-and-render-video",
      }),
    handle: async (event) => {
      const video = await service.createVideoJob({
        scriptId: event.scriptId,
      });
      await service.renderVideo({
        videoId: video.id,
      });
    },
  });
}
