import {
  httpRequestsTotal,
  providerFailures,
  providerFallbacks,
  workerEventsTotal
} from '../../backend/shared/metrics';

describe('Production observability metrics', () => {
  it('exposes HTTP request counter', () => {
    httpRequestsTotal.inc({
      service: 'api-gateway',
      method: 'GET',
      route: '/health',
      status: '200'
    });
    expect(httpRequestsTotal).toBeDefined();
  });
  it('exposes provider failure and fallback counters', () => {
    providerFailures.inc({
      service: 'render-service',
      provider: 'mock',
      stage: 'tts'
    });
    providerFallbacks.inc({
      service: 'render-service',
      provider: 'mock',
      stage: 'tts'
    });
    expect(providerFailures).toBeDefined();
    expect(providerFallbacks).toBeDefined();
  });
  it('exposes worker event counter', () => {
    workerEventsTotal.inc({
      service: 'script-service',
      topic: 'trend.discovered',
      status: 'success'
    });
    expect(workerEventsTotal).toBeDefined();
  });
});
