import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get("health")
  async health() {
    return {
      service: process.env.SERVICE_NAME || "yohpal-live-service",
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
  @Get("health/deep")
  async deepHealth() {
    const dbStartedAt = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - dbStartedAt;
    return {
      service: process.env.SERVICE_NAME || "yohpal-live-service",
      status: "ok",
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: "ok",
          latencyMs: dbLatencyMs,
        },
      },
    };
  }
}
