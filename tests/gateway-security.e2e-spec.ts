import request from 'supertest';
import jwt from 'jsonwebtoken';

const baseUrl = process.env.E2E_GATEWAY_URL || 'http://localhost:3000';

function token(role: string) {
  return jwt.sign(
    {
      id: 'admin-test',
      email: 'admin@yohpal.com',
      name: 'Test Admin',
      role,
    },
    process.env.ADMIN_JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

describe('API Gateway Security E2E', () => {
  it('blocks protected route without API key outside development', async () => {
    if (process.env.NODE_ENV === 'development') return;
    await request(baseUrl).post('/pipeline/run-seed').expect(401);
  });

  it('blocks protected admin mutation without JWT', async () => {
    if (process.env.NODE_ENV === 'development') return;
    await request(baseUrl)
      .post('/pipeline/run-seed')
      .set('X-API-Key', process.env.API_GATEWAY_KEY || 'test-api-key')
      .expect(401);
  });

  it('blocks viewer from super admin pipeline route', async () => {
    if (process.env.NODE_ENV === 'development') return;
    await request(baseUrl)
      .post('/pipeline/run-seed')
      .set('X-API-Key', process.env.API_GATEWAY_KEY || 'test-api-key')
      .set('Authorization', `Bearer ${token('VIEWER')}`)
      .expect(403);
  });

  it('rejects malformed payload with validation error', async () => {
    await request(baseUrl)
      .post('/feed/events')
      .set('X-API-Key', process.env.API_GATEWAY_KEY || 'test-api-key')
      .send({
        userId: 'demo-user',
        videoId: 'not-a-uuid',
        action: 'hack',
      })
      .expect(400);
  });
});
