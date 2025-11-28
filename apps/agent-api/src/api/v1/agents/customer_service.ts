import { Router } from 'express';
import { upsertDocuments, querySimilar } from '../../services/qdrant';
import { chat } from '../../services/llm';
import prisma from '../../db';

const router = Router();

// Ingest KB documents for a workspace
router.post('/ingest', async (req, res) => {
  try {
    const { workspaceId, documents } = req.body as any;
    if (!workspaceId || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    const docs = documents.map((d: any, i: number) => ({ id: `${workspaceId}-${Date.now()}-${i}`, text: d.text || d.content || '', metadata: { title: d.title || null } }));
    await upsertDocuments(docs);

    return res.json({ ok: true, ingested: docs.length });
  } catch (e: any) {
    console.error('ingest error', e);
    return res.status(500).json({ error: e?.message || 'server_error' });
  }
});

// Run chat with RAG-lite retrieval
router.post('/run', async (req, res) => {
  try {
    const { workspaceId, message, userId } = req.body as any;
    if (!workspaceId || !message) return res.status(400).json({ error: 'invalid_payload' });

    // Retrieve top contexts
    const contexts = await querySimilar(message, 4);
    const contextText = contexts.map((c: any, idx: number) => `Context ${idx + 1}: ${c.payload?.text || ''}`).join('\n\n');

    const system = `You are a helpful customer support assistant. Use the context to answer user questions. If you cannot answer, ask a clarification.`;
    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: `Context:\n${contextText}\n\nUser: ${message}` }
    ];

    const reply = await chat(messages);

    // Persist conversation and messages
    try {
      await prisma.workspace.upsert({ where: { id: workspaceId }, update: {}, create: { id: workspaceId, name: workspaceId } });
      const conversation = await prisma.conversation.create({ data: { workspaceId } });
      await prisma.message.createMany({ data: [{ conversationId: conversation.id, role: 'user', content: message }, { conversationId: conversation.id, role: 'assistant', content: reply }] });
    } catch (e) {
      console.error('persist conversation failed', e);
    }

    return res.json({ reply });
  } catch (e: any) {
    console.error('run error', e);
    return res.status(500).json({ error: e?.message || 'server_error' });
  }
});

export default router;
