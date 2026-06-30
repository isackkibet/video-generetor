import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ModerationController } from "./moderation.controller";
import { ModerationService } from "./moderation.service";
import { PrismaService } from "../../shared/prisma.service";
import { ServiceAuthMiddleware } from "../../shared/service-auth.middleware";
import { RequestIdMiddleware } from "../../shared/request-id.middleware";
import { HealthController } from "../../shared/health.controller";

@Module({
  controllers: [ModerationController, HealthController],
  providers: [ModerationService, PrismaService],
})
export class ModerationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, ServiceAuthMiddleware).forRoutes("*");
  }
}
