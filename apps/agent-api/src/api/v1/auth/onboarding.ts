import { Router, Request, Response } from 'express';
import prisma from '../../../db';
import bcrypt from 'bcryptjs';
import env from '../../../env';
import { onboardingLimiter } from '../../../middleware/rate';
import { createAccessToken, createRefreshTokenInDb, TOKEN_CONFIG } from '../../../services/token';

const router = Router();

// Cookie options for refresh token
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: TOKEN_CONFIG.refreshToken.expiresInMs,
  path: '/api/v1/auth/token', // Only sent to token endpoints
});

// Create workspace + initial admin user and return JWT
router.post('/create-workspace', onboardingLimiter, async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      workspaceName?: string;
      adminEmail?: string;
      adminPassword?: string;
    };
    const workspaceName = body.workspaceName;
    const adminEmail = body.adminEmail;
    const adminPassword = body.adminPassword;
    if (!workspaceName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    // Create workspace
    const workspace = await prisma.workspace.create({ data: { name: workspaceName } });

    // Create user with hashed password
    const hashed = await bcrypt.hash(adminPassword, 10);
    const user = await prisma.user.create({ data: { email: adminEmail, password: hashed } });

    // Create membership with admin role
    await prisma.workspaceMembership.create({
      data: { workspaceId: workspace.id, userId: user.id, role: 'admin' },
    });

    if (!env.JWT_SECRET) return res.status(500).json({ error: 'server_missing_jwt_secret' });

    // Create short-lived access token
    const accessToken = createAccessToken({
      sub: user.id,
      email: user.email,
      workspaceId: workspace.id,
      role: 'admin',
    });

    // Create refresh token and store in DB
    const { token: refreshToken, expiresAt } = await createRefreshTokenInDb(user.id, workspace.id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

    return res.json({
      ok: true,
      workspaceId: workspace.id,
      accessToken,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err: unknown) {
    console.error('onboarding error', err);
    const message = (err as { message?: string })?.message ?? 'server_error';
    return res.status(500).json({ error: message });
  }
});

export default router;
