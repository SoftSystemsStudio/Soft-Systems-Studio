import { Router, Request, Response, NextFunction } from 'express';
import prisma from './db';
import env from './env';
import { isRedisHealthy } from './lib/redis';

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

    const allHealthy = db && redis;

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      services: {
        database: db ? 'healthy' : 'unhealthy',
        redis: redis ? 'healthy' : 'unhealthy',
      },
      env: {
        nodeEnv: env.NODE_ENV,
        openaiKeyPresent: Boolean(process.env.OPENAI_API_KEY),
      },
    });
  }),
);

export default router;
