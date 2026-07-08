import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class ProductionReadinessEvidence {
  constructor(private readonly prisma: PrismaService) {}

  async generateReport() {
    const [
      videos,
      publishedVideos,
      providerLogs,
      adminAuditLogs,
      moderationLogs,
      feedEvents,
      userInterestProfiles,
      videoScores,
      deploymentLocks,
    ] = await Promise.all([
      this.prisma.video.count(),
      this.prisma.video.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.providerJobLog.count(),
      this.prisma.adminAuditLog.count(),
      this.prisma.moderationLog.count(),
      this.prisma.feedEvent.count(),
      this.prisma.userInterestProfile.count(),
      this.prisma.videoScore.count(),
      this.prisma.productionDeploymentLock.count().catch(() => 0),
    ]);

    const blockers = [];
    if (publishedVideos === 0) blockers.push('No published videos.');
    if (providerLogs === 0) blockers.push('No ProviderJobLog evidence.');
    if (adminAuditLogs === 0) blockers.push('No AdminAuditLog evidence.');
    if (moderationLogs === 0) blockers.push('No ModerationLog evidence.');
    if (feedEvents === 0) blockers.push('No FeedEvent evidence.');
    if (userInterestProfiles === 0) blockers.push('No UserInterestProfile evidence.');
    if (videoScores === 0) blockers.push('No VideoScore evidence.');

    return {
      generatedAt: new Date().toISOString(),
      status:
        blockers.length === 0
          ? 'RUNTIME_EVIDENCE_READY'
          : 'RUNTIME_EVIDENCE_INCOMPLETE',
      metrics: {
        videos,
        publishedVideos,
        providerLogs,
        adminAuditLogs,
        moderationLogs,
        feedEvents,
        userInterestProfiles,
        videoScores,
        deploymentLocks,
      },
      blockers,
      productionReminder:
        'Runtime evidence does not unlock production. Production still requires executive authorization and deployment lock validation.',
    };
  }
}
