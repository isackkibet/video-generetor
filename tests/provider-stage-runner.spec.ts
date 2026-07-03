import { runAuditedProviderStage } from "../backend/shared/provider-stage-runner";
describe("runAuditedProviderStage", () => {
  const logger: any = {
    start: jest.fn().mockResolvedValue({ id: "job-1" }),
    success: jest.fn().mockResolvedValue({}),
    fail: jest.fn().mockResolvedValue({}),
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("marks successful provider job as SUCCESS", async () => {
    const result = await runAuditedProviderStage({
      logger,
      videoId: "video-1",
      jobType: "TTS",
      providerName: "mock",
      serviceName: "test",
      stage: "tts",
      allowFallback: false,
      execute: async () => ({ audioUrl: "ok.mp3" }),
    });
    expect(result.fallbackUsed).toBe(false);
    expect(logger.success).toHaveBeenCalled();
    expect(logger.fail).not.toHaveBeenCalled();
  });
  it("uses fallback and records fallback when provider fails", async () => {
    const result = await runAuditedProviderStage({
      logger,
      videoId: "video-1",
      jobType: "TTS",
      providerName: "mock",
      serviceName: "test",
      stage: "tts",
      allowFallback: true,
      execute: async () => {
        throw new Error("provider down");
      },
      fallback: async () => ({ audioUrl: "fallback.mp3" }),
    });
    expect(result.fallbackUsed).toBe(true);
    expect(logger.fail).toHaveBeenCalledWith(
      expect.objectContaining({
        fallbackUsed: true,
      }),
    );
  });
  it("throws and records failure when fallback is disabled", async () => {
    await expect(
      runAuditedProviderStage({
        logger,
        videoId: "video-1",
        jobType: "TTS",
        providerName: "real",
        serviceName: "test",
        stage: "tts",
        allowFallback: false,
        execute: async () => {
          throw new Error("provider down");
        },
      }),
    ).rejects.toThrow("provider down");
    expect(logger.fail).toHaveBeenCalledWith(
      expect.objectContaining({
        fallbackUsed: false,
      }),
    );
  });
});
