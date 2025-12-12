/**
 * Metrics-specific authentication middleware
 * Requires ADMIN_API_KEY for access to sensitive observability data
 */
import { Request, Response, NextFunction } from 'express';
import env from '../env';
import { logger } from '../logger';

/**
 * Middleware to require admin API key for metrics endpoint
 * 
 * Usage: app.get('/metrics', requireMetricsAuth, metricsHandler)
 * 
 * Security notes:
 * - Protects against information leakage (workspaces, users, system internals)
 * - Rate limited separately to prevent scrape abuse
 * - Used by Prometheus scraper with dedicated service account
 * 
 * Configuration:
 * - Set ADMIN_API_KEY in environment (min 32 chars)
 * - Use x-api-key header or api_key query param
 * - Example: curl http://localhost:4000/metrics -H "x-api-key: <admin-key>"
 */
export function requireMetricsAuth(req: Request, res: Response, next: NextFunction) {
  const apiKeyHeader = (req.headers['x-api-key'] as string) || '';
  const apiKeyQuery = (req.query?.api_key as string) || '';
  const providedKey = apiKeyHeader || apiKeyQuery;

  const adminApiKey = env.ADMIN_API_KEY;

  // Check if admin API key is configured
  if (!adminApiKey) {
    logger.error('ADMIN_API_KEY not configured - metrics endpoint disabled');
    return res.status(503).json({
      error: 'metrics_unavailable',
      message: 'Metrics endpoint is not configured. Set ADMIN_API_KEY environment variable.',
      code: 'METRICS_NOT_CONFIGURED',
    });
  }

  // Check if API key provided
  if (!providedKey) {
    logger.warn({ ip: req.ip, path: req.path }, 'Metrics access attempt without credentials');
    return res.status(401).json({
      error: 'missing_credentials',
      message: 'Admin API key required. Provide via x-api-key header or api_key query parameter.',
      code: 'MISSING_CREDENTIALS',
    });
  }

  // Verify API key matches
  if (providedKey !== adminApiKey) {
    logger.warn({ ip: req.ip, path: req.path }, 'Invalid admin API key attempt');
    return res.status(403).json({
      error: 'invalid_credentials',
      message: 'Invalid admin API key',
      code: 'INVALID_CREDENTIALS',
    });
  }

  // Success - log for audit trail
  logger.info({ ip: req.ip, path: req.path }, 'Metrics access granted');

  // Attach auth info for rate limiter to use
  (req as any).auth = {
    apiKey: true,
    apiKeyId: 'admin',
    role: 'admin',
    roles: ['admin'],
  };

  return next();
}
