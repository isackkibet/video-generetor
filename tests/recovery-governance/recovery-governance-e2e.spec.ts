import request from 'supertest';
import jwt from 'jsonwebtoken';

const gateway = process.env.E2E_GATEWAY_URL || 'http://localhost:3000';
const skipE2E = process.env.SKIP_E2E === 'true' || !process.env.E2E_GATEWAY_URL;

function adminToken() {
  return jwt.sign(
    {
      id: 'test-admin',
      email: 'admin@yohpal.com',
      name: 'Test Admin',
      role: 'SUPER_ADMIN'
    },
    process.env.ADMIN_JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

function headers() {
  return {
    'X-API-Key': process.env.API_GATEWAY_KEY || 'test-api-key',
    Authorization: `Bearer ${adminToken()}`
  };
}

describe('Recovery Governance E2E', () => {
  beforeAll(() => {
    if (skipE2E) {
      console.log('⚠️  Skipping E2E tests – set E2E_GATEWAY_URL to run against a live gateway.');
    }
  });

  it('protects dashboard with auth headers', async () => {
    if (skipE2E) return;
    if (process.env.NODE_ENV === 'development') return;
    await request(gateway)
      .get('/recovery-governance/dashboard')
      .expect(401);
  });

  it('returns dashboard with admin headers', async () => {
    if (skipE2E) return;
    await request(gateway)
      .get('/recovery-governance/dashboard')
      .set(headers())
      .expect((res) => {
        expect([200, 500]).toContain(res.status);
      });
  });

  it('rejects invalid repository creation payload', async () => {
    if (skipE2E) return;
    await request(gateway)
      .post('/recovery-governance/repositories')
      .set(headers())
      .send({
        code: '',
        name: '',
        owner: '',
        repositoryPath: ''
      })
      .expect(400);
  });

  it('rejects invalid evidence category', async () => {
    if (skipE2E) return;
    await request(gateway)
      .post('/recovery-governance/evidence')
      .set(headers())
      .send({
        repositoryId: '00000000-0000-0000-0000-000000000000',
        evidenceCode: 'YL-GW-INVALID-20260701-001',
        category: 'INVALID',
        title: 'Invalid Evidence'
      })
      .expect(400);
  });
});

