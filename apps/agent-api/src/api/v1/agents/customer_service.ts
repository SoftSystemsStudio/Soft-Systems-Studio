import { Router, Request, Response } from 'express';
interface AuthRequest extends Request {
  auth?: { workspaceId?: string };
}
// Temporarily disable to debug server hang
// import { ingestQueue } from '../../../queue';
import requireAuth from '../../../middleware/auth-combined';
import requireWorkspace from '../../../middleware/tenant';
import { requireRole } from '../../../middleware/role';
import { asyncHandler } from '../../../middleware/errorHandler';
import { validateBody } from '../../../middleware/validateBody';
import { rateLimitRun } from '../../../middleware/rateLimitRun';
import { rateLimitChat } from '../../../middleware/rateLimitChat';
import { runRequestSchema } from '../../../schemas/run';
import { chatRequestSchema } from '../../../schemas/chat';
import { runController } from '../../../controllers/runController';
import { chatController } from '../../../controllers/chatController';
import { ingestRequestSchema } from '../../../schemas/ingest';

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
    const workspaceId = req.auth?.workspaceId;
    if (!workspaceId) {
      res.status(400).json({ error: 'invalid_workspace' });
      return;
    }

    // TODO: Re-enable queue after implementing BullMQ-compatible adapter for Upstash
    // Enqueue ingestion job for async processing with retries/backoff
    // await ingestQueue.add(
    //   'ingest-job',
    //   { workspaceId, documents: body.documents, ingestionId },
    //   { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    // );
    // res.json({ ok: true, enqueued: body.documents.length, ingestionId });

    // Temporary: Return 503 Service Unavailable until queue system is re-enabled
    res.status(503).json({
      error: 'queue_unavailable',
      message: 'Ingestion queue temporarily unavailable while migrating to Upstash Redis',
    });
  }),
);

// Chat endpoint - customer service conversations with RAG retrieval
// Requires authentication, workspace context, and appropriate role
router.post(
  '/chat',
  requireAuth,
  requireWorkspace,
  requireRole('user', 'agent', 'admin', 'service', 'member'),
  rateLimitChat,
  validateBody(chatRequestSchema),
  asyncHandler(chatController),
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
