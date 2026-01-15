import { Router, Request, Response } from 'express';
import {
  collectMetrics,
  recordAutomation,
  recordTokens,
  recordResponseTime,
} from '../../../services/metricsCollector';
import { logger } from '../../../logger';

/**
 * Live Metrics API Routes
 *
 * Provides real-time metrics for the frontend dashboard
 */

const router = Router();

/**
 * GET /api/v1/metrics/live
 * Returns current system metrics
 */
router.get('/live', async (_req: Request, res: Response) => {
  try {
    const metrics = await collectMetrics();

    res.json({
      timestamp: new Date().toISOString(),
      metrics: [
        {
          id: 'uptime',
          label: 'System Uptime',
          value: metrics.uptime,
          unit: '%',
          trend: 'neutral',
          color: '#10b981',
          icon: '✓',
        },
        {
          id: 'automations',
          label: 'Automations Today',
          value: metrics.automationsToday,
          trend: metrics.automationsTrend,
          change: metrics.automationsChange,
          color: '#c0ff6b',
          icon: '⚡',
        },
        {
          id: 'response-time',
          label: 'API Response',
          value: metrics.avgResponseTime,
          unit: 'ms',
          trend: metrics.responseTimeTrend,
          change: metrics.responseTimeChange,
          color: '#22d3ee',
          icon: '⏱',
        },
        {
          id: 'tokens',
          label: 'AI Tokens Today',
          value: metrics.tokensToday,
          trend: 'up',
          color: '#a78bfa',
          icon: '🧠',
        },
        {
          id: 'clients',
          label: 'Active Systems',
          value: metrics.activeClients,
          trend: 'up',
          color: '#f59e0b',
          icon: '🏢',
        },
        {
          id: 'queue',
          label: 'Queue Depth',
          value: metrics.queueDepth,
          trend: metrics.queueDepth > 100 ? 'up' : 'neutral',
          color: metrics.queueDepth > 100 ? '#ef4444' : '#6b7280',
          icon: '📋',
        },
      ],
    });
  } catch (error) {
    logger.error({ error }, 'Failed to collect live metrics');
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

/**
 * POST /api/v1/metrics/record
 * Record metrics from internal services
 */
router.post('/record', (req: Request, res: Response) => {
  try {
    const { type, value } = req.body as { type: string; value?: number };

    switch (type) {
      case 'automation':
        recordAutomation();
        break;
      case 'tokens':
        if (typeof value === 'number') {
          recordTokens(value);
        }
        break;
      case 'response_time':
        if (typeof value === 'number') {
          recordResponseTime(value);
        }
        break;
      default:
        res.status(400).json({ error: 'Invalid metric type' });
        return;
    }

    res.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to record metric');
    res.status(500).json({ error: 'Failed to record metric' });
  }
});

/**
 * GET /api/v1/metrics/health
 * Quick health check for monitoring
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const metrics = await collectMetrics();

    const isHealthy =
      metrics.uptime > 99 && metrics.avgResponseTime < 500 && metrics.queueDepth < 1000;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      uptime: metrics.uptime,
      responseTime: metrics.avgResponseTime,
      queueDepth: metrics.queueDepth,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'Health check failed' });
  }
});

export default router;
