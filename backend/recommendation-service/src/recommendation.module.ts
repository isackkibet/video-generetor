import { Module } from "@nestjs/common";
import { RecommendationController } from "./recommendation.controller";
import { RecommendationService } from "./recommendation.service";
import { PrismaService } from "../../shared/prisma.service";
import { FeedLearningService } from "../../shared/feed-learning.service";
@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService, PrismaService, FeedLearningService],
})
export class RecommendationModule {}
