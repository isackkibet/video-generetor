import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma.service";
import {
  calculateRankScore,
  freshnessScoreFromDate,
} from "../../shared/rank-score";
import { publishEvent } from "../../shared/kafka";
import { KafkaTopics } from "../../../contracts/kafka-events";
import {
  CreateFeedEventRequest,
  SeedFeedRequest,
} from "../../../contracts/api-contracts";
import { FeedLearningService } from "../../shared/feed-learning.service";
// ✅ Added: feed request duration metrics
import { feedRequestDurationMs } from "../../shared/metrics";

type RankedVideo = {
  id: string;
  title: string;
  category: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  region: string | null;
  country: string | null;
  language: string;
  publishedAt: Date | null;
  rankScore: number;
  viralProbability: number;
  scoreBreakdown: {
    engagementScore: number;
    interestScore: number;
    localityScore: number;
    freshnessScore: number;
    qualityScore: number;
    viralProbability: number;
  };
};

@Injectable()
export class RecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly feedLearningService: FeedLearningService,
  ) {}

  async getSeedFeed(input: SeedFeedRequest): Promise<RankedVideo[]> {
    // ✅ Record start time for feed latency metrics
    const startedAt = Date.now();

    const take = input.take && input.take > 0 ? Math.min(input.take, 100) : 30;

    const videos = await this.prisma.video.findMany({
      where: {
        status: "PUBLISHED",
        videoUrl: {
          not: null,
        },
        language: input.language || undefined,
        OR: [
          {
            region: input.region || undefined,
          },
          {
            country: input.country || undefined,
          },
          {
            region: null,
          },
        ],
      },
      include: {
        score: true,
        creator: true,
        feedEvents: {
          where: {
            userId: input.userId,
          },
          take: 20,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: take * 3,
    });

    const rankedVideos = await Promise.all(
      videos.map(async (video) => {
        // ✅ Learn category score from user history
        const learnedCategoryScore =
          await this.feedLearningService.getUserCategoryScore(
            input.userId,
            video.category,
          );

        const behaviorScore = this.estimateInterestScore({
          userEvents: video.feedEvents.map((event) => event.action),
        });

        // ✅ Combine learned and behavior scores
        const interestScore = this.clamp(
          learnedCategoryScore * 0.7 + behaviorScore * 0.3,
        );

        const localityScore = this.calculateLocalityScore({
          videoRegion: video.region,
          videoCountry: video.country,
          userRegion: input.region,
          userCountry: input.country,
        });

        const freshnessScore = freshnessScoreFromDate(video.publishedAt);

        const engagementScore =
          video.score?.engagementScore ??
          this.estimateEngagementFromEvents(video.feedEvents.length);

        const qualityScore =
          video.score?.qualityScore ??
          (video.creator?.trustScore ? video.creator.trustScore / 100 : 0.75);

        const viralProbability = video.score?.viralProbability ?? 0.7;

        const baseRankScore = calculateRankScore({
          engagementScore,
          interestScore,
          localityScore,
          freshnessScore,
          qualityScore,
        });

        const rankScore = this.applyViralBoost({
          baseRankScore,
          viralProbability,
        });

        return {
          id: video.id,
          title: video.title,
          category: video.category,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          durationSeconds: video.durationSeconds,
          region: video.region,
          country: video.country,
          language: video.language,
          publishedAt: video.publishedAt,
          rankScore: Number(rankScore.toFixed(4)),
          viralProbability,
          scoreBreakdown: {
            engagementScore,
            interestScore,
            localityScore,
            freshnessScore,
            qualityScore,
            viralProbability,
          },
        };
      }),
    );

    // ✅ Record feed request duration metric
    feedRequestDurationMs.observe(
      {
        service: "recommendation-service",
        region: input.region || "unknown",
        country: input.country || "unknown",
      },
      Date.now() - startedAt,
    );

    return rankedVideos
      .sort((a, b) => b.rankScore - a.rankScore)
      .slice(0, take);
  }

  async createFeedEvent(input: CreateFeedEventRequest) {
    const video = await this.prisma.video.findUnique({
      where: { id: input.videoId },
    });

    if (!video) {
      throw new NotFoundException(`Video not found: ${input.videoId}`);
    }

    const event = await this.prisma.feedEvent.create({
      data: {
        userId: input.userId,
        videoId: input.videoId,
        action: input.action,
        watchMs: input.watchMs,
        region: input.region,
        metadata: input.metadata as any,
      },
    });

    // ✅ Update user interest profile based on action
    await this.feedLearningService.updateUserInterest({
      userId: input.userId,
      videoId: input.videoId,
      action: input.action,
      watchMs: input.watchMs,
    });

    await publishEvent(
      KafkaTopics.FEED_EVENT_CREATED,
      {
        userId: event.userId,
        videoId: event.videoId,
        action: event.action,
        watchMs: event.watchMs,
        region: event.region,
      },
      `${event.userId}:${event.videoId}`,
    );

    return event;
  }

  // ✅ NEW: Get user feed diagnostics
  async getUserFeedDiagnostics(userId: string) {
    const profile = await this.prisma.userInterestProfile.findUnique({
      where: { userId },
    });

    const recentEvents = await this.prisma.feedEvent.findMany({
      where: { userId },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            category: true,
            region: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return {
      userId,
      profile,
      recentEvents,
    };
  }

  async getVideoById(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        script: true,
        creator: true,
        avatar: true,
        score: true,
        moderationLogs: true,
        renderMetadata: true,
        providerJobs: true,
      },
    });

    if (!video) {
      throw new NotFoundException(`Video not found: ${id}`);
    }

    return video;
  }

  private estimateInterestScore(input: { userEvents: string[] }): number {
    if (input.userEvents.length === 0) {
      return 0.72;
    }

    const positiveActions = ["like", "share", "comment", "save", "complete"];
    const negativeActions = ["skip"];

    let score = 0.72;
    for (const action of input.userEvents) {
      if (positiveActions.includes(action)) {
        score += 0.04;
      }
      if (negativeActions.includes(action)) {
        score -= 0.06;
      }
    }
    return this.clamp(score);
  }

  private calculateLocalityScore(input: {
    videoRegion: string | null;
    videoCountry: string | null;
    userRegion?: string;
    userCountry?: string;
  }): number {
    if (input.userRegion && input.videoRegion === input.userRegion) {
      return 1;
    }
    if (input.userCountry && input.videoCountry === input.userCountry) {
      return 0.85;
    }
    if (!input.videoRegion && !input.videoCountry) {
      return 0.6;
    }
    return 0.5;
  }

  private estimateEngagementFromEvents(eventCount: number): number {
    if (eventCount >= 20) return 0.9;
    if (eventCount >= 10) return 0.82;
    if (eventCount >= 5) return 0.76;
    return 0.7;
  }

  private applyViralBoost(input: {
    baseRankScore: number;
    viralProbability: number;
  }): number {
    const boost = input.viralProbability * 0.12;
    return this.clamp(input.baseRankScore + boost);
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
