import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class KafkaRuntimeVerifier {
  constructor(private readonly prisma: PrismaService) {}

  async verifyAsyncPipelineEvidence() {
    const topics = ['trend.discovered', 'script.created', 'video.rendered', 'video.published'];

    const logs = await this.prisma.eventProcessingLog.findMany({
      where: { topic: { in: topics } },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    const topicStatus = topics.map((topic) => ({
      topic,
      successCount: logs.filter(
        (log) => log.topic === topic && log.status === 'SUCCESS',
      ).length,
    }));

    return {
      requiredTopics: topics,
      topicStatus,
      passed: topicStatus.every((item) => item.successCount > 0),
    };
  }
}
