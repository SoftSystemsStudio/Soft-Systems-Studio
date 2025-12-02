import { Router, Request, Response } from 'express';
import {
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  TOKEN_CONFIG,
} from '../../../services/token';
import { tokenLimiter } from '../../../middleware/rate';
import requireAuth from '../../../middleware/auth-combined';

const router = Router();

// Cookie options for refresh token
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: TOKEN_CONFIG.refreshToken.expiresInMs,
  path: '/api/v1/auth/token', // Only sent to token endpoints
});

// POST /api/v1/auth/token/refresh
// Rotate refresh token and get new access token
router.post('/token/refresh', tokenLimiter, async (req: Request, res: Response) => {
  try {
    // Get refresh token from cookie or body (prefer cookie)
    const refreshToken =
      req.cookies?.refreshToken || (req.body as { refreshToken?: string })?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: 'missing_refresh_token' });
    }

    const result = await rotateRefreshToken(refreshToken);

    if (!result) {
      // Clear the invalid cookie
      res.clearCookie('refreshToken', { path: '/api/v1/auth/token' });
      return res.status(401).json({ error: 'invalid_or_expired_refresh_token' });
    }

    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    return res.json({
      ok: true,
      accessToken: result.accessToken,
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (err: unknown) {
    console.error('token refresh error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/v1/auth/token/revoke
// Logout: revoke the current refresh token
router.post('/token/revoke', async (req: Request, res: Response) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken || (req.body as { refreshToken?: string })?.refreshToken;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Clear the cookie regardless
    res.clearCookie('refreshToken', { path: '/api/v1/auth/token' });

    return res.json({ ok: true });
  } catch (err: unknown) {
    console.error('token revoke error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/v1/auth/token/revoke-all
// Security: revoke all tokens for authenticated user
router.post('/token/revoke-all', requireAuth, async (req: Request, res: Response) => {
  try {
    // This endpoint requires authentication
    if (!req.auth || !req.auth.sub) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const userId = req.auth.sub as string;
    await revokeAllUserTokens(userId);

    // Clear the cookie
    res.clearCookie('refreshToken', { path: '/api/v1/auth/token' });

    return res.json({ ok: true, message: 'all_tokens_revoked' });
  } catch (err: unknown) {
    console.error('token revoke-all error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

export default router;
