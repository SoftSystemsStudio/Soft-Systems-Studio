import { Router, Request, Response } from 'express';
import prisma from '../../../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../../../env';
import { onboardingLimiter } from '../../../middleware/rate';

const router = Router();

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

    // Create JWT for the user (includes workspaceId and role)
    const payload = {
      sub: user.id,
      email: user.email,
      workspaceId: workspace.id,
      role: 'admin',
    };
    if (!env.JWT_SECRET) return res.status(500).json({ error: 'server_missing_jwt_secret' });
    const token = jwt.sign(payload, env.JWT_SECRET, {
      algorithm: env.JWT_ALGORITHM,
      expiresIn: '30d',
    });

    return res.json({ ok: true, workspaceId: workspace.id, token });
  } catch (err: unknown) {
    console.error('onboarding error', err);
    const message = (err as { message?: string })?.message ?? 'server_error';
    return res.status(500).json({ error: message });
  }
});

export default router;
