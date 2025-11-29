import request from 'supertest';
import bcrypt from 'bcryptjs';

// set JWT env for tests
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_ALGORITHM = 'HS256';

// Mock prisma and services
jest.mock('../../src/db', () => {
  return {
    workspace: {
      create: jest.fn(async ({ data }: any) => ({ id: 'ws1', name: data.name }))
    },
    user: {
      create: jest.fn(async ({ data }: any) => ({ id: 'u1', email: data.email, password: data.password })),
      findUnique: jest.fn(async ({ where }: any) => {
        if (where.email === 'existing@example.com') return { id: 'u2', email: 'existing@example.com', password: bcrypt.hashSync('secret', 10) };
        return null;
      })
    },
    workspaceMembership: {
      create: jest.fn(async ({ data }: any) => ({ id: 'm1', ...data })),
      findMany: jest.fn(async ({ where }: any) => {
        if (where.userId === 'u2') return [{ id: 'm2', workspaceId: 'ws1', userId: 'u2', role: 'admin' }];
        return [];
      })
    },
    conversation: {
      create: jest.fn(async ({ data }: any) => ({ id: 'c1', ...data }))
    },
    message: {
      createMany: jest.fn(async ({ data }: any) => data)
    }
  };
});

// Mock qdrant and llm services used by protected endpoint
jest.mock('../../src/services/qdrant', () => ({ querySimilar: jest.fn(async () => []) }));
jest.mock('../../src/services/llm', () => ({ chat: jest.fn(async () => 'echo') }));

import app from '../../src/index';

describe('Auth integration', () => {
  it('onboarding -> login -> protected endpoint', async () => {
    // Onboarding
    const onboardingRes = await request(app)
      .post('/api/v1/auth/create-workspace')
      .send({ workspaceName: 'Acme', adminEmail: 'owner@acme.test', adminPassword: 'pa$$word' })
      .expect(200);

    expect(onboardingRes.body.ok).toBe(true);
    expect(onboardingRes.body.workspaceId).toBeDefined();
    expect(onboardingRes.body.token).toBeDefined();

    // Simulate existing user login (mocked in prisma.findUnique)
    const loginRes = await request(app).post('/api/v1/auth/login').send({ email: 'existing@example.com', password: 'secret' }).expect(200);
    expect(loginRes.body.token).toBeDefined();
    const token = loginRes.body.token;

    // Call protected run endpoint with token
    const runRes = await request(app).post('/api/v1/agents/customer-service/run').set('Authorization', `Bearer ${token}`).send({ message: 'hello' }).expect(200);
    expect(runRes.body.reply).toBeDefined();
  });
});
