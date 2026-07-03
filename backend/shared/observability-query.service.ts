import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Injectable()
export class ObservabilityQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async providerFailureSummary() {
    const [
      providerJobsTotal,
      providerJobsFailed,
      providerJobsFallback,
      scriptLogsTotal,
      scriptLogsFailed,
      scriptLogsFallback,
    ] = await Promise.all([
      this.prisma.providerJobLog.count(),
      this.prisma.providerJobLog.count({ where: { status: "FAILED" } }),
      this.prisma.providerJobLog.count({ where: { fallbackUsed: true } }),
      this.prisma.scriptProviderLog.count(),
      this.prisma.scriptProviderLog.count({ where: { status: "FAILED" } }),
      this.prisma.scriptProviderLog.count({ where: { fallbackUsed: true } }),
    ]);

    return {
      providerJobs: {
        total: providerJobsTotal,
        failed: providerJobsFailed,
        fallback: providerJobsFallback,
      },
      scriptProviderLogs: {
        total: scriptLogsTotal,
        failed: scriptLogsFailed,
        fallback: scriptLogsFallback,
      },
    };
  }

  async contentPipelineSummary() {
    const [
      trends,
      scripts,
      videosDraft,
      videosScripted,
      videosRendering,
      videosModeration,
      videosApproved,
      videosPublished,
      videosRejected,
      videosFailed,
    ] = await Promise.all([
      this.prisma.trend.count(),
      this.prisma.script.count(),
      this.prisma.video.count({ where: { status: "DRAFT" } }),
      this.prisma.video.count({ where: { status: "SCRIPTED" } }),
      this.prisma.video.count({ where: { status: "RENDERING" } }),
      this.prisma.video.count({ where: { status: "MODERATION" } }),
      this.prisma.video.count({ where: { status: "APPROVED" } }),
      this.prisma.video.count({ where: { status: "PUBLISHED" } }),
      this.prisma.video.count({ where: { status: "REJECTED" } }),
      this.prisma.video.count({ where: { status: "FAILED" } }),
    ]);

    return {
      trends,
      scripts,
      videos: {
        draft: videosDraft,
        scripted: videosScripted,
        rendering: videosRendering,
        moderation: videosModeration,
        approved: videosApproved,
        published: videosPublished,
        rejected: videosRejected,
        failed: videosFailed,
      },
    };
  }

  // ✅ NEW: Batch 44 - Provider resilience evidence
  async providerResilienceEvidence() {
    const [success, failed, fallback] = await Promise.all([
      this.prisma.providerJobLog.count({ where: { status: "SUCCESS" } }),
      this.prisma.providerJobLog.count({ where: { status: "FAILED" } }),
      this.prisma.providerJobLog.count({ where: { status: "FALLBACK_USED" } }),
    ]);

    const recent = await this.prisma.providerJobLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
      include: {
        video: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return {
      generatedAt: new Date().toISOString(),
      summary: {
        success,
        failed,
        fallback,
      },
      recent,
    };
  }

  // ✅ NEW: Batch 45 - Metrics evidence
  async metricsEvidence() {
    const [
      moderationQueue,
      renderQueue,
      published,
      failedProviderJobs,
      fallbackProviderJobs,
      failedEvents,
      deadLetteredEvents,
    ] = await Promise.all([
      this.prisma.video.count({
        where: {
          status: "MODERATION",
          videoUrl: { not: null },
        },
      }),
      this.prisma.video.count({
        where: { status: "SCRIPTED" },
      }),
      this.prisma.video.count({
        where: { status: "PUBLISHED" },
      }),
      this.prisma.providerJobLog.count({
        where: { status: "FAILED" },
      }),
      this.prisma.providerJobLog.count({
        where: { fallbackUsed: true },
      }),
      this.prisma.eventProcessingLog.count({
        where: { status: "FAILED" },
      }),
      this.prisma.eventProcessingLog.count({
        where: { status: "DEAD_LETTERED" },
      }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      queues: {
        moderationQueue,
        renderQueue,
      },
      content: {
        published,
      },
      providers: {
        failedProviderJobs,
        fallbackProviderJobs,
      },
      events: {
        failedEvents,
        deadLetteredEvents,
      },
    };
  }
}
