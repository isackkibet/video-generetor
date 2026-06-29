import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

type CategoryScores = Record<string, number>;

@Injectable()
export class FeedLearningService {
  constructor(private readonly prisma: PrismaService) {}

  async updateUserInterest(input: {
    userId: string;
    videoId: string;
    action: string;
    watchMs?: number | null;
  }) {
    const video = await this.prisma.video.findUnique({
      where: { id: input.videoId },
    });

    if (!video) return null;

    const category = video.category;
    const delta = this.calculateDelta(
      input.action,
      input.watchMs,
      video.durationSeconds,
    );

    const existing = await this.prisma.userInterestProfile.findUnique({
      where: { userId: input.userId },
    });

    const categoryScores = (existing?.categoryScores || {}) as CategoryScores;
    const current = categoryScores[category] || 0.72;

    categoryScores[category] = this.clamp(current + delta);

    return this.prisma.userInterestProfile.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        categoryScores,
        regionScores: video.region ? { [video.region]: 0.8 } : {},
        lastUpdatedAt: new Date(),
      },
      update: {
        categoryScores,
        lastUpdatedAt: new Date(),
      },
    });
  }

  async getUserCategoryScore(
    userId: string,
    category: string,
  ): Promise<number> {
    const profile = await this.prisma.userInterestProfile.findUnique({
      where: { userId },
    });
    const scores = (profile?.categoryScores || {}) as CategoryScores;
    return scores[category] || 0.72;
  }

  private calculateDelta(
    action: string,
    watchMs?: number | null,
    durationSeconds?: number | null,
  ): number {
    if (action === "like") return 0.08;
    if (action === "share") return 0.12;
    if (action === "save") return 0.1;
    if (action === "comment") return 0.09;
    if (action === "complete") return 0.07;
    if (action === "skip") return -0.1;

    if (action === "view" && watchMs && durationSeconds) {
      const completion = watchMs / (durationSeconds * 1000);
      if (completion >= 0.9) return 0.06;
      if (completion >= 0.6) return 0.03;
      if (completion < 0.25) return -0.05;
    }

    return 0.01;
  }

  private clamp(value: number): number {
    return Math.max(0.1, Math.min(1, value));
  }
}
