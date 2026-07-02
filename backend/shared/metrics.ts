import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestDuration = new Histogram({
  name: 'yohpal_http_request_duration_ms',
  help: 'HTTP request duration in ms',
  labelNames: ['service', 'method', 'route', 'status'],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000],
});

export const providerFailures = new Counter({
  name: 'yohpal_provider_failures_total',
  help: 'Provider failure counter',
  labelNames: ['service', 'provider', 'stage'],
});

export const providerFallbacks = new Counter({
  name: 'yohpal_provider_fallbacks_total',
  help: 'Provider fallback counter',
  labelNames: ['service', 'provider', 'stage'],
});

export const pipelineQueueGauge = new Gauge({
  name: 'yohpal_pipeline_queue_size',
  help: 'Pipeline queue size',
  labelNames: ['service', 'queue'],
});

metricsRegistry.registerMetric(httpRequestDuration);
metricsRegistry.registerMetric(providerFailures);
metricsRegistry.registerMetric(providerFallbacks);
metricsRegistry.registerMetric(pipelineQueueGauge);
