import { Router, Request, Response } from 'express';
import {
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  TOKEN_CONFIG,
} from '../../../services/token';
import { tokenLimiter } from '../../../middleware/rate';
import requireAuth from '../../../middleware/auth-combined';
import { asyncHandler } from '../../../middleware/errorHandler';
import env from '../../../env';

const router = Router();

// Helper to safely extract refresh token from cookie or body
function getRefreshTokenFromRequest(req: Request): string | undefined {
  const cookieToken =
    typeof req.cookies === 'object' && req.cookies !== null
      ? (req.cookies as Record<string, string>).refreshToken
      : undefined;

  const bodyToken = (req.body as { refreshToken?: string } | undefined)?.refreshToken;

  return cookieToken ?? bodyToken;
}

// Cookie options for refresh token
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: TOKEN_CONFIG.refreshToken.expiresInMs,
  path: '/api/v1/auth/token', // Only sent to token endpoints
});

// POST /api/v1/auth/token/refresh
// Rotate refresh token and get new access token
router.post(
  '/token/refresh',
  tokenLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    // Get refresh token from cookie or body (prefer cookie)
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      res.status(400).json({ error: 'missing_refresh_token' });
      return;
    }

    const result = await rotateRefreshToken(refreshToken);

    if (!result) {
      // Clear the invalid cookie
      res.clearCookie('refreshToken', { path: '/api/v1/auth/token' });
      res.status(401).json({ error: 'invalid_or_expired_refresh_token' });
      return;
    }

    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    res.json({
      ok: true,
      accessToken: result.accessToken,
      expiresAt: result.expiresAt.toISOString(),
    });
  }),
);

// POST /api/v1/auth/token/revoke
// Logout: revoke the current refresh token
router.post(
  '/token/revoke',
  asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Clear the cookie regardless
    res.clearCookie('refreshToken', { path: '/api/v1/auth/token' });

    res.json({ ok: true });
  }),
);

// POST /api/v1/auth/token/revoke-all
// Security: revoke all tokens for authenticated user
router.post(
  '/token/revoke-all',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    // This endpoint requires authentication
    if (!req.auth?.sub) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }

    const userId = req.auth.sub;
    await revokeAllUserTokens(userId);

    // Clear the cookie
    res.clearCookie('refreshToken', { path: '/api/v1/auth/token' });

    res.json({ ok: true, message: 'all_tokens_revoked' });
  }),
);

export default router;
