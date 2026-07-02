import { ProviderJobLogger } from '../../shared/provider-job-logger';
import { providerFailures, providerFallbacks } from '../../shared/metrics';

export async function runProviderStage<T>(input: {
  logger: ProviderJobLogger;
  videoId: string;
  jobType: 'TTS' | 'AVATAR_VIDEO' | 'VIDEO_COMPOSITE' | 'MODERATION';
  providerName: string;
  stage: string;
  requestPayload: Record<string, unknown>;
  execute: () => Promise<T>;
  fallback?: () => Promise<T>;
  allowFallback: boolean;
}): Promise<T> {
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
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown provider failure';

    providerFailures.inc({
      service: 'render-service',
      provider: input.providerName,
      stage: input.stage,
    });

    if (input.allowFallback && input.fallback) {
      const fallbackResult = await input.fallback();
      providerFallbacks.inc({
        service: 'render-service',
        provider: input.providerName,
        stage: input.stage,
      });
      await input.logger.fail({
        jobId: job.id,
        errorMessage: message,
        fallbackUsed: true,
        responsePayload: fallbackResult as Record<string, unknown>,
      });
      return fallbackResult;
    }

    await input.logger.fail({
      jobId: job.id,
      errorMessage: message,
      fallbackUsed: false,
    });
    throw error;
  }
}
