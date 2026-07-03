import crypto from "crypto";

export function createIdempotencyKey(input: {
  topic: string;
  entityId: string;
  action: string;
}) {
  return crypto
    .createHash("sha256")
    .update(`${input.topic}:${input.entityId}:${input.action}`)
    .digest("hex");
}
