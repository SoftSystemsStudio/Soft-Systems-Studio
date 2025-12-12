import env from './env';
import express from 'express';
import helmet from 'helmet';
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
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { httpLogger, logger } from './logger';
import { initSentry, sentryRequestHandler, sentryErrorHandler } from './sentry';
// Temporarily disable queue to debug server hang
// import { startQueueMetrics, gracefulShutdown, registerQueueShutdownHandlers } from './queue';

// Initialize Sentry early (before any routes)
initSentry();

// Import handler using require to bypass TypeScript rootDir constraints
// TODO: Debug why this causes server to hang - use dynamic import for now
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
// const { handleChat } = require('@softsystems/agent-customer-service') as {
//   handleChat: (body: unknown) => Promise<{ status?: number; body?: unknown }>;
// };

const app = express();

// Sentry request handler (must be first middleware)
app.use(sentryRequestHandler);

// Security headers via helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // May need to be false for some API clients
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// Request logging (early middleware)
app.use(httpLogger);

// Stripe webhooks need raw body for signature verification (must be before bodyParser.json())
app.use('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(bodyParser.json());
app.use(cookieParser());

// All routes now handled by routers for consistency and testability
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

// Start server - note: require.main may be start.ts when required from there
if (require.main === module || require.main?.filename?.includes('start.ts')) {
  // TODO: Re-enable queue after debugging server hang
  // registerQueueShutdownHandlers();
  // startQueueMetrics();

  console.log('[index.ts] Starting server on port', port);
  app.listen(port, () => {
    logger.info({ port, serverRole: env.SERVER_ROLE }, `agent-api listening on ${port}`);
  });

  // When re-enabling queue system:
  // const server = app.listen(port, () => { ... });
  // server.on('close', () => { void gracefulShutdown(); });
}

export default app;
