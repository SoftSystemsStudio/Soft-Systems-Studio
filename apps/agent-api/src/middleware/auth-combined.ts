import { Request, Response, NextFunction } from 'express';
import env from '../env';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      auth?: any;
    }
  }
}

// Combined auth middleware: prefer JWT Bearer token, fallback to API key (x-api-key)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = (req.headers['authorization'] as string) || '';
  const apiKeyHeader = (req.headers['x-api-key'] as string) || (req.query?.api_key as string) || '';

  // Try JWT first if present
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const secret = env.JWT_SECRET;
    if (!secret) return res.status(401).json({ error: 'server_missing_jwt_secret' });
    try {
      const decoded = jwt.verify(token, secret, { algorithms: [env.JWT_ALGORITHM] });
      req.auth = decoded;
      return next();
    } catch (err: any) {
      return res.status(401).json({ error: 'invalid_token', message: err?.message });
    }
  }

  // Fallback to API key if configured
  const configured = process.env.API_KEY || '';
  if (configured) {
    if (!apiKeyHeader) return res.status(401).json({ error: 'missing_api_key' });
    if (apiKeyHeader !== configured) return res.status(403).json({ error: 'invalid_api_key' });
    // attach simple auth info for API key users
    req.auth = { apiKey: true };
    return next();
  }

  // If no auth configured, allow through (development convenience)
  req.auth = { anonymous: true };
  return next();
}

export default requireAuth;
