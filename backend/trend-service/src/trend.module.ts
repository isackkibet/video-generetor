import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TrendController } from "./trend.controller";
import { TrendService } from "./trend.service";
import { PrismaService } from "../../shared/prisma.service";
import { ServiceAuthMiddleware } from "../../shared/service-auth.middleware";

@Module({
  controllers: [TrendController],
  providers: [TrendService, PrismaService],
})
export class TrendModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ServiceAuthMiddleware).forRoutes("*");
  }
}
