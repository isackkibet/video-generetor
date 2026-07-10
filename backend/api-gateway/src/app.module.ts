import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { GatewayController } from "./gateway.controller";
import { GatewayService } from "./gateway.service";
import { ProviderJobQueryService } from "../../shared/provider-job-query.service";
import { ScriptProviderQueryService } from "../../shared/script-provider-query.service";
import { ObservabilityQueryService } from "../../shared/observability-query.service";
import { EventAdminService } from "../../shared/event-admin.service";
import { BackupEvidenceService } from "../../shared/backup-evidence.service";
import { ReleaseGateService } from "../../shared/release-gate.service";
import { BlueprintCertificationService } from "../../shared/blueprint-certification.service";
import { ProgramManagementController } from "./program-management.controller";
import { RecoveryGovernanceController } from "./recovery-governance.controller";
import { ProductionDeploymentLockController } from "./production-deployment-lock.controller";
import { ProductionDeploymentLockService } from "../../shared/production-deployment-lock.service";
import { RecoveryGovernanceService } from "../../shared/recovery-governance.service";
import { ProgramManagementService } from "../../shared/program-management.service";
import { PrismaService } from "../../shared/prisma.service";
import { ApiGatewayKeyMiddleware } from "./api-key.middleware";
import { RequestIdMiddleware } from "../../shared/request-id.middleware";
import { RequestAuditMiddleware } from "../../shared/request-audit.middleware";
import { HttpMetricsMiddleware } from "../../shared/http-metrics.middleware";
import { HealthController } from "../../shared/health.controller";
import { MetricsController } from "../../shared/metrics.controller";
import { RolesGuard } from "../../shared/roles.guard";
import { AdminJwtGuard } from "../../shared/admin-jwt.guard";
import { ExecutiveEvidenceService } from "../../shared/executive-evidence.service";
import { RuntimeEvidenceController } from "../../runtime-evidence/runtime-evidence.controller";
import { V4ClosureController } from "./v4-closure.controller";
import { V4ClosureCertificationService } from "../../diagnostics/v4-closure-certification.service";
import { LaunchReadinessController } from "../../launch-validation/launch-readiness.controller";
import { ReleaseRecordController } from "../../release/release-record.controller";
import { ReleaseRecordService } from "../../release/release-record.service";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_TTL_SECONDS || 60),
        limit: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120),
      },
    ]),
  ],
  controllers: [
    GatewayController,
    HealthController,
    MetricsController,
    ProgramManagementController,
    RecoveryGovernanceController,
    ProductionDeploymentLockController,
    RuntimeEvidenceController,
    V4ClosureController,
    LaunchReadinessController, // <-- ADDED FOR BATCH 64
    ReleaseRecordController, // <-- ADDED FOR BATCH 65
  ],
  providers: [
    GatewayService,
    ProviderJobQueryService,
    ScriptProviderQueryService,
    ObservabilityQueryService,
    EventAdminService,
    BackupEvidenceService,
    ReleaseGateService,
    BlueprintCertificationService,
    ProgramManagementService,
    RecoveryGovernanceService,
    ProductionDeploymentLockService,
    ExecutiveEvidenceService,
    V4ClosureCertificationService,
    ReleaseRecordService, // <-- ADDED FOR BATCH 65
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
