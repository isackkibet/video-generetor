export type LogLevel = "info" | "warn" | "error" | "debug";
export type LogPayload = {
  service: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  videoId?: string;
  providerName?: string;
  metadata?: Record<string, unknown>;
};
export function log(payload: LogPayload) {
  const entry = {
    timestamp: new Date().toISOString(),
    service: payload.service,
    level: payload.level,
    message: payload.message,
    requestId: payload.requestId,
    userId: payload.userId,
    videoId: payload.videoId,
    providerName: payload.providerName,
    metadata: payload.metadata || {},
  };
  console.log(JSON.stringify(entry));
}
export function logInfo(payload: Omit<LogPayload, "level">) {
  log({ ...payload, level: "info" });
}
export function logWarn(payload: Omit<LogPayload, "level">) {
  log({ ...payload, level: "warn" });
}
export function logError(payload: Omit<LogPayload, "level">) {
  log({ ...payload, level: "error" });
}
