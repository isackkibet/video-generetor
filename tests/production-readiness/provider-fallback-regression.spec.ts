import { runAuditedProviderStage } from '../../backend/shared/provider-stage-runner';

describe('Provider fallback regression tests', () => {
  const logger: any = {
    start: jest.fn().mockResolvedValue({ id: 'job-1' }),
    success: jest.fn().mockResolvedValue({}),
    fail: jest.fn().mockResolvedValue({})
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('records SUCCESS when provider succeeds', async () => {
    const result = await runAuditedProviderStage({
      logger,
      videoId: 'video-1',
      jobType: 'TTS',
      providerName: 'mock',
      serviceName: 'render-service',
      stage: 'tts',
      allowFallback: false,
      execute: async () => ({ audioUrl: 'ok.mp3' })
    });
    expect(result.fallbackUsed).toBe(false);
    expect(logger.success).toHaveBeenCalled();
  });
  it('records FALLBACK_USED when fallback is allowed', async () => {
    const result = await runAuditedProviderStage({
      logger,
      videoId: 'video-1',
      jobType: 'TTS',
      providerName: 'mock',
      serviceName: 'render-service',
      stage: 'tts',
      allowFallback: true,
      execute: async () => { throw new Error('provider failed'); },
      fallback: async () => ({ audioUrl: 'fallback.mp3' })
    });
    expect(result.fallbackUsed).toBe(true);
    expect(logger.fail).toHaveBeenCalledWith(
      expect.objectContaining({ fallbackUsed: true })
    );
  });
  it('records FAILED when fallback is disabled', async () => {
    await expect(
      runAuditedProviderStage({
        logger,
        videoId: 'video-1',
        jobType: 'TTS',
        providerName: 'real',
        serviceName: 'render-service',
        stage: 'tts',
        allowFallback: false,
        execute: async () => { throw new Error('provider failed'); }
      })
    ).rejects.toThrow('provider failed');
    expect(logger.fail).toHaveBeenCalledWith(
      expect.objectContaining({ fallbackUsed: false })
    );
  });
});
