import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ScriptController } from "./script.controller";
import { ScriptService } from "./script.service";
import { PrismaService } from "../../shared/prisma.service";
import { ServiceAuthMiddleware } from "../../shared/service-auth.middleware";
import { RequestIdMiddleware } from "../../shared/request-id.middleware";
import { HealthController } from "../../shared/health.controller";

@Module({
  controllers: [ScriptController, HealthController],
  providers: [ScriptService, PrismaService],
})
export class ScriptModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, ServiceAuthMiddleware).forRoutes("*");
  }
}
