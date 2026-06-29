import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { RecommendationController } from "./recommendation.controller";
import { RecommendationService } from "./recommendation.service";
import { PrismaService } from "../../shared/prisma.service";
// ✅ Add import for FeedLearningService
import { FeedLearningService } from "../../shared/feed-learning.service";
import { ServiceAuthMiddleware } from "../../shared/service-auth.middleware";

@Module({
  controllers: [RecommendationController],
  // ✅ Add FeedLearningService to providers
  providers: [RecommendationService, PrismaService, FeedLearningService],
})
export class RecommendationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ServiceAuthMiddleware).forRoutes("*");
  }
}
