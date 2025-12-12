/**
 * Rate limiting middleware for metrics endpoint
 * Prevents scrape abuse while allowing legitimate Prometheus scraping
 */
import type { Request, Response, NextFunction } from 'express';

// Metrics-specific rate limits (more generous than API endpoints)
// Prometheus typically scrapes every 15-60 seconds
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 scrapes per minute (generous for 15s scrape interval)

type Key = string;

const buckets = new Map<Key, { windowStart: number; count: number }>();

function getClientKey(req: Request): string {
  // Prefer admin API key ID if available
  const auth = (req as any).auth;
  if (auth?.apiKeyId) return `admin:${auth.apiKeyId}`;

  // Fallback to IP address for unauthenticated requests (will be rejected anyway)
  return `ip:${req.ip}`;
}

/**
 * Rate limit middleware for metrics endpoint
 * Enforces per-scraper rate limiting using token bucket algorithm
 * 
 * Configuration:
 * - 10 requests per minute per admin API key
 * - Suitable for Prometheus scrape intervals of 15s or longer
 * - Returns 429 with Retry-After header when limit exceeded
 */
export function rateLimitMetrics(req: Request, res: Response, next: NextFunction) {
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
      message: `Too many metrics requests. Please retry in ${retryAfter} seconds.`,
      retryAfter,
      limit: MAX_REQUESTS_PER_WINDOW,
      window: '1 minute',
    });
  }

  // Increment count and proceed
  bucket.count += 1;
  return next();
}

/**
 * Reset rate limit buckets (for testing only)
 * @internal
 */
export function resetRateLimitBuckets() {
  buckets.clear();
}
