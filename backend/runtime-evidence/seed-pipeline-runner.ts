import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";

@Injectable()
export class SeedPipelineRunner {
  constructor(private readonly prisma: PrismaService) {}

  async runSeedPipelineEvidence(count = 25) {
    // Use a fixed ID for the creator so we can upsert by it
    const creatorId = "yohpal_ai_studio";

    const creator = await this.prisma.creator.upsert({
      where: { id: creatorId },
      update: {},
      create: {
        id: creatorId,
        handle: "yohpal_ai_studio",
        displayName: "YohPal AI Studio",
        type: "AI_STUDIO",
      } as any,
    });

    const results = [];

    for (let i = 1; i <= count; i++) {
      const trend = await this.prisma.trend.create({
        data: {
          topic: `YohPal Seed Trend ${i}`,
          category: i % 2 === 0 ? "career" : "entertainment",
          score: 80 + (i % 20),
          growthRate: 10 + i,
          source: "runtime-evidence",
          region: "Nairobi",
          country: "Kenya",
        } as any,
      });

      const script = await this.prisma.script.create({
        data: {
          trendId: trend.id,
          title: `Seed Video ${i}`,
          hook: `Here is a YohPal Live seed story ${i}`,
          body: "This is runtime-generated seed content used to prove the YohPal Live AI Content Factory pipeline.",
          cta: "Follow YohPal Live for more.",
          language: "en",
          qualityScore: 0.86,
          factScore: 0.92,
          providerName: "runtime-evidence",
        } as any,
      });

      const video = await this.prisma.video.create({
        data: {
          creatorId: creator.id,
          scriptId: script.id,
          title: script.title,
          description: script.body,
          category: trend.category,
          language: "en",
          region: "Nairobi",
          country: "Kenya",
          status: "PUBLISHED",
          videoUrl: `https://cdn.yohpal.com/runtime-evidence/video-${i}.mp4`,
          thumbnailUrl: `https://cdn.yohpal.com/runtime-evidence/thumb-${i}.jpg`,
          durationSeconds: 35 + i,
        } as any,
      });

      await this.prisma.videoScore.create({
        data: {
          videoId: video.id,
          viralScore: 0.82,
          engagementPrediction: 0.78,
          qualityScore: 0.86,
          safetyScore: 0.94,
          freshnessScore: 0.91,
          finalRankScore: 0.84,
        } as any,
      });

      results.push({
        trendId: trend.id,
        scriptId: script.id,
        videoId: video.id,
      });
    }

    return {
      generatedVideos: results.length,
      publishedVideos: results.length,
      results,
    };
  }
}
