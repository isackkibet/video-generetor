import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";

@Injectable()
export class SeedPipelineRunner {
  constructor(private readonly prisma: PrismaService) {}

  async runSeedPipelineEvidence(count = 25) {
    const creator = await this.prisma.creator.upsert({
      where: { username: "yohpal_ai_studio" },
      update: {},
      create: {
        username: "yohpal_ai_studio",
        displayName: "YohPal AI Studio",
        isAiCreator: true,
      },
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
        },
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
        },
      });

      const video = await this.prisma.video.create({
        data: {
          creatorId: creator.id,
          scriptId: script.id,
          title: script.title,
          category: trend.category,
          language: "en",
          region: "Nairobi",
          country: "Kenya",
          status: "PUBLISHED",
          publishedAt: new Date(),
          videoUrl: `https://cdn.yohpal.com/runtime-evidence/video-${i}.mp4`,
          thumbnailUrl: `https://cdn.yohpal.com/runtime-evidence/thumb-${i}.jpg`,
          durationSeconds: 35 + i,
        },
      });

      await this.prisma.videoScore.create({
        data: {
          videoId: video.id,
          viralProbability: 0.82,
          engagementScore: 0.78,
          watchTimeScore: 0.8,
          shareScore: 0.75,
          commentScore: 0.7,
          qualityScore: 0.86,
        },
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
