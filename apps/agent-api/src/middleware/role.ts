import { Request, Response, NextFunction } from 'express';
import '../types/auth'; // Import to register global types
import { ROLES, ROLE_HIERARCHY } from '../types/auth';
import { logger } from '../logger';

/**
 * Role hierarchy levels - higher index = more permissions
 * service role is equivalent to member (limited access)
 */
const ROLE_LEVELS: Record<string, number> = {
  viewer: 0,
  service: 1, // API keys get service role - between viewer and member
  member: 2,
  user: 2, // alias for member
  agent: 2, // alias for member
  manager: 3,
  admin: 4,
  owner: 4, // alias for admin
  super_admin: 5,
};

function getRoleLevel(role: string): number {
  const normalized = role.toLowerCase();
  return ROLE_LEVELS[normalized] ?? -1;
}

/**
 * requireRole middleware: check that the authenticated principal has at least one of the allowed roles.
 * 
 * SECURITY NOTES:
 * - API keys do NOT automatically bypass role checks
 * - API keys have 'service' role which must be explicitly allowed
 * - Anonymous users are always rejected
 */
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

      // Collect all roles from auth context
      const roles: string[] = [];
      if (auth.role && typeof auth.role === 'string') roles.push(auth.role);
      if (Array.isArray(auth.roles)) roles.push(...auth.roles);

      if (roles.length === 0) {
        logger.warn({ userId: auth.sub, apiKey: auth.apiKey }, 'No roles assigned');
        return res.status(403).json({
          error: 'forbidden',
          message: 'No roles assigned to user',
          code: 'NO_ROLES',
        });
      }

      // Normalize to lower-case for comparison
      const normalized = roles.map((r) => (r || '').toLowerCase());
      const allowedNorm = allowed.map((r) => (r || '').toLowerCase());

      // Check if user has any of the allowed roles
      const ok = normalized.some((r) => allowedNorm.includes(r));
      if (!ok) {
        logger.warn(
          { userId: auth.sub, userRoles: roles, requiredRoles: allowed },
          'Insufficient role',
        );
        return res.status(403).json({
          error: 'forbidden',
          message: `Required role(s): ${allowed.join(', ')}`,
          code: 'INSUFFICIENT_ROLE',
          required: allowed,
        });
      }

      return next();
    } catch (err: unknown) {
      logger.error({ error: err }, 'requireRole error');
      return res.status(500).json({ error: 'server_error' });
    }
  };
}

/**
 * requireMinRole middleware: check that user has at least the minimum role level (hierarchical)
 * 
 * SECURITY NOTES:
 * - Uses hierarchical comparison: owner > admin > manager > member > service > viewer
 * - API keys have 'service' role level
 */
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

      // Get user's roles
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

      // Get the highest role level the user has
      const userMaxLevel = Math.max(...roles.map(getRoleLevel));
      const requiredLevel = getRoleLevel(minRole);

      if (requiredLevel < 0) {
        logger.error({ minRole }, 'Invalid minimum role specified');
        return res
          .status(500)
          .json({ error: 'server_error', message: 'Invalid role configuration' });
      }

      if (userMaxLevel < requiredLevel) {
        logger.warn(
          { userId: auth.sub, userRoles: roles, minRole, userLevel: userMaxLevel, requiredLevel },
          'Insufficient role level',
        );
        return res.status(403).json({
          error: 'forbidden',
          message: `Minimum required role: ${minRole}`,
          code: 'INSUFFICIENT_ROLE',
          required: minRole,
        });
      }

      return next();
    } catch (err: unknown) {
      logger.error({ error: err }, 'requireMinRole error');
      return res.status(500).json({ error: 'server_error' });
    }
  };
}

/**
 * requireAdmin helper: check if user has admin or super_admin role
 */
export function requireAdmin() {
  return requireMinRole(ROLES.ADMIN);
}

/**
 * requireServiceOrAbove: allows API keys (service role) or any user role
 * Use this for endpoints that should be accessible to both API keys and authenticated users
 */
export function requireServiceOrAbove() {
  return requireMinRole('service');
}

// Re-export ROLES for convenience
export { ROLES, ROLE_HIERARCHY };

export default requireRole;
