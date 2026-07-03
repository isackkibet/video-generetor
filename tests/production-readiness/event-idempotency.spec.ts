import { createIdempotencyKey } from '../../backend/shared/idempotency';

describe('Event-processing idempotency', () => {
  it('creates stable idempotency keys', () => {
    const first = createIdempotencyKey({
      topic: 'script.created',
      entityId: '00000000-0000-0000-0000-000000000000',
      action: 'render'
    });
    const second = createIdempotencyKey({
      topic: 'script.created',
      entityId: '00000000-0000-0000-0000-000000000000',
      action: 'render'
    });
    expect(first).toBe(second);
    expect(first.length).toBe(64);
  });
  it('creates different keys for different actions', () => {
    const render = createIdempotencyKey({
      topic: 'script.created',
      entityId: '00000000-0000-0000-0000-000000000000',
      action: 'render'
    });
    const moderate = createIdempotencyKey({
      topic: 'script.created',
      entityId: '00000000-0000-0000-0000-000000000000',
      action: 'moderate'
    });
    expect(render).not.toBe(moderate);
  });
});
