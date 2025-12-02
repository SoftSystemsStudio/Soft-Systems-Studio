import { Request, Response, NextFunction } from 'express';
import env from '../env';
import * as jwt from 'jsonwebtoken';
import '../types/auth'; // Import to register global types
import type { AuthInfo } from '../types/auth';

// JWT Error types for better error handling
type JwtErrorCode = 'TokenExpiredError' | 'JsonWebTokenError' | 'NotBeforeError';

function isJwtError(err: unknown): err is Error & { name: JwtErrorCode } {
  return (
    err instanceof Error &&
    ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(err.name)
  );
}

// Combined auth middleware: prefer JWT Bearer token, fallback to API key (x-api-key)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = (req.headers['authorization'] as string) || '';
  const apiKeyHeader = (req.headers['x-api-key'] as string) || (req.query?.api_key as string) || '';

  // Try JWT first if present
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const secret = env.JWT_SECRET;

    if (!secret) {
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
  const configured = process.env.API_KEY || '';
  if (configured) {
    if (!apiKeyHeader) {
      return res.status(401).json({
        error: 'missing_credentials',
        message: 'Authorization header or API key required',
        code: 'MISSING_CREDENTIALS',
      });
    }
    if (apiKeyHeader !== configured) {
      return res.status(403).json({
        error: 'invalid_api_key',
        message: 'Invalid API key',
        code: 'INVALID_API_KEY',
      });
    }
    // attach simple auth info for API key users
    req.auth = { apiKey: true };
    return next();
  }

  // If in development and no auth configured, allow through (dev convenience only)
  if (env.NODE_ENV === 'development') {
    req.auth = { anonymous: true };
    return next();
  }

  // In production, require authentication
  return res.status(401).json({
    error: 'unauthorized',
    message: 'Authentication required',
    code: 'AUTH_REQUIRED',
  });
}

// Optional auth middleware - doesn't fail if no auth provided, but validates if present
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = (req.headers['authorization'] as string) || '';
  const apiKeyHeader = (req.headers['x-api-key'] as string) || (req.query?.api_key as string) || '';

  // No auth provided - continue without auth
  if (!authHeader && !apiKeyHeader) {
    req.auth = { anonymous: true };
    return next();
  }

  // Auth provided - validate it
  return requireAuth(req, res, next);
}

export default requireAuth;
