import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { GatewayController } from "./gateway.controller";
import { GatewayService } from "./gateway.service";
import { ProviderJobQueryService } from "../../shared/provider-job-query.service";
import { ScriptProviderQueryService } from "../../shared/script-provider-query.service";
import { ObservabilityQueryService } from "../../shared/observability-query.service";
import { EventAdminService } from "../../shared/event-admin.service";
import { BackupEvidenceService } from "../../shared/backup-evidence.service"; // ✅ Added Batch 46
import { PrismaService } from "../../shared/prisma.service";
import { ApiGatewayKeyMiddleware } from "./api-key.middleware";
import { RequestIdMiddleware } from "../../shared/request-id.middleware";
import { RequestAuditMiddleware } from "../../shared/request-audit.middleware";
import { HttpMetricsMiddleware } from "../../shared/http-metrics.middleware";
import { HealthController } from "../../shared/health.controller";
import { MetricsController } from "../../shared/metrics.controller";
import { RolesGuard } from "../../shared/roles.guard";
import { AdminJwtGuard } from "../../shared/admin-jwt.guard";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_TTL_SECONDS || 60),
        limit: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120),
      },
    ]),
  ],
  controllers: [GatewayController, HealthController, MetricsController],
  providers: [
    GatewayService,
    ProviderJobQueryService,
    ScriptProviderQueryService,
    ObservabilityQueryService,
    EventAdminService,
    BackupEvidenceService, // ✅ Added Batch 46
    PrismaService,
    RolesGuard,
    AdminJwtGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        RequestIdMiddleware,
        RequestAuditMiddleware,
        HttpMetricsMiddleware,
        ApiGatewayKeyMiddleware,
      )
      .forRoutes("*");
  }
}
