import { Router, Request, Response } from 'express';
import prisma from '../../../db';
import bcrypt from 'bcryptjs';
import env from '../../../env';
import { loginLimiter } from '../../../middleware/rate';
import { createAccessToken, createRefreshTokenInDb, TOKEN_CONFIG } from '../../../services/token';
import { validateBody } from '../../../lib/validate';
import { loginSchema } from '../../../schemas/auth';
import { z } from 'zod';

const router = Router();

// Extended login schema with optional workspaceId
const loginWithWorkspaceSchema = loginSchema.extend({
  workspaceId: z.string().uuid().optional(),
});

type LoginWithWorkspaceInput = z.infer<typeof loginWithWorkspaceSchema>;

// Cookie options for refresh token
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: TOKEN_CONFIG.refreshToken.expiresInMs,
  path: '/api/v1/auth/token', // Only sent to token endpoints
});

// POST /api/v1/auth/login
router.post(
  '/login',
  loginLimiter,
  validateBody(loginWithWorkspaceSchema),
  async (req: Request, res: Response) => {
    try {
      const {
        email,
        password,
        workspaceId: requestedWorkspace,
      } = req.body as LoginWithWorkspaceInput;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: 'invalid_credentials' });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

      // Find memberships for the user
      const memberships = await prisma.workspaceMembership.findMany({
        where: { userId: user.id },
      });
      if (!memberships || memberships.length === 0) {
        return res.status(403).json({ error: 'no_workspaces' });
      }

      // Choose workspace: prefer requestedWorkspace if user is a member, otherwise first membership
      const firstMembership = memberships[0];
      if (!firstMembership) {
        return res.status(403).json({ error: 'no_workspaces' });
      }

      let membership = firstMembership;
      if (requestedWorkspace) {
        const found = memberships.find((m) => m.workspaceId === requestedWorkspace);
        if (found) membership = found;
      }

      if (!env.JWT_SECRET) {
        return res.status(500).json({ error: 'server_missing_jwt_secret' });
      }

      // Create short-lived access token
      const accessToken = createAccessToken({
        sub: user.id,
        email: user.email,
        workspaceId: membership.workspaceId,
        role: membership.role,
      });

      // Create refresh token and store in DB
      const { token: refreshToken, expiresAt } = await createRefreshTokenInDb(
        user.id,
        membership.workspaceId,
      );

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

      return res.json({
        ok: true,
        accessToken,
        workspaceId: membership.workspaceId,
        role: membership.role,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (err: unknown) {
      console.error('login error', err);
      const message = (err as { message?: string })?.message ?? 'server_error';
      return res.status(500).json({ error: message });
    }
  },
);

export default router;
