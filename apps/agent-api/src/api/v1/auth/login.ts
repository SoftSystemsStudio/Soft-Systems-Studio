import { Router, Request, Response } from 'express';
import prisma from '../../../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../../../env';
import { loginLimiter } from '../../../middleware/rate';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const body = req.body as { email?: string; password?: string; workspaceId?: string };
    const email = body.email;
    const password = body.password;
    const requestedWorkspace = body.workspaceId;
    if (!email || !password) return res.status(400).json({ error: 'invalid_payload' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

    // Find memberships for the user
    const memberships = await prisma.workspaceMembership.findMany({ where: { userId: user.id } });
    if (!memberships || memberships.length === 0) {
      return res.status(403).json({ error: 'no_workspaces' });
    }

    // Choose workspace: prefer requestedWorkspace if user is a member, otherwise first membership
    let membership = memberships[0];
    if (requestedWorkspace) {
      const found = memberships.find((m) => m.workspaceId === requestedWorkspace);
      if (found) membership = found;
    }

    const payload = {
      sub: user.id,
      email: user.email,
      workspaceId: membership.workspaceId,
      role: membership.role,
    };
    if (!env.JWT_SECRET) return res.status(500).json({ error: 'server_missing_jwt_secret' });
    const token = jwt.sign(payload, env.JWT_SECRET, {
      algorithm: env.JWT_ALGORITHM,
      expiresIn: '7d',
    });

    return res.json({
      ok: true,
      token,
      workspaceId: membership.workspaceId,
      role: membership.role,
    });
  } catch (err: unknown) {
    console.error('login error', err);
    const message = (err as { message?: string })?.message ?? 'server_error';
    return res.status(500).json({ error: message });
  }
});

export default router;
