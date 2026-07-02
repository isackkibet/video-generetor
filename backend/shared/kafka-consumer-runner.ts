import { createConsumer } from './kafka';
import { logError, logInfo } from './logger';

export async function startKafkaWorker<T>(input: {
  service: string;
  groupId: string;
  topics: string[];
  parse: (raw: string) => T;
  handle: (event: T) => Promise<void>;
}) {
  await createConsumer(input.groupId, input.topics, async ({ topic, message }) => {
    const raw = message.value?.toString();
    if (!raw) return;

    try {
      const event = input.parse(raw);
      logInfo({
        service: input.service,
        message: 'Kafka event received',
        metadata: { topic },
      });
      await input.handle(event);
    } catch (error) {
      logError({
        service: input.service,
        message: 'Kafka event handling failed',
        metadata: {
          topic,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  });
}
