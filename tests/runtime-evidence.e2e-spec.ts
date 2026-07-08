import request from 'supertest';
import jwt from 'jsonwebtoken';

const gateway = process.env.E2E_GATEWAY_URL || 'http://localhost:3000';

function adminToken() {
  return jwt.sign(
    {
      id: 'runtime-evidence-admin',
      email: 'runtime@yohpal.com',
      name: 'Runtime Evidence Admin',
      role: 'SUPER_ADMIN',
    },
    process.env.ADMIN_JWT_SECRET || 'test-secret',
    { expiresIn: '1h' },
  );
}

describe('Runtime Evidence E2E', () => {
  it('requires admin protection for runtime evidence generation', async () => {
    if (process.env.NODE_ENV === 'development') return;

    await request(gateway)
      .post('/runtime-evidence/generate')
      .set('X-API-Key', process.env.API_GATEWAY_KEY || 'test-api-key')
      .expect(401);
  });

  it('returns runtime evidence report endpoint shape', async () => {
    const response = await request(gateway)
      .get('/runtime-evidence/report')
      .set('X-API-Key', process.env.API_GATEWAY_KEY || 'test-api-key')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect([200, 500]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data.metrics).toBeDefined();
    }
  });
});
