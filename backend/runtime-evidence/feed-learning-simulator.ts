import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";

const actions = ["view", "like", "save", "share", "skip", "complete"] as const;

type CategoryStats = { score: number; eventCount: number };

@Injectable()
export class FeedLearningSimulator {
  constructor(private readonly prisma: PrismaService) {}

  async simulateFeedLearning(userId = "runtime-demo-user") {
    const videos = await this.prisma.video.findMany({
      where: { status: "PUBLISHED" },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    let eventsCreated = 0;
    const categoryDeltas: Record<string, CategoryStats> = {};

    for (const video of videos) {
      for (const action of actions) {
        await this.prisma.feedEvent.create({
          data: {
            userId,
            videoId: video.id,
            action,
            watchMs: action === "skip" ? 1500 : 15000,
            region: "Nairobi",
            metadata: {
              source: "runtime-evidence",
            },
          },
        });
        eventsCreated++;
      }

      const existingDelta = categoryDeltas[video.category] ?? {
        score: 0,
        eventCount: 0,
      };
      categoryDeltas[video.category] = {
        score: existingDelta.score + 0.25,
        eventCount: existingDelta.eventCount + actions.length,
      };
    }

    const existingProfile = await this.prisma.userInterestProfile.findUnique({
      where: { userId },
    });

    const existingScores =
      (existingProfile?.categoryScores as Record<string, CategoryStats>) ?? {};

    const mergedScores: Record<string, CategoryStats> = { ...existingScores };
    for (const [category, delta] of Object.entries(categoryDeltas)) {
      const current = mergedScores[category] ?? { score: 0, eventCount: 0 };
      mergedScores[category] = {
        score: current.score + delta.score,
        eventCount: current.eventCount + delta.eventCount,
      };
    }

    await this.prisma.userInterestProfile.upsert({
      where: { userId },
      update: {
        categoryScores: mergedScores,
        lastUpdatedAt: new Date(),
      },
      create: {
        userId,
        categoryScores: mergedScores,
      },
    });

    const profiles = await this.prisma.userInterestProfile.count({
      where: { userId },
    });

    return {
      userId,
      videosUsed: videos.length,
      feedEventsCreated: eventsCreated,
      userInterestProfilesCreated: profiles,
    };
  }
}
