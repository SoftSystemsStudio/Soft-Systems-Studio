import { Router, Request, Response } from 'express';
import prisma from '../../../db';
import bcrypt from 'bcryptjs';
import env from '../../../env';
import { onboardingLimiter } from '../../../middleware/rate';
import { createAccessToken, createRefreshTokenInDb, TOKEN_CONFIG } from '../../../services/token';
import { validateBody, slugSchema } from '../../../lib/validate';
import { z } from 'zod';

const router = Router();

// Onboarding schema - creates workspace + admin user
const createWorkspaceSchema = z.object({
  workspaceName: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(100, 'Workspace name must be at most 100 characters')
    .trim(),
  workspaceSlug: slugSchema.optional(),
  adminEmail: z
    .string()
    .email('Invalid email format')
    .transform((val) => val.toLowerCase().trim()),
  adminPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

// Cookie options for refresh token
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: TOKEN_CONFIG.refreshToken.expiresInMs,
  path: '/api/v1/auth/token', // Only sent to token endpoints
});

// Create workspace + initial admin user and return JWT
router.post(
  '/create-workspace',
  onboardingLimiter,
  validateBody(createWorkspaceSchema),
  async (req: Request, res: Response) => {
    try {
      const { workspaceName, workspaceSlug, adminEmail, adminPassword } =
        req.body as CreateWorkspaceInput;

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });
      if (existingUser) {
        return res.status(409).json({ error: 'email_already_exists' });
      }

      // Generate slug from name if not provided
      const slug =
        workspaceSlug ||
        workspaceName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      // Check if slug already exists
      const existingWorkspace = await prisma.workspace.findFirst({
        where: { slug },
      });
      if (existingWorkspace) {
        return res.status(409).json({ error: 'workspace_slug_exists' });
      }

      // Create workspace with slug
      const workspace = await prisma.workspace.create({
        data: { name: workspaceName, slug },
      });

      // Create user with hashed password
      const hashed = await bcrypt.hash(adminPassword, 10);
      const user = await prisma.user.create({
        data: { email: adminEmail, password: hashed },
      });

      // Create membership with admin role
      await prisma.workspaceMembership.create({
        data: { workspaceId: workspace.id, userId: user.id, role: 'admin' },
      });

      if (!env.JWT_SECRET) {
        return res.status(500).json({ error: 'server_missing_jwt_secret' });
      }

      // Create short-lived access token
      const accessToken = createAccessToken({
        sub: user.id,
        email: user.email,
        workspaceId: workspace.id,
        role: 'admin',
      });

      // Create refresh token and store in DB
      const { token: refreshToken, expiresAt } = await createRefreshTokenInDb(
        user.id,
        workspace.id,
      );

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

      return res.json({
        ok: true,
        workspaceId: workspace.id,
        workspaceSlug: slug,
        accessToken,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (err: unknown) {
      console.error('onboarding error', err);
      const message = (err as { message?: string })?.message ?? 'server_error';
      return res.status(500).json({ error: message });
    }
  },
);

export default router;
