import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';

import * as runChatModule from '../../services/runChat';

import { rateLimitRun } from '../../middleware/rateLimitRun';
import { validateBody } from '../../middleware/validateBody';
import { runRequestSchema } from '../../schemas/run';
import { runController } from '../runController';

function createApp() {
  const app = express();
  app.use(bodyParser.json());

  // attach a test auth principal so limiter and controller get a principal
  app.use((req, _res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).authPrincipal = {
      userId: 'user-1',
      workspaceId: req.headers['x-test-workspace'] || 'ws_test',
    };
    next();
  });

  app.post('/api/run', rateLimitRun, validateBody(runRequestSchema), runController);

  return app;
}

describe('runController (unit)', () => {
  const app = createApp();

  const validBody = {
    workspaceId: 'ws_123',
    agentId: 'agent_123',
    input: { messages: [{ role: 'user', content: 'Hello' }] },
  };

  beforeEach(() => {
    jest
      .spyOn(runChatModule, 'runChat')
      .mockResolvedValue({ runId: 'mock-run-id', status: 'queued', statusCode: 202 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls runChat with validated body and principal and returns 202', async () => {
    const res = await request(app).post('/api/run').send(validBody);

    expect(res.status).toBe(202);
    expect(res.body).toEqual({ runId: 'mock-run-id', status: 'queued' });

    expect(runChatModule.runChat).toHaveBeenCalledTimes(1);
    expect(runChatModule.runChat).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'ws_123',
        agentId: 'agent_123',
        input: validBody.input,
        stream: false,
        principal: expect.objectContaining({ workspaceId: 'ws_123' }),
      }),
    );
  });
});
