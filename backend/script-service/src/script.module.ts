import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ScriptController } from "./script.controller";
import { ScriptService } from "./script.service";
import { PrismaService } from "../../shared/prisma.service";
import { ServiceAuthMiddleware } from "../../shared/service-auth.middleware";

@Module({
  controllers: [ScriptController],
  providers: [ScriptService, PrismaService],
})
export class ScriptModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ServiceAuthMiddleware).forRoutes("*");
  }
}
