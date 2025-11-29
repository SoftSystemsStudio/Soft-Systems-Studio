import request from 'supertest';
import request from 'supertest';

// set JWT env for tests
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.JWT_ALGORITHM = process.env.JWT_ALGORITHM ?? 'HS256';

// Ensure test DB URL is present for DB-backed integration tests. CI sets this.
process.env.POSTGRES_URL = process.env.POSTGRES_URL ?? 'postgresql://postgres:postgres@localhost:5432/agent_api_test';

// Run test setup (applies schema and connects prisma)
import '../setup';

// Mock qdrant and llm services used by protected endpoint to avoid external calls
jest.mock('../../src/services/qdrant', () => ({ querySimilar: jest.fn(async () => []) }));
jest.mock('../../src/services/llm', () => ({ chat: jest.fn(async () => 'echo') }));

import app from '../../src/index';

describe('Auth integration (DB-backed)', () => {
  it('onboarding -> login -> protected endpoint', async () => {
    // Onboarding: create workspace + admin user
    const onboardingRes = await request(app)
      .post('/api/v1/auth/create-workspace')
      .send({ workspaceName: 'Acme', adminEmail: 'owner@acme.test', adminPassword: 'pa$$word' })
      .expect(200);

    expect(onboardingRes.body.ok).toBe(true);
    expect(onboardingRes.body.workspaceId).toBeDefined();
    expect(onboardingRes.body.token).toBeDefined();

    // Create a real user to login
    // Use the same prisma client used by the app
    const { default: prisma } = await import('../../src/db');
    const bcrypt = (await import('bcryptjs')).default;
    const hashed = await bcrypt.hash('secret', 10);
    await prisma.user.create({ data: { email: 'existing@example.com', password: hashed } });

    // Login with real credentials
    const loginRes = await request(app).post('/api/v1/auth/login').send({ email: 'existing@example.com', password: 'secret' }).expect(200);
    expect(loginRes.body.token).toBeDefined();
    const token = loginRes.body.token;

    // Call protected run endpoint with token
    const runRes = await request(app)
      .post('/api/v1/agents/customer-service/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'hello' })
      .expect(200);

    expect(runRes.body.reply).toBeDefined();
  });
});
