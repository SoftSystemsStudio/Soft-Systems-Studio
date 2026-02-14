import { Router, Request, Response } from 'express';
import client from '../../../metrics';
import { requireMetricsAuth } from '../../../middleware/requireMetricsAuth';
import { rateLimitMetrics } from '../../../middleware/rateLimitMetrics';
import { collectMetrics } from '../../../services/metricsCollector';
import { logger } from '../../../logger';

const router = Router();

/**
 * GET /api/v1/observability/metrics
 * Prometheus metrics endpoint
 * Protected by metrics-specific auth and rate limiting
 */
router.get('/', requireMetricsAuth, rateLimitMetrics, (_req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  void client.register
    .metrics()
    .then((m) => res.send(m))
    .catch((err: Error) => res.status(500).send(err.message));
});

/**
 * GET /api/v1/observability/metrics/snapshot
 * Returns current metrics as JSON (for dashboard polling fallback)
 * Protected by same auth/rate limit as Prometheus endpoint
 */
router.get('/snapshot', requireMetricsAuth, rateLimitMetrics, async (_req: Request, res: Response) => {
  try {
    const snapshot = await collectMetrics();
    res.json(snapshot);
  } catch (err) {
    logger.error({ err }, 'Failed to collect metrics');
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

export default router;
