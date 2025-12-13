import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../../db';
import env from '../../../env';
import { isRedisHealthy } from '../../../lib/redis';
import { pingQdrant } from '../../../services/qdrant';

const router = Router();

// Wrap async handler to avoid ESLint no-misused-promises
const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res)).catch(next);
  };

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    let db = false;
    let redis = false;
    let qdrantHealthy = false;
    let qdrantLatency: number | null = null;

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch (e) {
      console.error('[health] db check failed', e);
    }

    // Check Redis
    try {
      redis = await isRedisHealthy();
    } catch (e) {
      console.error('[health] redis check failed', e);
    }

    // Check Qdrant quickly with a small timeout budget
    try {
      const start = Date.now();
      // short timeout (250-500ms) so health doesn't block
      qdrantHealthy = await pingQdrant(Number((env as any).QDRANT_HEALTH_TIMEOUT_MS ?? 500));
      qdrantLatency = Date.now() - start;
    } catch (e) {
      console.error('[health] qdrant check failed', e);
      qdrantHealthy = false;
      qdrantLatency = null;
    }

    // Consider Qdrant a critical dependency: health must include it.
    const allHealthy = db && redis && qdrantHealthy;

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      services: {
        database: db ? 'healthy' : 'unhealthy',
        redis: redis ? 'healthy' : 'unhealthy',
        qdrant: qdrantHealthy ? 'healthy' : 'unhealthy',
      },
      qdrant: {
        healthy: qdrantHealthy,
        latencyMs: qdrantLatency,
      },
      env: {
        nodeEnv: env.NODE_ENV,
        openaiKeyPresent: Boolean(env.OPENAI_API_KEY),
      },
    });
  }),
);

export default router;
