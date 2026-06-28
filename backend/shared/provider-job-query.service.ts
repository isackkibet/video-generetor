import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
export type ProviderJobQuery = {
  videoId?: string;
  jobType?:
    | "LLM_SCRIPT"
    | "TTS"
    | "AVATAR_VIDEO"
    | "VIDEO_COMPOSITE"
    | "MODERATION";
  providerName?: string;
  status?: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "FALLBACK_USED";
  fallbackUsed?: boolean;
  take?: number;
};
@Injectable()
export class ProviderJobQueryService {
  constructor(private readonly prisma: PrismaService) {}
  async listProviderJobs(query: ProviderJobQuery) {
    return this.prisma.providerJobLog.findMany({
      where: {
        videoId: query.videoId,
        jobType: query.jobType,
        providerName: query.providerName,
        status: query.status,
        fallbackUsed: query.fallbackUsed,
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            videoUrl: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      take: query.take || 100,
    });
  }
  async getProviderJob(id: string) {
    return this.prisma.providerJobLog.findUnique({
      where: { id },
      include: {
        video: {
          include: {
            script: true,
            renderMetadata: true,
            moderationLogs: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });
  }
  async getProviderJobSummary() {
    const [total, failed, fallback, running, success] = await Promise.all([
      this.prisma.providerJobLog.count(),
      this.prisma.providerJobLog.count({ where: { status: "FAILED" } }),
      this.prisma.providerJobLog.count({ where: { fallbackUsed: true } }),
      this.prisma.providerJobLog.count({ where: { status: "RUNNING" } }),
      this.prisma.providerJobLog.count({ where: { status: "SUCCESS" } }),
    ]);
    return {
      total,
      success,
      failed,
      fallback,
      running,
    };
  }
}
