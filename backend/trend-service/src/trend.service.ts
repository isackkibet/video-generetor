import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma.service";
import { publishEvent } from "../../shared/kafka";
import { KafkaTopics } from "../../../contracts/kafka-events";
import { CreateTrendRequest } from "../../../contracts/api-contracts";
@Injectable()
export class TrendService {
  constructor(private readonly prisma: PrismaService) {}
  async createTrend(input: CreateTrendRequest) {
    const trend = await this.prisma.trend.create({
      data: {
        topic: input.topic,
        category: input.category,
        score: input.score,
        growthRate: input.growthRate,
        source: input.source,
        region: input.region,
        country: input.country,
        metadata: input.metadata,
      },
    });
    await publishEvent(
      KafkaTopics.TREND_DISCOVERED,
      {
        trendId: trend.id,
        topic: trend.topic,
        category: trend.category,
        score: trend.score,
        growthRate: trend.growthRate,
        region: trend.region,
        country: trend.country,
      },
      trend.id,
    );
    return trend;
  }
  async listTrends(params: {
    category?: string;
    region?: string;
    country?: string;
    take?: number;
  }) {
    return this.prisma.trend.findMany({
      where: {
        category: params.category,
        region: params.region,
        country: params.country,
      },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      take: params.take || 50,
    });
  }
  async getTrend(id: string) {
    return this.prisma.trend.findUnique({
      where: { id },
      include: {
        scripts: true,
      },
    });
  }
  async discoverSeedTrends() {
    const seedTrends: CreateTrendRequest[] = [
      {
        topic: "Top AI jobs students should learn in 2026",
        category: "career",
        region: "Nairobi",
        country: "Kenya",
        score: 92,
        growthRate: 18,
        source: "internal_seed",
        metadata: {
          audience: "students",
          format: "educational_short",
        },
      },
      {
        topic: "Funny Nairobi traffic survival tips",
        category: "comedy",
        region: "Nairobi",
        country: "Kenya",
        score: 88,
        growthRate: 12,
        source: "internal_seed",
        metadata: {
          audience: "urban_youth",
          format: "comedy_short",
        },
      },
      {
        topic: "How to start a small business with limited capital",
        category: "business",
        region: "Kenya",
        country: "Kenya",
        score: 86,
        growthRate: 10,
        source: "internal_seed",
        metadata: {
          audience: "hustlers",
          format: "business_tip",
        },
      },
      {
        topic: "One skill every campus student should master",
        category: "campus",
        region: "Kenya",
        country: "Kenya",
        score: 84,
        growthRate: 9,
        source: "internal_seed",
        metadata: {
          audience: "campus_students",
          format: "student_tip",
        },
      },
    ];
    const created = [];
    for (const trend of seedTrends) {
      created.push(await this.createTrend(trend));
    }
    return created;
  }
}
