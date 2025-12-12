/**
 * Rate limiting middleware for chat endpoint
 * In-memory token bucket - replace with Redis for production
 */
import type { Request, Response, NextFunction } from 'express';

// Chat-specific rate limits (more generous than /run endpoint)
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 chat messages per minute per workspace

type Key = string;

const buckets = new Map<Key, { windowStart: number; count: number }>();

function getClientKey(req: Request): string {
  // Prefer workspace ID for multi-tenant isolation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const auth = (req as any).auth;
  if (auth?.workspaceId) return `ws:${auth.workspaceId}`;

  // Fallback to user ID
  if (auth?.userId) return `user:${auth.userId}`;

  // Last resort: IP address
  return `ip:${req.ip}`;
}

/**
 * Rate limit middleware for chat endpoint
 * Enforces per-workspace rate limiting using token bucket algorithm
 */
export function rateLimitChat(req: Request, res: Response, next: NextFunction) {
  const key = getClientKey(req);
  const now = Date.now();
  const bucket = buckets.get(key);

  // Reset bucket if window expired
  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(key, { windowStart: now, count: 1 });
    return next();
  }

  // Check if rate limit exceeded
  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'RATE_LIMITED',
      message: `Too many chat requests. Please retry in ${retryAfter} seconds.`,
      retryAfter,
    });
  }

  // Increment count and proceed
  bucket.count += 1;
  return next();
}
