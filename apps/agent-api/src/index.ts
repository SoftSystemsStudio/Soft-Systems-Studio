import './env';
import express from 'express';
import bodyParser from 'body-parser';
import { handleChat } from '../../packages/agent-customer-service/src/handlers/chat';
import prisma from './db';

const app = express();
app.use(bodyParser.json());

app.post('/api/agents/customer-service/chat', async (req, res) => {
  try {
    const result = await handleChat(req.body);
    if (result.status && result.body) {
      // Persist request and response for successful chats
      try {
        const payload = req.body as any;
        const workspaceId = payload.workspaceId || 'demo';
        // ensure workspace exists (seed/demo)
        await prisma.workspace.upsert({ where: { id: workspaceId }, update: {}, create: { id: workspaceId, name: workspaceId } });

        // create conversation if provided or new
        const conversation = await prisma.conversation.create({ data: { workspaceId } });

        await prisma.message.createMany({
          data: [
            { conversationId: conversation.id, role: 'user', content: payload.message },
            { conversationId: conversation.id, role: 'assistant', content: (result.body as any).reply }
          ]
        });
      } catch (e) {
        console.error('failed to persist conversation', e);
      }
      return res.status(result.status).json(result.body);
    }
    return res.status(500).json({ error: 'unknown' });
  } catch (err: any) {
    console.error('chat error', err);
    return res.status(500).json({ error: err?.message || 'server_error' });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(port, () => console.log(`agent-api listening on ${port}`));
