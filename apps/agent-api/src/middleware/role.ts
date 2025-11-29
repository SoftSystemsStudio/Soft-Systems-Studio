import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      auth?: any;
    }
  }
}

// requireRole middleware: check that the authenticated principal has at least one of the allowed roles.
export function requireRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = req.auth || {};

      // If the request was authenticated with an API key, allow by default
      if (auth.apiKey) return next();

      // Roles may be a string (single) or array
      const roles: string[] = [];
      if (auth.role && typeof auth.role === 'string') roles.push(auth.role);
      if (Array.isArray(auth.roles)) roles.push(...auth.roles);

      // Normalize to lower-case for comparison
      const normalized = roles.map((r) => (r || '').toLowerCase());
      const allowedNorm = allowed.map((r) => (r || '').toLowerCase());

      const ok = normalized.some((r) => allowedNorm.includes(r));
      if (!ok) return res.status(403).json({ error: 'forbidden', required: allowed });

      return next();
    } catch (err: any) {
      console.error('requireRole error', err);
      return res.status(500).json({ error: 'server_error' });
    }
  };
}

export default requireRole;
