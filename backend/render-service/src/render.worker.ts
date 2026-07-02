import { z } from 'zod';
import { KafkaTopics } from '../../../contracts/kafka-events';
import { startKafkaWorker } from '../../shared/kafka-consumer-runner';
import { PrismaService } from '../../shared/prisma.service';
import { RenderService } from './render.service';

const scriptCreatedEventSchema = z.object({
  scriptId: z.string().uuid(),
  trendId: z.string().uuid().nullable().optional(),
  title: z.string(),
  qualityScore: z.number(),
  factScore: z.number(),
});

export async function startRenderWorker() {
  const prisma = new PrismaService();
  const service = new RenderService(prisma);
  await prisma.$connect();

  await startKafkaWorker({
    service: 'render-service',
    groupId: 'render-service-script-consumer',
    topics: [KafkaTopics.SCRIPT_CREATED],
    parse: (raw) => scriptCreatedEventSchema.parse(JSON.parse(raw)),
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
