import { Router } from 'express';
import prisma from '../../../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../../../env';

const router = Router();

// Create workspace + initial admin user and return JWT
router.post('/create-workspace', async (req, res) => {
  try {
    const { workspaceName, adminEmail, adminPassword } = req.body as any;
    if (!workspaceName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    // Create workspace
    const workspace = await prisma.workspace.create({ data: { name: workspaceName } });

    // Create user with hashed password
    const hashed = await bcrypt.hash(adminPassword, 10);
    const user = await prisma.user.create({ data: { email: adminEmail, password: hashed } });

    // Create membership with admin role
    await prisma.workspaceMembership.create({ data: { workspaceId: workspace.id, userId: user.id, role: 'admin' } });

    // Create JWT for the user (includes workspaceId and role)
    const payload = { sub: user.id, email: user.email, workspaceId: workspace.id, role: 'admin' } as any;
    if (!env.JWT_SECRET) return res.status(500).json({ error: 'server_missing_jwt_secret' });
    const token = jwt.sign(payload, env.JWT_SECRET, { algorithm: env.JWT_ALGORITHM, expiresIn: '30d' as any });

    return res.json({ ok: true, workspaceId: workspace.id, token });
  } catch (err: any) {
    console.error('onboarding error', err);
    return res.status(500).json({ error: err?.message || 'server_error' });
  }
});

export default router;
