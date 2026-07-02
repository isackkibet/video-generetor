import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ProviderJobQueryService } from '../../shared/provider-job-query.service';
import { ScriptProviderQueryService } from '../../shared/script-provider-query.service';
import { ObservabilityQueryService } from '../../shared/observability-query.service';
import { PrismaService } from '../../shared/prisma.service';
import { ApiGatewayKeyMiddleware } from './api-key.middleware';
import { RequestIdMiddleware } from '../../shared/request-id.middleware';
import { RequestAuditMiddleware } from '../../shared/request-audit.middleware';
import { HealthController } from '../../shared/health.controller';
import { MetricsController } from '../../shared/metrics.controller';

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
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, RequestAuditMiddleware, ApiGatewayKeyMiddleware)
      .forRoutes('*');
  }
}
