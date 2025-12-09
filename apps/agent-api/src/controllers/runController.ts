import type { Request, Response } from 'express';
import type { RunRequest } from '../schemas/run';
import { logger } from '../logger';

// Import your orchestrator / service here when ready
// import { runAgent } from '../services/runAgent';

export async function runController(req: Request, res: Response) {
  // Prefer validatedBody if middleware attaches it, otherwise fall back to req.body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = ((req as any).validatedBody as RunRequest) ?? (req.body as RunRequest);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const principal = (req as any).authPrincipal;

    // Example orchestrator call; adjust to your actual service
    // const result = await runAgent({
    //   workspaceId: body.workspaceId,
    //   agentId: body.agentId,
    //   input: body.input,
    //   stream: body.stream,
    //   principal,
    // });

    // Placeholder response until wired to actual orchestrator:
    const result = {
      runId: 'placeholder-run-id',
      status: 'queued',
    };

    return res.status(202).json(result);
  } catch (err) {
    logger.error({ err }, 'runController failed');
    return res.status(500).json({
      error: 'RUN_FAILED',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
