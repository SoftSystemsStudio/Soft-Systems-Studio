import type { Request, Response } from 'express';
import type { RunRequest } from '../schemas/run';
import { logger } from '../logger';
import { runChat } from '../services/runChat';

export async function runController(req: Request, res: Response) {
  // Prefer validatedBody if middleware attaches it, otherwise fall back to req.body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = ((req as any).validatedBody as RunRequest) ?? (req.body as RunRequest);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const principal = (req as any).authPrincipal;

    const result = await runChat({
      workspaceId: body.workspaceId,
      agentId: body.agentId,
      input: body.input,
      stream: body.stream ?? false,
      principal: {
        userId: principal?.userId,
        workspaceId: body.workspaceId,
        roles: principal?.roles,
      },
      requestId: (req as any).requestId,
    });

    const statusCode = result.statusCode ?? (result.status === 'completed' ? 200 : 202);
    return res
      .status(statusCode)
      .json({ runId: result.runId, status: result.status, reply: result.reply });
  } catch (err) {
    logger.error({ err }, 'runController failed');
    return res.status(500).json({
      error: 'RUN_FAILED',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
