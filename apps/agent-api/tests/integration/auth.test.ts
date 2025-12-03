/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-call */
import request from 'supertest';
import type { PrismaClient } from '../../node_modules/.prisma/client';
import type bcryptType from 'bcryptjs';

// set JWT env for tests
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.JWT_ALGORITHM = process.env.JWT_ALGORITHM ?? 'HS256';

// Ensure test DB URL is present for DB-backed integration tests. CI sets this.
process.env.POSTGRES_URL =
  process.env.POSTGRES_URL ?? 'postgresql://postgres:postgres@localhost:5432/agent_api_test';

// Run test setup (applies schema and connects prisma)
import '../setup';

// Mock qdrant and llm services used by protected endpoint to avoid external calls
jest.mock('../src/services/qdrant', () => ({ querySimilar: jest.fn().mockResolvedValue([]) }));
jest.mock('../src/services/llm', () => ({ chat: jest.fn().mockResolvedValue('echo') }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const app = require('../src/index').default;

describe('Auth integration (DB-backed)', () => {
  it('onboarding -> login -> protected endpoint', async () => {
    // Onboarding: create workspace + admin user
    const onboardingRes = await request(app)
      .post('/api/v1/auth/create-workspace')
      .send({ workspaceName: 'Acme', adminEmail: 'owner@acme.test', adminPassword: 'pa$$word' })
      .expect(200);

    expect(onboardingRes.body.ok).toBe(true);
    expect(onboardingRes.body.workspaceId).toBeDefined();
    expect(onboardingRes.body.accessToken).toBeDefined();
    expect(onboardingRes.body.expiresAt).toBeDefined();

    // Create a real user to login
    // Use the same prisma client used by the app
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const prisma = require('../src/db').default as PrismaClient;
    const bcrypt = (await import('bcryptjs')).default as typeof bcryptType;
    const hashed = await bcrypt.hash('secret', 10);
    const testUser = await prisma.user.create({
      data: { email: 'existing@example.com', password: hashed },
    });

    // Create a workspace membership for the test user
    const testWorkspace = await prisma.workspace.create({ data: { name: 'TestWorkspace' } });
    await prisma.workspaceMembership.create({
      data: { workspaceId: testWorkspace.id, userId: testUser.id, role: 'admin' },
    });

    // Login with real credentials
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'existing@example.com', password: 'secret' })
      .expect(200);
    expect(loginRes.body.accessToken).toBeDefined();
    expect(loginRes.body.workspaceId).toBeDefined();
    expect(loginRes.body.role).toBe('admin');
    const token = loginRes.body.accessToken;

    // Call protected run endpoint with token
    const runRes = await request(app)
      .post('/api/v1/agents/customer-service/run')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'hello' })
      .expect(200);

    expect(runRes.body.reply).toBeDefined();
  });

  it('token refresh rotates tokens correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const prisma = require('../src/db').default as PrismaClient;
    const bcrypt = (await import('bcryptjs')).default as typeof bcryptType;

    // Create user and workspace
    const hashed = await bcrypt.hash('refresh-test', 10);
    const user = await prisma.user.create({
      data: { email: 'refresh-test@example.com', password: hashed },
    });
    const workspace = await prisma.workspace.create({ data: { name: 'RefreshTestWorkspace' } });
    await prisma.workspaceMembership.create({
      data: { workspaceId: workspace.id, userId: user.id, role: 'member' },
    });

    // Login to get tokens
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'refresh-test@example.com', password: 'refresh-test' })
      .expect(200);

    // Get refresh token from cookie
    const cookies = loginRes.headers['set-cookie'] as unknown as string[] | undefined;
    expect(cookies).toBeDefined();

    // Refresh the token
    const refreshRes = await request(app)
      .post('/api/v1/auth/token/refresh')
      .set('Cookie', cookies ?? [])
      .expect(200);

    expect(refreshRes.body.ok).toBe(true);
    expect(refreshRes.body.accessToken).toBeDefined();
    expect(refreshRes.body.accessToken).not.toBe(loginRes.body.accessToken); // New token issued
  });

  it('rejects expired tokens with proper error code', async () => {
    // Use an invalid/expired token
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxfQ.invalid';

    const res = await request(app)
      .post('/api/v1/agents/customer-service/run')
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({ message: 'hello' })
      .expect(401);

    expect(res.body.error).toBeDefined();
    expect(res.body.code).toBeDefined();
  });

  it('token revoke invalidates refresh token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const prisma = require('../src/db').default as PrismaClient;
    const bcrypt = (await import('bcryptjs')).default as typeof bcryptType;

    // Create user and workspace
    const hashed = await bcrypt.hash('revoke-test', 10);
    const user = await prisma.user.create({
      data: { email: 'revoke-test@example.com', password: hashed },
    });
    const workspace = await prisma.workspace.create({ data: { name: 'RevokeTestWorkspace' } });
    await prisma.workspaceMembership.create({
      data: { workspaceId: workspace.id, userId: user.id, role: 'member' },
    });

    // Login to get tokens
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'revoke-test@example.com', password: 'revoke-test' })
      .expect(200);

    const cookies = loginRes.headers['set-cookie'] as unknown as string[] | undefined;

    // Revoke the token;
    await request(app)
      .post('/api/v1/auth/token/revoke')
      .set('Cookie', cookies ?? [])
      .expect(200);

    // Try to refresh with revoked token - should fail
    const refreshRes = await request(app)
      .post('/api/v1/auth/token/refresh')
      .set('Cookie', cookies ?? [])
      .expect(401);

    expect(refreshRes.body.error).toBe('invalid_or_expired_refresh_token');
  });
});
