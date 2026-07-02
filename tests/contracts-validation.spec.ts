import {
  createTrendSchema,
  feedEventSchema,
  generateScriptSchema,
  kafkaTrendDiscoveredSchema,
  kafkaScriptCreatedSchema,
  kafkaVideoRenderedSchema,
  seedFeedQuerySchema,
} from '../contracts/validation-schemas';

describe('HTTP request validation contracts', () => {
  it('validates create trend request', () => {
    expect(
      createTrendSchema.safeParse({
        topic: 'AI jobs in Kenya',
        category: 'career',
        score: 90,
        growthRate: 12,
        source: 'internal',
      }).success
    ).toBe(true);
  });

  it('rejects invalid trend score', () => {
    expect(
      createTrendSchema.safeParse({
        topic: 'AI',
        category: 'career',
        score: 200,
        growthRate: 12,
        source: 'internal',
      }).success
    ).toBe(false);
  });

  it('validates generate script request', () => {
    expect(
      generateScriptSchema.safeParse({
        trendId: '00000000-0000-0000-0000-000000000000',
      }).success
    ).toBe(true);
  });

  it('rejects invalid feed event action', () => {
    expect(
      feedEventSchema.safeParse({
        userId: 'demo-user',
        videoId: '00000000-0000-0000-0000-000000000000',
        action: 'hack',
      }).success
    ).toBe(false);
  });

  it('coerces seed feed take query', () => {
    const parsed = seedFeedQuerySchema.parse({
      userId: 'demo-user',
      take: '20',
    });
    expect(parsed.take).toBe(20);
  });
});

describe('Kafka event validation contracts', () => {
  it('validates trend discovered event', () => {
    expect(
      kafkaTrendDiscoveredSchema.safeParse({
        trendId: '00000000-0000-0000-0000-000000000000',
        topic: 'AI careers',
        category: 'career',
        score: 88,
        growthRate: 10,
      }).success
    ).toBe(true);
  });

  it('validates script created event', () => {
    expect(
      kafkaScriptCreatedSchema.safeParse({
        scriptId: '00000000-0000-0000-0000-000000000000',
        trendId: '00000000-0000-0000-0000-000000000000',
        title: 'AI careers',
        qualityScore: 0.82,
        factScore: 0.9,
      }).success
    ).toBe(true);
  });

  it('validates video rendered event', () => {
    expect(
      kafkaVideoRenderedSchema.safeParse({
        videoId: '00000000-0000-0000-0000-000000000000',
        videoUrl: 'https://cdn.yohpal.com/video.mp4',
        thumbnailUrl: 'https://cdn.yohpal.com/thumb.jpg',
        durationSeconds: 45,
      }).success
    ).toBe(true);
  });
});
