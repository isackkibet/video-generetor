import { z } from 'zod';
import { KafkaTopics } from '../../../contracts/kafka-events';
import { startKafkaWorker } from '../../shared/kafka-consumer-runner';
import { PrismaService } from '../../shared/prisma.service';
import { ModerationService } from './moderation.service';

const videoRenderedEventSchema = z.object({
  videoId: z.string().uuid(),
  videoUrl: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
  durationSeconds: z.number(),
});

export async function startModerationWorker() {
  const prisma = new PrismaService();
  const service = new ModerationService(prisma);
  await prisma.$connect();

  await startKafkaWorker({
    service: 'moderation-service',
    groupId: 'moderation-service-render-consumer',
    topics: [KafkaTopics.VIDEO_RENDERED],
    parse: (raw) => videoRenderedEventSchema.parse(JSON.parse(raw)),
    handle: async (event) => {
      const result = await service.moderateVideo({
        videoId: event.videoId,
      });
      if (result.video.status === 'APPROVED') {
        await service.publishApprovedVideo(event.videoId);
      }
    },
  });
}
