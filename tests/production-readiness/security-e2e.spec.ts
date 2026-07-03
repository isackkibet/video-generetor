import request from 'supertest';
import jwt from 'jsonwebtoken';

const gateway = process.env.E2E_GATEWAY_URL || 'http://localhost:3000';

function sign(role: string) {
  return jwt.sign(
    { id: 'test-admin', email: 'admin@yohpal.com', name: 'Test Admin', role },
    process.env.ADMIN_JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

describe('Gateway production security regression', () => {
  it('blocks mutation without admin JWT outside development', async () => {
    if (process.env.NODE_ENV === 'development') return;
    await request(gateway)
      .post('/pipeline/run-seed')
      .set('X-API-Key', process.env.API_GATEWAY_KEY || 'test-api-key')
      .expect(401);
  });
  it('blocks viewer from super admin action outside development', async () => {
    if (process.env.NODE_ENV === 'development') return;
    await request(gateway)
      .post('/pipeline/run-seed')
      .set('X-API-Key', process.env.API_GATEWAY_KEY || 'test-api-key')
      .set('Authorization', `Bearer ${sign('VIEWER')}`)
      .expect(403);
  });
  it('rejects malformed payload', async () => {
    await request(gateway)
      .post('/feed/events')
      .set('X-API-Key', process.env.API_GATEWAY_KEY || 'test-api-key')
      .send({ userId: 'demo-user', videoId: 'not-a-uuid', action: 'hack' })
      .expect(400);
  });
});
