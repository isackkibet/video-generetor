import request from 'supertest';

const baseUrl = process.env.E2E_GATEWAY_URL || 'http://localhost:3000';

describe('Gateway runtime validation', () => {
  it('rejects invalid create trend payload', async () => {
    await request(baseUrl)
      .post('/trends')
      .set('X-API-Key', process.env.API_GATEWAY_KEY || 'test-api-key')
      .send({
        topic: 'AI',
        category: 'career',
        score: 999,
        growthRate: 10,
        source: 'internal',
      })
      .expect(400);
  });

  it('rejects invalid seed feed query', async () => {
    await request(baseUrl)
      .get('/feed/seed?take=999')
      .set('X-API-Key', process.env.API_GATEWAY_KEY || 'test-api-key')
      .expect(400);
  });

  it('rejects invalid id parameter', async () => {
    await request(baseUrl)
      .get('/render/videos/not-a-uuid')
      .set('X-API-Key', process.env.API_GATEWAY_KEY || 'test-api-key')
      .expect(400);
  });
});
