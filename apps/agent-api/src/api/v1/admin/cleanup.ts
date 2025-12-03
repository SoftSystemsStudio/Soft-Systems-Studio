import { Router, Request, Response } from 'express';
import prisma from '../../../db';
import env from '../../../env';
import { logger } from '../../../logger';
import { asyncHandler } from '../../../middleware/errorHandler';

const router = Router();

/**
 * POST /api/v1/admin/cleanup-tokens
 * Clean up expired refresh tokens from the database
 *
 * This endpoint should be called by a cron job (e.g., Vercel Cron)
 * Protected by CRON_SECRET environment variable
 */
router.post(
  '/cleanup-tokens',
  asyncHandler(async (req: Request, res: Response) => {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;

    if (cronSecret) {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        logger.warn('Unauthorized cleanup-tokens attempt');
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
    } else if (env.NODE_ENV === 'production') {
      // In production, require CRON_SECRET
      logger.error('CRON_SECRET not configured in production');
      res.status(500).json({ error: 'CRON_SECRET not configured' });
      return;
    }

    const startTime = Date.now();

    try {
      // Delete expired refresh tokens
      const expiredTokensResult = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      // Delete revoked tokens older than 7 days (keep recent for audit)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const revokedTokensResult = await prisma.refreshToken.deleteMany({
        where: {
          revokedAt: {
            not: null,
            lt: sevenDaysAgo,
          },
        },
      });

      const duration = Date.now() - startTime;

      logger.info(
        {
          expiredDeleted: expiredTokensResult.count,
          revokedDeleted: revokedTokensResult.count,
          durationMs: duration,
        },
        'Token cleanup completed',
      );

      res.json({
        ok: true,
        expiredTokensDeleted: expiredTokensResult.count,
        revokedTokensDeleted: revokedTokensResult.count,
        durationMs: duration,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ err: error }, 'Token cleanup failed');
      res.status(500).json({
        error: 'Cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }),
);

/**
 * POST /api/v1/admin/cleanup-sessions
 * Clean up stale sessions and inactive user data
 */
router.post(
  '/cleanup-sessions',
  asyncHandler(async (req: Request, res: Response) => {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;

    if (cronSecret) {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
    } else if (env.NODE_ENV === 'production') {
      res.status(500).json({ error: 'CRON_SECRET not configured' });
      return;
    }

    const startTime = Date.now();

    try {
      // Delete old conversations without messages (orphaned)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Count messages per conversation to find orphaned ones
      const orphanedConversations = await prisma.conversation.findMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
          messages: {
            none: {},
          },
        },
        select: { id: true },
      });

      const deletedConversations = await prisma.conversation.deleteMany({
        where: {
          id: {
            in: orphanedConversations.map((c: { id: string }) => c.id),
          },
        },
      });

      const duration = Date.now() - startTime;

      logger.info(
        {
          conversationsDeleted: deletedConversations.count,
          durationMs: duration,
        },
        'Session cleanup completed',
      );

      res.json({
        ok: true,
        conversationsDeleted: deletedConversations.count,
        durationMs: duration,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ err: error }, 'Session cleanup failed');
      res.status(500).json({
        error: 'Cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }),
);

export default router;
