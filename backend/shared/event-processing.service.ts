import { PrismaService } from "./prisma.service";

export class EventProcessingService {
  constructor(private readonly prisma: PrismaService) {}

  async alreadyProcessed(idempotencyKey: string) {
    const existing = await this.prisma.eventProcessingLog.findUnique({
      where: { idempotencyKey },
    });
    return existing?.status === "SUCCESS";
  }

  async start(input: {
    idempotencyKey: string;
    topic: string;
    payload: unknown;
  }) {
    return this.prisma.eventProcessingLog.upsert({
      where: { idempotencyKey: input.idempotencyKey },
      create: {
        idempotencyKey: input.idempotencyKey,
        topic: input.topic,
        status: "RUNNING",
        attempts: 1,
        payload: input.payload as any,
      },
      update: {
        status: "RUNNING",
        attempts: { increment: 1 },
        errorMessage: null,
      },
    });
  }

  async success(idempotencyKey: string) {
    return this.prisma.eventProcessingLog.update({
      where: { idempotencyKey },
      data: { status: "SUCCESS", errorMessage: null },
    });
  }

  async fail(input: { idempotencyKey: string; errorMessage: string }) {
    return this.prisma.eventProcessingLog.update({
      where: { idempotencyKey: input.idempotencyKey },
      data: { status: "FAILED", errorMessage: input.errorMessage },
    });
  }
}
