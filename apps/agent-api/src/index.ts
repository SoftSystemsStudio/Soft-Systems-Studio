import env from './env';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import healthRouter from './health';
import statusRouter from './status';
import onboardingRouter from './api/v1/auth/onboarding';
import loginRouter from './api/v1/auth/login';
import tokenRouter from './api/v1/auth/token';
import customerServiceRouter from './api/v1/agents/customer_service';
import cleanupRouter from './api/v1/admin/cleanup';
import stripeRouter from './api/v1/stripe';
import { metricsHandler } from './metrics';
import requireAuth from './middleware/auth-combined';
import requireWorkspace from './middleware/tenant';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler';
import { httpLogger, logger } from './logger';
import { initSentry, sentryRequestHandler, sentryErrorHandler } from './sentry';
import { validateBody } from './lib/validate';
import { chatRequestSchema, type ChatRequest } from './schemas/chat';
import { persistChatExchange } from './services/chat';
import { startQueueMetrics, gracefulShutdown } from './queue';

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

// Stripe webhooks need raw body for signature verification (must be before bodyParser.json())
app.use('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(bodyParser.json());
app.use(cookieParser());

// Extended request type with auth context
interface AuthRequest extends Request {
  auth?: { workspaceId?: string; userId?: string };
}

// Chat endpoint - requires authentication and workspace context
// Validates payload with Zod schema
app.post(
  '/api/agents/customer-service/chat',
  requireAuth,
  requireWorkspace,
  validateBody(chatRequestSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const payload = req.body as ChatRequest;
    const workspaceId = req.auth?.workspaceId;

    // This should never happen due to requireWorkspace middleware, but TypeScript needs it
    if (!workspaceId) {
      res.status(401).json({ error: 'workspace_required' });
      return;
    }

    const result = await handleChat({ ...payload, workspaceId });

    if (!result.status || !result.body) {
      res.status(500).json({ error: 'chat_failed' });
      return;
    }

    const reply = (result.body as { reply?: string })?.reply || '';

    // Persist conversation and messages using transactional service
    // Fail the request if persistence fails - data integrity is critical
    try {
      const persistResult = await persistChatExchange({
        workspaceId,
        userMessage: payload.message,
        assistantReply: reply,
        conversationId: payload.conversationId,
      });

      logger.info('Chat completed', {
        workspaceId,
        conversationId: persistResult.conversationId,
        messageLength: payload.message.length,
      });

      // Return reply with conversation context
      res.status(result.status).json({
        ...result.body,
        conversationId: persistResult.conversationId,
      });
    } catch (persistError) {
      logger.error('Failed to persist conversation', {
        error: persistError,
        workspaceId,
      });
      // Fail the request - don't return a reply if we can't persist it
      res.status(500).json({
        error: 'persistence_failed',
        message: 'Failed to save conversation. Please try again.',
      });
    }
  }),
);

app.use('/health', healthRouter);
app.use('/status', statusRouter);
app.use('/api/v1/agents/customer-service', customerServiceRouter);
app.use('/api/v1/auth', onboardingRouter);
app.use('/api/v1/auth', loginRouter);
app.use('/api/v1/auth', tokenRouter);
app.use('/api/v1/admin', cleanupRouter);
app.use('/api/v1/stripe', stripeRouter);
app.get('/metrics', metricsHandler);

// Apply auth middleware to protected routes
app.use('/api/v1/agents', requireAuth);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Sentry error handler (must be before custom error handler)
app.use(sentryErrorHandler);

// Global error handler (must be last)
app.use(errorHandler);

const port = env.PORT ? Number(env.PORT) : 5000;

if (require.main === module) {
  // Start queue metrics if enabled for this server role
  startQueueMetrics();

  const server = app.listen(port, () => {
    logger.info({ port, serverRole: env.SERVER_ROLE }, `agent-api listening on ${port}`);
  });

  // Graceful shutdown on server close
  server.on('close', () => {
    void gracefulShutdown();
  });
}

export default app;
