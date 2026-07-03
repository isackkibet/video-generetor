import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { publishEvent } from "./kafka";
import { KafkaTopics } from "../../contracts/kafka-events";
@Injectable()
export class EventAdminService {
  constructor(private readonly prisma: PrismaService) {}
  async listEvents(query: { topic?: string; status?: string; take?: number }) {
    return this.prisma.eventProcessingLog.findMany({
      where: {
        topic: query.topic,
        status: query.status,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: query.take || 100,
    });
  }
  async getEvent(idempotencyKey: string) {
    const event = await this.prisma.eventProcessingLog.findUnique({
      where: { idempotencyKey },
    });
    if (!event) {
      throw new NotFoundException(`Event not found: ${idempotencyKey}`);
    }
    return event;
  }
  async retryEvent(idempotencyKey: string) {
    const event = await this.getEvent(idempotencyKey);
    if (event.status !== "FAILED" && event.status !== "DEAD_LETTERED") {
      throw new Error(
        `Only FAILED or DEAD_LETTERED events can be retried. Current status: ${event.status}`,
      );
    }
    await publishEvent(
      event.topic,
      {
        ...(event.payload as Record<string, unknown>),
        idempotencyKey,
        retriedAt: new Date().toISOString(),
      },
      idempotencyKey,
    );
    return this.prisma.eventProcessingLog.update({
      where: { idempotencyKey },
      data: {
        status: "RETRIED",
        errorMessage: null,
      },
    });
  }
  async summary() {
    const [total, running, success, failed, retried, deadLettered] =
      await Promise.all([
        this.prisma.eventProcessingLog.count(),
        this.prisma.eventProcessingLog.count({ where: { status: "RUNNING" } }),
        this.prisma.eventProcessingLog.count({ where: { status: "SUCCESS" } }),
        this.prisma.eventProcessingLog.count({ where: { status: "FAILED" } }),
        this.prisma.eventProcessingLog.count({ where: { status: "RETRIED" } }),
        this.prisma.eventProcessingLog.count({
          where: { status: "DEAD_LETTERED" },
        }),
      ]);
    return {
      total,
      running,
      success,
      failed,
      retried,
      deadLettered,
    };
  }
  async exportEvidence() {
    const summary = await this.summary();
    const recentFailures = await this.prisma.eventProcessingLog.findMany({
      where: {
        status: {
          in: ["FAILED", "DEAD_LETTERED"],
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 50,
    });
    return {
      generatedAt: new Date().toISOString(),
      summary,
      recentFailures,
    };
  }
}
