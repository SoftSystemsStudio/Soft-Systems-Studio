/**
 * Request Context Middleware
 * Propagates request ID and authentication context into logs and error handlers
 * 
 * Flow:
 * 1. Extract request ID from pino-http (already set)
 * 2. Attach auth context from authentication middleware
 * 3. Create child logger with bound context
 * 4. Make context available throughout request lifecycle
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';
import '../types/auth';

/**
 * Request context that should be propagated through logs and errors
 */
export interface RequestContext {
  requestId: string;
  userId?: string;
  workspaceId?: string;
  role?: string;
  apiKeyId?: string;
  method: string;
  path: string;
  ip?: string;
}

/**
 * Extended Request type with context and logger
 */
declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
      log?: any; // Use any for Pino logger to avoid complex type issues
    }
  }
}

/**
 * Extract authentication context from request
 */
function extractAuthContext(req: Request): Partial<RequestContext> {
  const auth = req.auth;
  
  if (!auth) {
    return {};
  }

  const context: Partial<RequestContext> = {};

  // User authentication
  if (auth.sub) {
    context.userId = auth.sub;
  }

  // Workspace context
  if (auth.workspaceId) {
    context.workspaceId = auth.workspaceId;
  }

  // Role information
  if (auth.role) {
    context.role = auth.role;
  }

  // API key authentication
  if (auth.apiKey && auth.apiKeyId) {
    context.apiKeyId = auth.apiKeyId;
  }

  // Admin authentication
  if (auth.roles && auth.roles.includes('admin')) {
    context.role = 'admin';
  }

  return context;
}

/**
 * Request context middleware
 * 
 * Usage: app.use(requestContext)
 * 
 * Must be placed AFTER:
 * - httpLogger (pino-http) - provides request ID
 * - authentication middleware - provides auth context
 * 
 * Provides:
 * - req.context - structured context object
 * - req.log - child logger with bound context
 */
export function requestContext(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // Extract request ID from pino-http
  const requestId = (req.id || (req as any).log?.bindings?.()?.reqId || 'unknown') as string;

  // Build context from request metadata
  const authContext = extractAuthContext(req);

  const context: RequestContext = {
    requestId,
    method: req.method,
    path: req.path || req.url,
    ip: req.ip || req.socket.remoteAddress,
    ...authContext,
  };

  // Attach context to request
  req.context = context;

  // Create child logger with bound context for this request
  // All logs using req.log will automatically include this context
  req.log = logger.child({
    requestId: context.requestId,
    ...(context.userId && { userId: context.userId }),
    ...(context.workspaceId && { workspaceId: context.workspaceId }),
    ...(context.role && { role: context.role }),
    ...(context.apiKeyId && { apiKeyId: context.apiKeyId }),
  }) as any;

  next();
}

/**
 * Get request context from Express request
 * Useful in services/controllers that receive the request object
 */
export function getRequestContext(req: Request): RequestContext | undefined {
  return req.context;
}

/**
 * Get request logger with bound context
 * Useful in services/controllers that receive the request object
 */
export function getRequestLogger(req: Request): any {
  return req.log || logger;
}

/**
 * Refresh request context after authentication
 * Call this in authentication middleware after setting req.auth
 * to update the logger with auth context
 */
export function refreshRequestContext(req: Request): void {
  if (!req.context) {
    return; // Context not initialized yet
  }

  const authContext = extractAuthContext(req);
  
  // Update context with auth info
  Object.assign(req.context, authContext);

  // Recreate child logger with updated context
  req.log = logger.child({
    requestId: req.context.requestId,
    ...(req.context.userId && { userId: req.context.userId }),
    ...(req.context.workspaceId && { workspaceId: req.context.workspaceId }),
    ...(req.context.role && { role: req.context.role }),
    ...(req.context.apiKeyId && { apiKeyId: req.context.apiKeyId }),
  }) as any;
}
