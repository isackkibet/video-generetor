import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { GatewayController } from "./gateway.controller";
import { GatewayService } from "./gateway.service";
import { ProviderJobQueryService } from "../../shared/provider-job-query.service";
import { ScriptProviderQueryService } from "../../shared/script-provider-query.service";
import { PrismaService } from "../../shared/prisma.service";
import { ApiGatewayKeyMiddleware } from "./api-key.middleware";
import { RequestIdMiddleware } from "../../shared/request-id.middleware";
import { HealthController } from "../../shared/health.controller";
// ✅ Added: ObservabilityQueryService import
import { ObservabilityQueryService } from "../../shared/observability-query.service";

@Module({
  controllers: [GatewayController, HealthController],
  providers: [
    GatewayService,
    ProviderJobQueryService,
    ScriptProviderQueryService,
    PrismaService,
    ObservabilityQueryService, // ✅ Added
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, ApiGatewayKeyMiddleware).forRoutes("*");
  }
}
