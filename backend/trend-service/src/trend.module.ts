import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TrendController } from "./trend.controller";
import { TrendService } from "./trend.service";
import { PrismaService } from "../../shared/prisma.service";
import { ServiceAuthMiddleware } from "../../shared/service-auth.middleware";
import { RequestIdMiddleware } from "../../shared/request-id.middleware";
import { HealthController } from "../../shared/health.controller";

@Module({
  controllers: [TrendController, HealthController],
  providers: [TrendService, PrismaService],
})
export class TrendModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, ServiceAuthMiddleware).forRoutes("*");
  }
}
