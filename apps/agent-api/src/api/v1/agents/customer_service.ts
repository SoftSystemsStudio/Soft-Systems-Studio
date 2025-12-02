import { Router, Request, Response } from 'express';
interface AuthRequest extends Request {
  auth?: { workspaceId?: string };
}
import { querySimilar } from '../../../services/qdrant';
import { ingestQueue } from '../../../queue';
import { chat } from '../../../services/llm';
import prisma from '../../../db';
import requireAuth from '../../../middleware/auth-combined';
import requireWorkspace from '../../../middleware/tenant';
import { requireRole } from '../../../middleware/role';

const router = Router();

// Ingest KB documents for a workspace
// Enforce auth and workspace scoping
router.post(
  '/ingest',
  requireAuth,
  requireWorkspace,
  requireRole('admin', 'owner', 'agent'),
  async (req: AuthRequest, res: Response) => {
    try {
      const body = req.body as { documents?: unknown };
      const documents = body.documents;
      const workspaceId = req.auth?.workspaceId;
      if (!workspaceId || !Array.isArray(documents)) {
        return res.status(400).json({ error: 'invalid_payload' });
      }

      // Enqueue ingestion job for async processing with retries/backoff
      await ingestQueue.add(
        'ingest-job',
        { workspaceId, documents },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
      );
      return res.json({ ok: true, enqueued: documents.length });
    } catch (e: unknown) {
      console.error('ingest error', e);
      const message = (e as { message?: string })?.message ?? 'server_error';
      return res.status(500).json({ error: message });
    }
  },
);

// Run chat with RAG-lite retrieval
router.post(
  '/run',
  requireAuth,
  requireWorkspace,
  requireRole('user', 'agent', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const body = req.body as { message?: unknown; userId?: unknown };
      const message = body.message as string | undefined;
      const workspaceId = req.auth?.workspaceId;
      if (!workspaceId || !message) return res.status(400).json({ error: 'invalid_payload' });

      // Retrieve top contexts
      type SimilarItem = { id: string; score: number; payload?: { text?: string } };
      const contexts = (await querySimilar(message, 4)) as SimilarItem[];
      const contextText = contexts
        .map((c, idx) => `Context ${idx + 1}: ${c.payload?.text || ''}`)
        .join('\n\n');

      const system = `You are a helpful customer support assistant. Use the context to answer user questions. If you cannot answer, ask a clarification.`;
      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: system },
        { role: 'user', content: `Context:\n${contextText}\n\nUser: ${message}` },
      ];

      const reply = await chat(messages);

      // Persist conversation and messages
      try {
        // Workspace already validated by middleware — create conversation and messages
        const conversation = await prisma.conversation.create({ data: { workspaceId } });
        await prisma.message.createMany({
          data: [
            { conversationId: conversation.id, role: 'user', content: message },
            { conversationId: conversation.id, role: 'assistant', content: reply },
          ],
        });
      } catch (e: unknown) {
        console.error('persist conversation failed', e);
      }

      return res.json({ reply });
    } catch (e: unknown) {
      console.error('run error', e);
      const message = (e as { message?: string })?.message ?? 'server_error';
      return res.status(500).json({ error: message });
    }
  },
);

export default router;
