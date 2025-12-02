import { Router, Request, Response } from 'express';
import prisma from './db';
import env from './env';
import { execSync } from 'child_process';
import { logger } from './logger';

const router = Router();

// Server start time for uptime calculation
const startTime = Date.now();

// Git commit hash (captured at startup)
let commitHash = 'unknown';
let commitDate = 'unknown';
try {
  commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  commitDate = execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim();
} catch {
  // Git not available or not a git repo - use env var if set
  commitHash = process.env.GIT_COMMIT_SHA || process.env.COMMIT_SHA || 'unknown';
}

interface StatusResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: {
    commit: string;
    commitDate: string;
    nodeVersion: string;
    appVersion: string;
  };
  uptime: {
    seconds: number;
    formatted: string;
  };
  environment: string;
  timestamp: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      latencyMs?: number;
      error?: string;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      heapUsedMB: number;
      heapTotalMB: number;
      rssMB: number;
      percentUsed: number;
    };
  };
}

/**
 * Format uptime into human readable string
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Check database connectivity and measure latency
 */
async function checkDatabase(): Promise<StatusResponse['checks']['database']> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    logger.error({ err: error }, 'Database health check failed');
    return {
      status: 'error',
      latencyMs: Date.now() - start,
      error: message,
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): StatusResponse['checks']['memory'] {
  const mem = process.memoryUsage();
  const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
  const rssMB = Math.round(mem.rss / 1024 / 1024);
  const percentUsed = Math.round((mem.heapUsed / mem.heapTotal) * 100);

  let status: 'ok' | 'warning' | 'critical' = 'ok';
  if (percentUsed > 90) {
    status = 'critical';
  } else if (percentUsed > 75) {
    status = 'warning';
  }

  return {
    status,
    heapUsedMB,
    heapTotalMB,
    rssMB,
    percentUsed,
  };
}

/**
 * GET /status
 * Comprehensive status endpoint for production monitoring
 */
router.get('/', async (_req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const dbCheck = await checkDatabase();
  const memoryCheck = checkMemory();

  // Determine overall status
  let overallStatus: StatusResponse['status'] = 'healthy';
  if (dbCheck.status === 'error') {
    overallStatus = 'unhealthy';
  } else if (memoryCheck.status === 'critical') {
    overallStatus = 'unhealthy';
  } else if (memoryCheck.status === 'warning') {
    overallStatus = 'degraded';
  }

  const response: StatusResponse = {
    status: overallStatus,
    version: {
      commit: commitHash,
      commitDate,
      nodeVersion: process.version,
      appVersion: process.env.npm_package_version || '0.1.0',
    },
    uptime: {
      seconds: uptimeSeconds,
      formatted: formatUptime(uptimeSeconds),
    },
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    checks: {
      database: dbCheck,
      memory: memoryCheck,
    },
  };

  // Set appropriate status code
  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  res.status(statusCode).json(response);
});

/**
 * GET /status/ready
 * Kubernetes readiness probe - is the service ready to accept traffic?
 */
router.get('/ready', async (_req: Request, res: Response) => {
  const dbCheck = await checkDatabase();

  if (dbCheck.status === 'ok') {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: 'database unavailable' });
  }
});

/**
 * GET /status/live
 * Kubernetes liveness probe - is the service alive?
 */
router.get('/live', (_req: Request, res: Response) => {
  // If we can respond, we're alive
  res.status(200).json({ alive: true });
});

export default router;
