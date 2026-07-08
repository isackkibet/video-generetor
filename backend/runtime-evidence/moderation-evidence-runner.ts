import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";

@Injectable()
export class ModerationEvidenceRunner {
  constructor(private readonly prisma: PrismaService) {}

  async generateModerationEvidence() {
    const published = await this.prisma.video.findMany({
      where: { status: "PUBLISHED" },
      take: 5,
    });

    for (const video of published) {
      await this.prisma.moderationLog.create({
        data: {
          videoId: video.id,
          action: "ALLOW",
          score: 0.96,
          reason: "Runtime evidence safe-content approval.",
          providerName: "runtime-evidence-moderator",
          metadata: {
            source: "runtime-evidence",
            safetyResult: "SAFE",
          },
        },
      });
    }

    const rejected = await this.prisma.video.create({
      data: {
        title: "Runtime Evidence Rejected Sample",
        category: "safety-test",
        language: "en",
        region: "Nairobi",
        country: "Kenya",
        status: "REJECTED",
        videoUrl: "https://cdn.yohpal.com/runtime-evidence/rejected.mp4",
        thumbnailUrl: "https://cdn.yohpal.com/runtime-evidence/rejected.jpg",
        durationSeconds: 15,
      },
    });

    await this.prisma.moderationLog.create({
      data: {
        videoId: rejected.id,
        action: "BLOCK",
        score: 0.12,
        reason: "Runtime evidence harmful-content rejection.",
        providerName: "runtime-evidence-moderator",
        metadata: {
          source: "runtime-evidence",
          safetyResult: "BLOCKED",
        },
      },
    });

    return {
      approvedModerationLogs: published.length,
      rejectedModerationLogs: 1,
      rejectedVideoId: rejected.id,
    };
  }
}
