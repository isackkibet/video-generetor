import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { RenderController } from "./render.controller";
import { RenderService } from "./render.service";
import { PrismaService } from "../../shared/prisma.service";
import { ServiceAuthMiddleware } from "../../shared/service-auth.middleware";

@Module({
  controllers: [RenderController],
  providers: [RenderService, PrismaService],
})
export class RenderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ServiceAuthMiddleware).forRoutes("*");
  }
}
