import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from "prom-client";

export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry, prefix: "yohpal_" });

export const httpRequestsTotal = new Counter({
  name: "yohpal_http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["service", "method", "route", "status"],
});

export const httpRequestsDurationMs = new Histogram({
  name: "yohpal_http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["service", "method", "route", "status"],
  buckets: [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
});

export const workerEventsTotal = new Counter({
  name: "yohpal_worker_events_total",
  help: "Worker events processed",
  labelNames: ["service", "topic", "status"],
});

export const workerEventDurationMs = new Histogram({
  name: "yohpal_worker_event_duration_ms",
  help: "Worker event processing duration in milliseconds",
  labelNames: ["service", "topic", "status"],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 15000, 30000],
});

export const providerFailures = new Counter({
  name: "yohpal_provider_failures_total",
  help: "Provider failures",
  labelNames: ["service", "provider", "stage"],
});

export const providerFallbacks = new Counter({
  name: "yohpal_provider_fallbacks_total",
  help: "Provider fallbacks",
  labelNames: ["service", "provider", "stage"],
});

export const moderationQueueSize = new Gauge({
  name: "yohpal_moderation_queue_size",
  help: "Number of videos currently waiting for moderation",
  labelNames: ["service"],
});

export const renderQueueSize = new Gauge({
  name: "yohpal_render_queue_size",
  help: "Number of videos currently waiting for rendering",
  labelNames: ["service"],
});

export const feedRequestDurationMs = new Histogram({
  name: "yohpal_feed_request_duration_ms",
  help: "Feed generation duration in milliseconds",
  labelNames: ["service", "region", "country"],
  buckets: [25, 50, 100, 250, 500, 1000, 2500, 5000],
});

export const publishedVideosTotal = new Counter({
  name: "yohpal_published_videos_total",
  help: "Total published videos",
  labelNames: ["service", "category", "country"],
});

[
  httpRequestsTotal,
  httpRequestsDurationMs,
  workerEventsTotal,
  workerEventDurationMs,
  providerFailures,
  providerFallbacks,
  moderationQueueSize,
  renderQueueSize,
  feedRequestDurationMs,
  publishedVideosTotal,
].forEach((metric) => {
  metricsRegistry.registerMetric(metric);
});
