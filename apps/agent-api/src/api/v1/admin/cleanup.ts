import { Router, Response } from 'express';
import prisma from '../../../db';
import { logger } from '../../../logger';
import { asyncHandler } from '../../../middleware/errorHandler';
import { requireAdminAuth, logAdminAction, type AdminRequest } from '../../../middleware/adminAuth';
import { cronLimiter } from '../../../middleware/rate';

const router = Router();

/**
 * POST /api/v1/admin/cleanup-tokens
 * Clean up expired refresh tokens from the database
 *
 * Authentication: Requires admin auth (CRON_SECRET, admin JWT, or admin API key)
 * Rate limited: 10 requests/minute in production
 *
 * This endpoint should be called by a cron job (e.g., Vercel Cron)
 */
router.post(
  '/cleanup-tokens',
  cronLimiter,
  requireAdminAuth,
  asyncHandler(async (req: AdminRequest, res: Response) => {
    logAdminAction(req, 'cleanup_tokens_started');

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

      logAdminAction(req, 'cleanup_tokens_completed', {
        expiredDeleted: expiredTokensResult.count,
        revokedDeleted: revokedTokensResult.count,
        durationMs: duration,
      });

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
      logAdminAction(req, 'cleanup_tokens_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
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
 *
 * Authentication: Requires admin auth (CRON_SECRET, admin JWT, or admin API key)
 * Rate limited: 10 requests/minute in production
 */
router.post(
  '/cleanup-sessions',
  cronLimiter,
  requireAdminAuth,
  asyncHandler(async (req: AdminRequest, res: Response) => {
    logAdminAction(req, 'cleanup_sessions_started');

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

      logAdminAction(req, 'cleanup_sessions_completed', {
        conversationsDeleted: deletedConversations.count,
        durationMs: duration,
      });

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
      logAdminAction(req, 'cleanup_sessions_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      logger.error({ err: error }, 'Session cleanup failed');
      res.status(500).json({
        error: 'Cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }),
);

export default router;
