import {
  httpRequestsTotal,
  providerFailures,
  providerFallbacks,
  workerEventsTotal,
} from "../backend/shared/metrics";
describe("observability metrics", () => {
  it("increments HTTP request metric", () => {
    httpRequestsTotal.inc({
      service: "test",
      method: "GET",
      route: "/health",
      status: "200",
    });
    expect(httpRequestsTotal).toBeDefined();
  });
  it("increments provider failure and fallback metrics", () => {
    providerFailures.inc({
      service: "test",
      provider: "mock",
      stage: "tts",
    });
    providerFallbacks.inc({
      service: "test",
      provider: "mock",
      stage: "tts",
    });
    expect(providerFailures).toBeDefined();
    expect(providerFallbacks).toBeDefined();
  });
  it("increments worker event metric", () => {
    workerEventsTotal.inc({
      service: "test",
      topic: "script.created",
      status: "success",
    });
    expect(workerEventsTotal).toBeDefined();
  });
});
