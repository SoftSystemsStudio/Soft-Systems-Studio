import express, { type Express, type Request, type Response, type NextFunction } from 'express';

type HarnessOptions = {
  // Optional overrides so tests can simulate auth/context without real middleware.
  auth?: Partial<{ sub: string; role: string; apiKeyId: string; workspaceId: string }>;
};

/**
 * Auth middleware shim that injects credentials into the request
 * in the shape the real auth middleware expects.
 */
function authShim(
  options?: Partial<{ role?: string; apiKeyId?: string; sub?: string; workspaceId?: string }>,
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = options?.role ?? 'user';
    const apiKeyId = options?.apiKeyId ?? undefined;
    const sub = options?.sub ?? 'test-user';
    const workspaceId = options?.workspaceId ?? 'test-workspace';

    // Common patterns used across Express apps:
    (req as any).auth = { sub, role, apiKeyId, workspaceId };
    (req as any).user = { id: sub, role, apiKeyId };
    // If you have a request-context helper, call it here:
    // refreshRequestContext(req);

    next();
  };
}

export function createChatTestApp(router: express.Router, opts: HarnessOptions = {}): Express {
  const app = express();

  // Minimal body parsing only
  app.use(express.json({ limit: '1mb' }));

  // Auth middleware runs before the router to satisfy auth requirements
  app.use('/api/v1', authShim(opts.auth));

  // Mount only what we are testing
  app.use('/api/v1', router);

  // Minimal error handler so thrown async errors resolve to HTTP 500 deterministically
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ error: 'internal_error', message: err?.message ?? 'error' });
  });

  return app;
}
