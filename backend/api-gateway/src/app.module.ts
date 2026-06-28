import { Module } from "@nestjs/common";
import { GatewayController } from "./gateway.controller";
import { GatewayService } from "./gateway.service";
import { ProviderJobQueryService } from "../../shared/provider-job-query.service";
import { PrismaService } from "../../shared/prisma.service";
@Module({
  controllers: [GatewayController],
  providers: [GatewayService, ProviderJobQueryService, PrismaService],
})
export class AppModule {}
