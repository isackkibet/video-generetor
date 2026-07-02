import { z } from 'zod';
import { KafkaTopics } from '../../../contracts/kafka-events';
import { startKafkaWorker } from '../../shared/kafka-consumer-runner';
import { PrismaService } from '../../shared/prisma.service';
import { ScriptService } from './script.service';

const trendDiscoveredEventSchema = z.object({
  trendId: z.string().uuid(),
  topic: z.string(),
  category: z.string(),
  score: z.number(),
  growthRate: z.number(),
  region: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

export async function startScriptWorker() {
  const prisma = new PrismaService();
  const service = new ScriptService(prisma);
  await prisma.$connect();

  await startKafkaWorker({
    service: 'script-service',
    groupId: 'script-service-trend-consumer',
    topics: [KafkaTopics.TREND_DISCOVERED],
    parse: (raw) => trendDiscoveredEventSchema.parse(JSON.parse(raw)),
    handle: async (event) => {
      await service.generateFromTrend({
        trendId: event.trendId,
      });
    },
  });
}
