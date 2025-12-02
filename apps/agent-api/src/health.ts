import { Router, Request, Response, NextFunction } from 'express';
import prisma from './db';
import env from './env';

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
    try {
      // lightweight DB connectivity check
      // using a raw query that works across Postgres versions
      await prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch (e) {
      console.error('[health] db check failed', e);
    }

    res.json({
      status: db ? 'ok' : 'degraded',
      db,
      env: {
        nodeEnv: env.NODE_ENV,
        openaiKeyPresent: Boolean(process.env.OPENAI_API_KEY),
      },
    });
  }),
);

export default router;
