import { ProviderJobLogger } from "./provider-job-logger";
import { providerFailures, providerFallbacks } from "./metrics";

export async function runAuditedProviderStage<T>(input: {
  logger: ProviderJobLogger;
  videoId?: string;
  jobType:
    | "LLM_SCRIPT"
    | "TTS"
    | "AVATAR_VIDEO"
    | "VIDEO_COMPOSITE"
    | "MODERATION";
  providerName: string;
  serviceName: string;
  stage: string;
  requestPayload?: Record<string, unknown>;
  execute: () => Promise<T>;
  fallback?: () => Promise<T>;
  allowFallback: boolean;
}): Promise<{ result: T; fallbackUsed: boolean }> {
  const job = await input.logger.start({
    videoId: input.videoId,
    jobType: input.jobType,
    providerName: input.providerName,
    requestPayload: input.requestPayload,
  });

  try {
    const result = await input.execute();
    await input.logger.success({
      jobId: job.id,
      responsePayload: result as Record<string, unknown>,
      fallbackUsed: false,
    });
    return { result, fallbackUsed: false };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown provider failure";

    providerFailures.inc({
      service: input.serviceName,
      provider: input.providerName,
      stage: input.stage,
    });

    if (input.allowFallback && input.fallback) {
      const result = await input.fallback();
      providerFallbacks.inc({
        service: input.serviceName,
        provider: input.providerName,
        stage: input.stage,
      });
      await input.logger.fail({
        jobId: job.id,
        errorMessage: message,
        fallbackUsed: true,
        responsePayload: result as Record<string, unknown>,
      });
      return { result, fallbackUsed: true };
    }

    await input.logger.fail({
      jobId: job.id,
      errorMessage: message,
      fallbackUsed: false,
    });
    throw error;
  }
}
