import { Router } from 'express';
import { upsertDocuments, querySimilar } from '../../services/qdrant';
import { ingestQueue } from '../../queue';
import { chat } from '../../services/llm';
import prisma from '../../db';
import requireAuth from '../../middleware/auth-combined';
import requireWorkspace from '../../middleware/tenant';
import { requireRole } from '../../middleware/role';

const router = Router();

// Ingest KB documents for a workspace
// Enforce auth and workspace scoping
router.post(
  '/ingest',
  requireAuth,
  requireWorkspace,
  requireRole('admin', 'owner', 'agent'),
  async (req, res) => {
    try {
      const { documents } = req.body as any;
      const workspaceId = req.auth?.workspaceId;
      if (!workspaceId || !Array.isArray(documents)) {
        return res.status(400).json({ error: 'invalid_payload' });
      }

      // Enqueue ingestion job for async processing with retries/backoff
      await ingestQueue.add(
        'ingest-job',
        { workspaceId, documents },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      );
      return res.json({ ok: true, enqueued: documents.length });
    } catch (e: any) {
      console.error('ingest error', e);
      return res.status(500).json({ error: e?.message || 'server_error' });
    }
  }
);

// Run chat with RAG-lite retrieval
router.post(
  '/run',
  requireAuth,
  requireWorkspace,
  requireRole('user', 'agent', 'admin'),
  async (req, res) => {
    try {
      const { message, userId } = req.body as any;
      const workspaceId = req.auth?.workspaceId;
      if (!workspaceId || !message) return res.status(400).json({ error: 'invalid_payload' });

      // Retrieve top contexts
      const contexts = await querySimilar(message, 4);
      const contextText = contexts
        .map((c: any, idx: number) => `Context ${idx + 1}: ${c.payload?.text || ''}`)
        .join('\n\n');

      const system = `You are a helpful customer support assistant. Use the context to answer user questions. If you cannot answer, ask a clarification.`;
      const messages = [
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
      } catch (e) {
        console.error('persist conversation failed', e);
      }

      return res.json({ reply });
    } catch (e: any) {
      console.error('run error', e);
      return res.status(500).json({ error: e?.message || 'server_error' });
    }
  }
);

export default router;
