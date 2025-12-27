import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';

import prisma from '../../db';
import { rateLimitRun } from '../../middleware/rateLimitRun';
import { validateBody } from '../../middleware/validateBody';
import { runRequestSchema } from '../../schemas/run';
import { runController } from '../runController';

const shouldRun =
  process.env.RUN_INTEGRATION_TESTS === 'true' &&
  (!!process.env.POSTGRES_URL || !!process.env.DATABASE_URL || !!process.env.POSTGRESQL_URL);

const describeIf = shouldRun ? describe : describe.skip;

describeIf('runController integration (DB persistence)', () => {
  const app = express();
  app.use(bodyParser.json());
  // attach minimal authPrincipal
  app.use((req: express.Request & { authPrincipal?: { userId: string } }, _res, next) => {
    req.authPrincipal = { userId: 'integration-user' };
    next();
  });
  app.post('/api/run', rateLimitRun, validateBody(runRequestSchema), runController);

  let workspaceId: string | undefined;

  beforeAll(async () => {
    // create a workspace for the integration test
    const ws = await prisma.workspace.create({ data: { name: 'Integration Test WS' } });
    workspaceId = ws.id;
  });

  afterAll(async () => {
    if (workspaceId) {
      // cleanup conversations and workspace
      await prisma.message
        .deleteMany({ where: { conversation: { workspaceId } } })
        .catch(() => {});
      await prisma.conversation.deleteMany({ where: { workspaceId } }).catch(() => {});
      await prisma.workspace.deleteMany({ where: { id: workspaceId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('persists conversation and returns runId', async () => {
    const body = {
      workspaceId,
      agentId: 'agent_int',
      input: { messages: [{ role: 'user', content: 'Integration test message' }] },
    };

    const res = await request(app).post('/api/run').send(body).timeout({ deadline: 20000 });

    expect([200, 202]).toContain(res.status);
    expect(res.body).toHaveProperty('runId');
    const runId = res.body.runId as string;

    // assert persistence: conversation exists
    const conv = await prisma.conversation.findUnique({ where: { id: runId } });
    expect(conv).toBeTruthy();
    expect(conv?.workspaceId).toBe(workspaceId);
  }, 20000);
});
