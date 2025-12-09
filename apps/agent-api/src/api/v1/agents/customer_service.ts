import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
interface AuthRequest extends Request {
  auth?: { workspaceId?: string };
}
import { ingestQueue } from '../../../queue';
import { runChat } from '../../../services/chat';
import requireAuth from '../../../middleware/auth-combined';
import requireWorkspace from '../../../middleware/tenant';
import { requireRole } from '../../../middleware/role';
import { asyncHandler } from '../../../middleware/errorHandler';
import { validateBody as validateBodyLib } from '../../../lib/validate';
import { validateBody } from '../../../middleware/validateBody';
import { rateLimitRun } from '../../../middleware/rateLimitRun';
import { runRequestSchema } from '../../../schemas/run';
import { runController } from '../../../controllers/runController';
import { ingestRequestSchema, type IngestRequest } from '../../../schemas/ingest';
import { logger } from '../../../logger';

const router = Router();

// Ingest KB documents for a workspace
// Enforce auth and workspace scoping
router.post(
  '/ingest',
  requireAuth,
  requireWorkspace,
  requireRole('admin', 'owner', 'agent', 'service'),
  validateBody(ingestRequestSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const body = req.body as IngestRequest;
    const workspaceId = req.auth?.workspaceId;
    if (!workspaceId) {
      res.status(400).json({ error: 'invalid_workspace' });
      return;
    }

    // Generate stable ingestionId for idempotent retries
    const ingestionId = randomUUID();

    // Enqueue ingestion job for async processing with retries/backoff
    await ingestQueue.add(
      'ingest-job',
      { workspaceId, documents: body.documents, ingestionId },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );
    res.json({ ok: true, enqueued: body.documents.length, ingestionId });
  }),
);

// Run chat with RAG-lite retrieval
router.post(
  '/run',
  requireAuth,
  requireWorkspace,
  requireRole('user', 'agent', 'admin', 'service', 'member'),
  rateLimitRun,
  validateBody(runRequestSchema),
  asyncHandler(runController),
);

export default router;
