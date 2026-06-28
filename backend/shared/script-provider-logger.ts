import { PrismaService } from "./prisma.service";

export type ScriptProviderStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "FALLBACK_USED";

export class ScriptProviderLogger {
  constructor(private readonly prisma: PrismaService) {}

  async start(input: {
    trendId?: string;
    providerName: string;
    requestPayload?: Record<string, unknown>;
  }) {
    return this.prisma.scriptProviderLog.create({
      data: {
        trendId: input.trendId,
        providerName: input.providerName,
        status: "RUNNING",
        // ✅ Fixed: Use 'as any' to bypass Prisma type checking
        requestPayload: input.requestPayload as any,
      },
    });
  }

  async success(input: {
    logId: string;
    scriptId?: string;
    responsePayload?: Record<string, unknown>;
    fallbackUsed?: boolean;
  }) {
    return this.prisma.scriptProviderLog.update({
      where: { id: input.logId },
      data: {
        scriptId: input.scriptId,
        status: input.fallbackUsed ? "FALLBACK_USED" : "SUCCESS",
        // ✅ Fixed: Use 'as any' to bypass Prisma type checking
        responsePayload: input.responsePayload as any,
        fallbackUsed: input.fallbackUsed || false,
        completedAt: new Date(),
      },
    });
  }

  async fail(input: {
    logId: string;
    errorMessage: string;
    responsePayload?: Record<string, unknown>;
    fallbackUsed?: boolean;
  }) {
    return this.prisma.scriptProviderLog.update({
      where: { id: input.logId },
      data: {
        status: input.fallbackUsed ? "FALLBACK_USED" : "FAILED",
        errorMessage: input.errorMessage,
        // ✅ Fixed: Use 'as any' to bypass Prisma type checking
        responsePayload: input.responsePayload as any,
        fallbackUsed: input.fallbackUsed || false,
        completedAt: new Date(),
      },
    });
  }
}
