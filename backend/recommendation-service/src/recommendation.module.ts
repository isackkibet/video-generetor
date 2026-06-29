import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { RecommendationController } from "./recommendation.controller";
import { RecommendationService } from "./recommendation.service";
import { PrismaService } from "../../shared/prisma.service";
import { ServiceAuthMiddleware } from "../../shared/service-auth.middleware";

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService, PrismaService],
})
export class RecommendationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ServiceAuthMiddleware).forRoutes("*");
  }
}
