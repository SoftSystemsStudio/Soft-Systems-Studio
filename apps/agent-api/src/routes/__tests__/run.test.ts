import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';

import { rateLimitRun } from '../../middleware/rateLimitRun';
import { validateBody } from '../../middleware/validateBody';
import { runRequestSchema } from '../../schemas/run';

// Mock the real orchestration to keep tests deterministic and fast
jest.mock('../../services/runChat', () => ({
  runChat: jest.fn(async (_input: any) => ({
    runId: 'mock-run-id',
    status: 'completed',
    statusCode: 200,
    reply: 'mock-reply',
  })),
}));

import { runController } from '../../controllers/runController';

function createApp() {
  const app = express();
  app.use(bodyParser.json());

  // test auth middleware: attach authPrincipal with workspaceId to satisfy rate limiter
  app.use((req, _res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).authPrincipal = { workspaceId: req.headers['x-test-workspace'] || 'ws_test' };
    next();
  });

  app.post('/api/run', rateLimitRun, validateBody(runRequestSchema), runController);

  return app;
}

describe('POST /api/run', () => {
  const app = createApp();

  it('rejects invalid body', async () => {
    const res = await request(app).post('/api/run').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_REQUEST_BODY');
    expect(res.body.issues).toBeDefined();
    expect(res.body.issues.length).toBeGreaterThan(0);
  });

  it('accepts valid body', async () => {
    const validBody = {
      workspaceId: 'ws_123',
      agentId: 'agent_123',
      input: {
        messages: [{ role: 'user', content: 'Hello' }],
      },
    };

    const res = await request(app).post('/api/run').send(validBody);

    expect([200, 202]).toContain(res.status);
    expect(res.body).toHaveProperty('runId');
  });

  it('rate limits excessive requests', async () => {
    const validBody = {
      workspaceId: 'ws_rate_test',
      agentId: 'agent_123',
      input: {
        messages: [{ role: 'user', content: 'Hello' }],
      },
    };

    // exceed the default 60 requests window
    for (let i = 0; i < 65; i += 1) {
      // set header so limiter keys by workspace
      // eslint-disable-next-line no-await-in-loop
      await request(app).post('/api/run').set('x-test-workspace', 'ws_rate_test').send(validBody);
    }

    const res = await request(app)
      .post('/api/run')
      .set('x-test-workspace', 'ws_rate_test')
      .send(validBody);

    expect(res.status).toBe(429);
    expect(res.body.error).toBe('RATE_LIMITED');
  });
});
