import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ModerationController } from "./moderation.controller";
import { ModerationService } from "./moderation.service";
import { PrismaService } from "../../shared/prisma.service";
import { ServiceAuthMiddleware } from "../../shared/service-auth.middleware";

@Module({
  controllers: [ModerationController],
  providers: [ModerationService, PrismaService],
})
export class ModerationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ServiceAuthMiddleware).forRoutes("*");
  }
}
