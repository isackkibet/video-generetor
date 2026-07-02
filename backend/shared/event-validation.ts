import { ZodSchema } from 'zod';
import { logWarn } from './logger';

export function parseEvent<T>(input: {
  service: string;
  topic: string;
  raw: string;
  schema: ZodSchema<T>;
}): T {
  const json = JSON.parse(input.raw);
  const result = input.schema.safeParse(json);
  if (!result.success) {
    logWarn({
      service: input.service,
      message: 'Kafka event validation failed',
      metadata: {
        topic: input.topic,
        issues: result.error.issues,
      },
    });
    throw new Error(`Invalid Kafka event payload for topic ${input.topic}`);
  }
  return result.data;
}
