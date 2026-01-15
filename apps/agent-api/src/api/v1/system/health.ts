import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../../db';
import env from '../../../env';
import { isRedisHealthy } from '../../../lib/redis';
import { pingQdrant } from '../../../services/qdrant';
import { logger } from '../../../logger';

const router = Router();

// Track server start time for startup grace period
const serverStartTime = Date.now();
// Grace period: allow 30 seconds for services to initialize before requiring them
const STARTUP_GRACE_PERIOD_MS = 30_000;

/**
 * Check if we're still in startup grace period
 * During this period, we return healthy even if external services aren't ready yet
 */
function isInStartupGracePeriod(): boolean {
  return Date.now() - serverStartTime < STARTUP_GRACE_PERIOD_MS;
}

// Wrap async handler to avoid ESLint no-misused-promises
const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res)).catch(next);
  };

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const inGracePeriod = isInStartupGracePeriod();
    let db = false;
    let redis = false;
    let qdrantHealthy = false;
    let qdrantLatency: number | null = null;

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch (e) {
      logger.warn({ err: e }, '[health] db check failed');
    }

    // Check Redis
    try {
      redis = await isRedisHealthy();
    } catch (e) {
      logger.warn({ err: e }, '[health] redis check failed');
    }

    // Check Qdrant quickly with a small timeout budget
    try {
      const start = Date.now();
      // short timeout (250-500ms) so health doesn't block
      qdrantHealthy = await pingQdrant(env.QDRANT_HEALTH_TIMEOUT_MS ?? 500);
      qdrantLatency = Date.now() - start;
    } catch (e) {
      logger.warn({ err: e }, '[health] qdrant check failed');
      qdrantHealthy = false;
      qdrantLatency = null;
    }

    // During startup grace period, always return 200 to pass health checks
    // This allows all services (DB, Redis, Qdrant) time to establish connections
    if (inGracePeriod) {
      const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
      logger.info(
        { db, redis, qdrantHealthy, uptimeSeconds },
        '[health] In startup grace period, returning 200 to allow services to connect',
      );

      // Always return 200 during grace period - Railway needs this to pass health checks
      res.status(200).json({
        status: 'starting',
        startupGracePeriod: true,
        uptimeSeconds,
        graceRemainingSeconds: Math.ceil((STARTUP_GRACE_PERIOD_MS - (Date.now() - serverStartTime)) / 1000),
        services: {
          database: db ? 'healthy' : 'connecting',
          redis: redis ? 'healthy' : 'connecting',
          qdrant: qdrantHealthy ? 'healthy' : 'connecting',
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
      return;
    }

    // After grace period, apply normal health requirements
    const requireRedis = env.REQUIRE_REDIS_HEALTH !== false;
    const requireQdrant = env.REQUIRE_QDRANT_HEALTH !== false;

    const allHealthy =
      db && (requireRedis ? redis : true) && (requireQdrant ? qdrantHealthy : true);

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
        requireRedisHealth: requireRedis,
        requireQdrantHealth: requireQdrant,
      },
    });
  }),
);

export default router;
