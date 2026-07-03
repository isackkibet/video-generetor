import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { RenderController } from "./render.controller";
import { RenderService } from "./render.service";
import { PrismaService } from "../../shared/prisma.service";
import { ServiceAuthMiddleware } from "../../shared/service-auth.middleware";
import { RequestIdMiddleware } from "../../shared/request-id.middleware";
import { HttpMetricsMiddleware } from "../../shared/http-metrics.middleware";
import { HealthController } from "../../shared/health.controller";

@Module({
  controllers: [RenderController, HealthController],
  providers: [RenderService, PrismaService],
})
export class RenderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, HttpMetricsMiddleware, ServiceAuthMiddleware)
      .forRoutes("*");
  }
}
