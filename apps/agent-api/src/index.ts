import './env';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import prisma from './db';
import healthRouter from './health';
import statusRouter from './status';
import onboardingRouter from './api/v1/auth/onboarding';
import loginRouter from './api/v1/auth/login';
import tokenRouter from './api/v1/auth/token';
import customerServiceRouter from './api/v1/agents/customer_service';
import cleanupRouter from './api/v1/admin/cleanup';
import { metricsHandler } from './metrics';
import requireAuth from './middleware/auth-combined';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { httpLogger, logger } from './logger';
import { initSentry, sentryRequestHandler, sentryErrorHandler } from './sentry';

// Initialize Sentry early (before any routes)
initSentry();

// Import handler using require to bypass TypeScript rootDir constraints
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { handleChat } = require('@softsystems/agent-customer-service') as {
  handleChat: (body: unknown) => Promise<{ status?: number; body?: unknown }>;
};

const app = express();

// Sentry request handler (must be first middleware)
app.use(sentryRequestHandler);

// Request logging (early middleware)
app.use(httpLogger);

app.use(bodyParser.json());
app.use(cookieParser());

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
app.use('/status', statusRouter);
app.use('/api/v1/agents/customer-service', customerServiceRouter);
app.use('/api/v1/auth', onboardingRouter);
app.use('/api/v1/auth', loginRouter);
app.use('/api/v1/auth', tokenRouter);
app.use('/api/v1/admin', cleanupRouter);
app.get('/metrics', metricsHandler);

// Apply auth middleware to protected routes
app.use('/api/v1/agents', requireAuth);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Sentry error handler (must be before custom error handler)
app.use(sentryErrorHandler);

// Global error handler (must be last)
app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 5000;

if (require.main === module) {
  app.listen(port, () => logger.info({ port }, `agent-api listening on ${port}`));
}

export default app;
