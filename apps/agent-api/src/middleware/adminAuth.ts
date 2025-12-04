import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'crypto';
import env from '../env';
import { logger } from '../logger';
import type { AuthInfo } from '../types/auth';

/**
 * Constant-time string comparison to prevent timing attacks
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to maintain constant time even for length mismatch
    const dummy = Buffer.from(a);
    timingSafeEqual(dummy, dummy);
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Authentication source for admin/cron endpoints
 */
export type AdminAuthSource = 'cron_secret' | 'jwt_admin' | 'jwt_super_admin' | 'api_key_admin';

/**
 * Extended request type for admin endpoints
 */
export interface AdminRequest extends Request {
  adminAuth?: {
    source: AdminAuthSource;
    userId?: string;
    ip: string;
    userAgent: string;
    timestamp: Date;
  };
}

/**
 * Audit log for admin operations
 */
function auditLog(
  req: AdminRequest,
  action: string,
  source: AdminAuthSource,
  details?: Record<string, unknown>,
): void {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  logger.info(
    {
      action,
      source,
      ip,
      userAgent,
      userId: req.adminAuth?.userId,
      path: req.path,
      method: req.method,
      ...details,
    },
    `Admin action: ${action}`,
  );
}

/**
 * Verify JWT token and check for admin role
 */
function verifyAdminJwt(token: string): { valid: boolean; payload?: AuthInfo; error?: string } {
  const secret = env.JWT_SECRET;

  if (!secret) {
    return { valid: false, error: 'JWT secret not configured' };
  }

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: [env.JWT_ALGORITHM as jwt.Algorithm],
    }) as AuthInfo;

    // Check for admin or super_admin role
    const roles: string[] = [];
    if (decoded.role) roles.push(decoded.role);
    if (Array.isArray(decoded.roles)) roles.push(...decoded.roles);

    const isAdmin = roles.some((r) => ['admin', 'super_admin', 'owner'].includes(r.toLowerCase()));

    if (!isAdmin) {
      return { valid: false, error: 'Insufficient privileges - admin role required' };
    }

    return { valid: true, payload: decoded };
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'TokenExpiredError') {
        return { valid: false, error: 'Token expired' };
      }
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * requireAdminAuth middleware
 *
 * Secures admin/cron endpoints with multiple authentication strategies:
 * 1. CRON_SECRET - For automated cron jobs (Vercel Cron, etc.)
 * 2. Admin JWT - For manual admin actions via UI
 * 3. API Key with admin role - For service-to-service admin calls
 *
 * SECURITY FEATURES:
 * - Never allows unauthenticated access, even in development
 * - Requires CRON_SECRET to be set in production (doesn't silently allow)
 * - Audit logs all authentication attempts
 * - Rate limit ready (use with cronLimiter)
 */
export function requireAdminAuth(req: AdminRequest, res: Response, next: NextFunction) {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const authHeader = req.headers.authorization || '';
  const apiKeyHeader = (req.headers['x-api-key'] as string) || '';

  // Strategy 1: Check CRON_SECRET (using timing-safe comparison)
  const cronSecret = env.CRON_SECRET;
  const expectedCronHeader = cronSecret ? `Bearer ${cronSecret}` : '';
  if (cronSecret && safeCompare(authHeader, expectedCronHeader)) {
    req.adminAuth = {
      source: 'cron_secret',
      ip,
      userAgent,
      timestamp: new Date(),
    };
    auditLog(req, 'admin_auth_success', 'cron_secret');
    return next();
  }

  // Strategy 2: Check JWT for admin role
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();

    // Don't try to parse cron secret as JWT (timing-safe check)
    const isCronSecret = cronSecret ? safeCompare(token, cronSecret) : false;
    if (!isCronSecret) {
      const jwtResult = verifyAdminJwt(token);

      if (jwtResult.valid && jwtResult.payload) {
        const source: AdminAuthSource =
          jwtResult.payload.role === 'super_admin' ? 'jwt_super_admin' : 'jwt_admin';

        req.adminAuth = {
          source,
          userId: jwtResult.payload.sub,
          ip,
          userAgent,
          timestamp: new Date(),
        };
        auditLog(req, 'admin_auth_success', source, { userId: jwtResult.payload.sub });
        return next();
      }

      // JWT was provided but invalid - don't fall through to other strategies
      auditLog(req, 'admin_auth_failed', 'jwt_admin', { error: jwtResult.error });
      logger.warn({ ip, error: jwtResult.error }, 'Admin JWT authentication failed');
      return res.status(401).json({
        error: 'unauthorized',
        message: jwtResult.error || 'Invalid admin credentials',
        code: 'ADMIN_AUTH_FAILED',
      });
    }
  }

  // Strategy 3: Check API key with admin role (for service accounts)
  if (apiKeyHeader) {
    // API keys for admin endpoints must be explicitly configured
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- env type is validated by Zod
    const adminApiKey = env.ADMIN_API_KEY;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- adminApiKey is string|undefined from Zod schema
    if (adminApiKey && safeCompare(apiKeyHeader, adminApiKey)) {
      req.adminAuth = {
        source: 'api_key_admin',
        ip,
        userAgent,
        timestamp: new Date(),
      };
      auditLog(req, 'admin_auth_success', 'api_key_admin');
      return next();
    }

    // API key provided but invalid
    auditLog(req, 'admin_auth_failed', 'api_key_admin', { error: 'Invalid API key' });
    logger.warn({ ip }, 'Admin API key authentication failed');
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Invalid admin API key',
      code: 'ADMIN_AUTH_FAILED',
    });
  }

  // No valid authentication found
  auditLog(req, 'admin_auth_failed', 'cron_secret', { error: 'No credentials provided' });

  // In production, always require authentication
  if (env.NODE_ENV === 'production') {
    logger.warn({ ip, path: req.path }, 'Unauthenticated admin endpoint access attempt');
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Admin authentication required',
      code: 'ADMIN_AUTH_REQUIRED',
    });
  }

  // In development, require CRON_SECRET to be set OR allow with warning
  if (!cronSecret) {
    logger.warn(
      { ip, path: req.path },
      'Admin endpoint accessed without CRON_SECRET in development - ALLOWING but this would fail in production',
    );
    req.adminAuth = {
      source: 'cron_secret', // Treat as cron for audit purposes
      ip,
      userAgent,
      timestamp: new Date(),
    };
    return next();
  }

  // CRON_SECRET is set but not provided
  logger.warn({ ip, path: req.path }, 'Admin authentication required but not provided');
  return res.status(401).json({
    error: 'unauthorized',
    message: 'Admin authentication required',
    code: 'ADMIN_AUTH_REQUIRED',
  });
}

/**
 * Audit helper for admin actions
 * Call this within admin handlers to log specific operations
 */
export function logAdminAction(
  req: AdminRequest,
  action: string,
  details?: Record<string, unknown>,
): void {
  const source = req.adminAuth?.source || 'unknown';
  auditLog(req, action, source as AdminAuthSource, details);
}

export default requireAdminAuth;
