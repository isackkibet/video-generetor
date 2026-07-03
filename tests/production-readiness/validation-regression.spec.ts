import {
  createTrendSchema,
  feedEventSchema,
  seedFeedQuerySchema,
  renderVideoSchema
} from '../../contracts/validation-schemas';

describe('Runtime validation regression tests', () => {
  it('rejects invalid trend score', () => {
    const result = createTrendSchema.safeParse({
      topic: 'AI jobs',
      category: 'career',
      score: 999,
      growthRate: 1,
      source: 'internal'
    });
    expect(result.success).toBe(false);
  });
  it('rejects invalid feed action', () => {
    const result = feedEventSchema.safeParse({
      userId: 'demo-user',
      videoId: '00000000-0000-0000-0000-000000000000',
      action: 'illegal_action'
    });
    expect(result.success).toBe(false);
  });
  it('rejects oversized feed request', () => {
    const result = seedFeedQuerySchema.safeParse({
      userId: 'demo-user',
      take: '1000'
    });
    expect(result.success).toBe(false);
  });
  it('rejects invalid render video id', () => {
    const result = renderVideoSchema.safeParse({
      videoId: 'not-a-uuid'
    });
    expect(result.success).toBe(false);
  });
});
