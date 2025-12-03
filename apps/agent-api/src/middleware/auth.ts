import { Request, Response, NextFunction } from 'express';

// If API_KEY is set in env, require that header 'x-api-key' matches it.
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const configured = process.env.API_KEY || '';
  if (!configured) return next(); // no API key configured: allow through (dev mode)

  const apiKeyHeader = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];
  const key: string | undefined =
    (typeof apiKeyHeader === 'string' ? apiKeyHeader : undefined) ??
    (typeof req.query.api_key === 'string' ? req.query.api_key : undefined) ??
    (typeof authHeader === 'string' ? authHeader : undefined);
  if (!key) return res.status(401).json({ error: 'missing_api_key' });
  // accept either the raw key or Bearer <key>
  const normalized = key.startsWith('Bearer ') ? key.replace('Bearer ', '') : key;
  if (normalized !== configured) return res.status(403).json({ error: 'invalid_api_key' });
  return next();
}

export default requireApiKey;
