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
import { validateBody } from '../../../lib/validate';
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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const body = req.body as { message?: unknown; userId?: unknown; conversationId?: unknown };
    const message = body.message as string | undefined;
    const conversationId = body.conversationId as string | undefined;
    const workspaceId = req.auth?.workspaceId;

    if (!workspaceId || !message) {
      res.status(400).json({ error: 'invalid_payload' });
      return;
    }

    try {
      // Use the chat service for transactional persistence
      const result = await runChat({
        workspaceId,
        message,
        conversationId,
      });

      res.json({
        reply: result.reply,
        conversationId: result.conversationId,
      });
    } catch (error) {
      logger.error({ error, workspaceId }, 'Chat failed');
      res.status(500).json({
        error: 'chat_failed',
        message: 'Failed to process chat request. Please try again.',
      });
    }
  }),
);

export default router;
