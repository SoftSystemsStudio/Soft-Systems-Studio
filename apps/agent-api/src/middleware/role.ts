import { Request, Response, NextFunction } from 'express';
import '../types/auth'; // Import to register global types
import { ROLES, ROLE_HIERARCHY } from '../types/auth';

function getRoleLevel(role: string): number {
  const normalized = role.toLowerCase();
  const index = ROLE_HIERARCHY.findIndex((r) => r === normalized);
  return index >= 0 ? index : -1;
}

// requireRole middleware: check that the authenticated principal has at least one of the allowed roles.
export function requireRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = req.auth || {};

      // Must be authenticated first
      if (!auth || auth.anonymous) {
        return res.status(401).json({
          error: 'unauthorized',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      // If the request was authenticated with an API key, allow by default
      // (API keys are considered service accounts with full access)
      if (auth.apiKey) return next();

      // Roles may be a string (single) or array
      const roles: string[] = [];
      if (auth.role && typeof auth.role === 'string') roles.push(auth.role);
      if (Array.isArray(auth.roles)) roles.push(...auth.roles);

      if (roles.length === 0) {
        return res.status(403).json({
          error: 'forbidden',
          message: 'No roles assigned to user',
          code: 'NO_ROLES',
        });
      }

      // Normalize to lower-case for comparison
      const normalized = roles.map((r) => (r || '').toLowerCase());
      const allowedNorm = allowed.map((r) => (r || '').toLowerCase());

      const ok = normalized.some((r) => allowedNorm.includes(r));
      if (!ok) {
        return res.status(403).json({
          error: 'forbidden',
          message: `Required role(s): ${allowed.join(', ')}`,
          code: 'INSUFFICIENT_ROLE',
          required: allowed,
        });
      }

      return next();
    } catch (err: unknown) {
      console.error('requireRole error', err);
      return res.status(500).json({ error: 'server_error' });
    }
  };
}

// requireMinRole middleware: check that user has at least the minimum role level (hierarchical)
export function requireMinRole(minRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = req.auth || {};

      // Must be authenticated first
      if (!auth || auth.anonymous) {
        return res.status(401).json({
          error: 'unauthorized',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      // API keys bypass role checks
      if (auth.apiKey) return next();

      // Get user's highest role level
      const roles: string[] = [];
      if (auth.role && typeof auth.role === 'string') roles.push(auth.role);
      if (Array.isArray(auth.roles)) roles.push(...auth.roles);

      if (roles.length === 0) {
        return res.status(403).json({
          error: 'forbidden',
          message: 'No roles assigned to user',
          code: 'NO_ROLES',
        });
      }

      const userMaxLevel = Math.max(...roles.map(getRoleLevel));
      const requiredLevel = getRoleLevel(minRole);

      if (requiredLevel < 0) {
        console.error(`Invalid minimum role specified: ${minRole}`);
        return res
          .status(500)
          .json({ error: 'server_error', message: 'Invalid role configuration' });
      }

      if (userMaxLevel < requiredLevel) {
        return res.status(403).json({
          error: 'forbidden',
          message: `Minimum required role: ${minRole}`,
          code: 'INSUFFICIENT_ROLE',
          required: minRole,
        });
      }

      return next();
    } catch (err: unknown) {
      console.error('requireMinRole error', err);
      return res.status(500).json({ error: 'server_error' });
    }
  };
}

// isAdmin helper: check if user has admin or super_admin role
export function requireAdmin() {
  return requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN);
}

// Re-export ROLES for convenience
export { ROLES };

export default requireRole;
