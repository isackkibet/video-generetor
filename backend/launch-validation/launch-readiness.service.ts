import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { EventProcessingValidator } from './event-processing-validator';
import { KafkaRuntimeVerifier } from './kafka-runtime-verifier';

@Injectable()
export class LaunchReadinessService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluate() {
    const eventValidation = await new EventProcessingValidator(this.prisma).validate();
    const kafkaRuntime = await new KafkaRuntimeVerifier(this.prisma).verifyAsyncPipelineEvidence();

    const [publishedVideos, providerLogs, moderationLogs, videoScores, feedEvents] =
      await Promise.all([
        this.prisma.video.count({ where: { status: 'PUBLISHED' } }),
        this.prisma.providerJobLog.count(),
        this.prisma.moderationLog.count(),
        this.prisma.videoScore.count(),
        this.prisma.feedEvent.count(),
      ]);

    const technicalReady =
      eventValidation.passed &&
      kafkaRuntime.passed &&
      publishedVideos > 0 &&
      providerLogs > 0 &&
      moderationLogs > 0 &&
      videoScores > 0 &&
      feedEvents > 0;

    return {
      generatedAt: new Date().toISOString(),
      diagnosticBaseline: {
        v5Alignment: 90,
        remainingTechnicalBlocker: 'Event-Driven Kafka Processing',
      },
      evidence: {
        publishedVideos,
        providerLogs,
        moderationLogs,
        videoScores,
        feedEvents,
        eventProcessing: eventValidation,
        kafkaRuntime,
      },
      launchReadinessDecision: technicalReady
        ? 'TECHNICALLY_READY_PENDING_EXECUTIVE_SPONSOR'
        : 'NOT_READY',
      remainingPrerequisite: technicalReady
        ? 'Executive Sponsor approval and production deployment lock release.'
        : eventValidation.blocker || 'Kafka async pipeline evidence incomplete.',
    };
  }
}
