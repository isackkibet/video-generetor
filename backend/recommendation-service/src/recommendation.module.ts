import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { RecommendationController } from "./recommendation.controller";
import { RecommendationService } from "./recommendation.service";
import { PrismaService } from "../../shared/prisma.service";
import { FeedLearningService } from "../../shared/feed-learning.service";
import { ServiceAuthMiddleware } from "../../shared/service-auth.middleware";
import { RequestIdMiddleware } from "../../shared/request-id.middleware";
import { HealthController } from "../../shared/health.controller";

@Module({
  controllers: [RecommendationController, HealthController],
  providers: [RecommendationService, PrismaService, FeedLearningService],
})
export class RecommendationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, ServiceAuthMiddleware).forRoutes("*");
  }
}
