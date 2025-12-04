import { Request, Response, NextFunction } from 'express';
import env from '../env';
import * as jwt from 'jsonwebtoken';
import '../types/auth'; // Import to register global types
import type { AuthInfo } from '../types/auth';
import { logger } from '../logger';

// JWT Error types for better error handling
type JwtErrorCode = 'TokenExpiredError' | 'JsonWebTokenError' | 'NotBeforeError';

function isJwtError(err: unknown): err is Error & { name: JwtErrorCode } {
  return (
    err instanceof Error &&
    ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(err.name)
  );
}

/**
 * Combined auth middleware: prefer JWT Bearer token, fallback to API key (x-api-key)
 * 
 * SECURITY NOTES:
 * - Anonymous access is ONLY allowed when ALLOW_ANONYMOUS_DEV=true AND NODE_ENV=development
 * - API keys are service accounts with limited scope (not full admin access)
 * - All authenticated requests must have valid credentials
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = (req.headers['authorization'] as string) || '';
  const apiKeyHeader = (req.headers['x-api-key'] as string) || (req.query?.api_key as string) || '';

  // Try JWT first if present
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const secret = env.JWT_SECRET;

    if (!secret) {
      logger.error('JWT secret not configured');
      return res
        .status(500)
        .json({ error: 'server_configuration_error', message: 'JWT secret not configured' });
    }

    try {
      const decoded = jwt.verify(token, secret, {
        algorithms: [env.JWT_ALGORITHM as jwt.Algorithm],
      });

      // Validate it's an access token (not a refresh token which shouldn't be used as Bearer)
      const payload = decoded as AuthInfo;
      if (payload.type && payload.type !== 'access') {
        return res
          .status(401)
          .json({ error: 'invalid_token_type', message: 'Use access token for authorization' });
      }

      req.auth = payload;
      return next();
    } catch (err: unknown) {
      if (isJwtError(err)) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'token_expired',
            message: 'Access token has expired. Please refresh your token.',
            code: 'TOKEN_EXPIRED',
          });
        }
        if (err.name === 'NotBeforeError') {
          return res.status(401).json({
            error: 'token_not_active',
            message: 'Token is not yet valid',
            code: 'TOKEN_NOT_ACTIVE',
          });
        }
      }
      return res.status(401).json({
        error: 'invalid_token',
        message: 'Invalid or malformed token',
        code: 'INVALID_TOKEN',
      });
    }
  }

  // Fallback to API key if configured
  const configuredApiKey = env.API_KEY || '';
  if (configuredApiKey && apiKeyHeader) {
    if (apiKeyHeader !== configuredApiKey) {
      logger.warn({ ip: req.ip }, 'Invalid API key attempt');
      return res.status(403).json({
        error: 'invalid_api_key',
        message: 'Invalid API key',
        code: 'INVALID_API_KEY',
      });
    }
    // API keys are service accounts with LIMITED scope
    // They do NOT bypass role checks - they get 'service' role
    // To restrict to specific workspaces, use apiKeyWorkspaces
    req.auth = {
      apiKey: true,
      apiKeyId: 'default',
      // Service role - does not automatically get admin access
      role: 'service',
      roles: ['service'],
      // API keys can be scoped to specific operations
      apiKeyScopes: ['read', 'write'],
    };
    logger.debug({ apiKeyId: 'default' }, 'API key authenticated');
    return next();
  }

  // Check if anonymous access is explicitly enabled for local development
  // SECURITY: Both conditions must be true - explicit env var AND development mode
  if (env.NODE_ENV === 'development' && env.ALLOW_ANONYMOUS_DEV === true) {
    logger.warn('Anonymous access allowed (ALLOW_ANONYMOUS_DEV=true in development)');
    req.auth = { anonymous: true };
    return next();
  }

  // No valid credentials provided
  if (!authHeader && !apiKeyHeader) {
    return res.status(401).json({
      error: 'missing_credentials',
      message: 'Authorization header or API key required',
      code: 'MISSING_CREDENTIALS',
    });
  }

  // In production or when anonymous dev is disabled, require authentication
  return res.status(401).json({
    error: 'unauthorized',
    message: 'Authentication required',
    code: 'AUTH_REQUIRED',
  });
}

/**
 * Optional auth middleware - doesn't fail if no auth provided, but validates if present
 * SECURITY: Anonymous access still requires ALLOW_ANONYMOUS_DEV in development
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = (req.headers['authorization'] as string) || '';
  const apiKeyHeader = (req.headers['x-api-key'] as string) || (req.query?.api_key as string) || '';

  // No auth provided
  if (!authHeader && !apiKeyHeader) {
    // Only allow anonymous if explicitly enabled in development
    if (env.NODE_ENV === 'development' && env.ALLOW_ANONYMOUS_DEV === true) {
      req.auth = { anonymous: true };
      return next();
    }
    // In production, optionalAuth still requires auth for protected operations
    req.auth = undefined;
    return next();
  }

  // Auth provided - validate it
  return requireAuth(req, res, next);
}

export default requireAuth;
