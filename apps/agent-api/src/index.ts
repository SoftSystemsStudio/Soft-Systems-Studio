import './env';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { handleChat } from '../../packages/agent-customer-service/src/handlers/chat';
import prisma from './db';
import healthRouter from './health';
import onboardingRouter from './api/v1/auth/onboarding';
import loginRouter from './api/v1/auth/login';
import customerServiceRouter from './api/v1/agents/customer_service';
import { metricsHandler } from './metrics';

const app = express();
app.use(bodyParser.json());

app.post('/api/agents/customer-service/chat', async (req: Request, res: Response) => {
  try {
    const result = await handleChat(req.body);
    if (result.status && result.body) {
      // Persist request and response for successful chats
      try {
        const payload = req.body as { workspaceId?: string; message?: string };
        const workspaceId = payload.workspaceId || 'demo';
        // ensure workspace exists (seed/demo)
        await prisma.workspace.upsert({
          where: { id: workspaceId },
          update: {},
          create: { id: workspaceId, name: workspaceId },
        });

        // create conversation if provided or new
        const conversation = await prisma.conversation.create({ data: { workspaceId } });

        const reply = (result.body as { reply?: string })?.reply || '';
        await prisma.message.createMany({
          data: [
            { conversationId: conversation.id, role: 'user', content: payload.message || '' },
            {
              conversationId: conversation.id,
              role: 'assistant',
              content: reply,
            },
          ],
        });
      } catch (e) {
        console.error('failed to persist conversation', e);
      }
      return res.status(result.status).json(result.body);
    }
    return res.status(500).json({ error: 'unknown' });
  } catch (err: unknown) {
    console.error('chat error', err);
    const message = (err as { message?: string })?.message ?? 'server_error';
    return res.status(500).json({ error: message });
  }
});

app.use('/health', healthRouter);
app.use('/api/v1/agents/customer-service', customerServiceRouter);
app.use('/api/v1/auth', onboardingRouter);
app.use('/api/v1/auth', loginRouter);
app.get('/metrics', metricsHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 5000;

if (require.main === module) {
  app.listen(port, () => console.log(`agent-api listening on ${port}`));
}

export default app;
