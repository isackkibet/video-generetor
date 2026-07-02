import { createTrendSchema, feedEventSchema } from '../contracts/validation-schemas';

describe('runtime validation schemas', () => {
  it('accepts valid trend input', () => {
    const result = createTrendSchema.safeParse({
      topic: 'AI jobs for Kenyan youth',
      category: 'career',
      score: 90,
      growthRate: 10,
      source: 'internal',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid feed event action', () => {
    const result = feedEventSchema.safeParse({
      userId: 'demo-user',
      videoId: '00000000-0000-0000-0000-000000000000',
      action: 'hack',
    });
    expect(result.success).toBe(false);
  });
});
