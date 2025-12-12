import { Router, Request, Response } from 'express';
import client from '../../../metrics';
import { requireMetricsAuth } from '../../../middleware/requireMetricsAuth';
import { rateLimitMetrics } from '../../../middleware/rateLimitMetrics';

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

export default router;
