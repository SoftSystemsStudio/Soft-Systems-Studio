import type { Request, Response, NextFunction } from 'express';

// In-memory token bucket as a starting point; replace with Redis-based limiter in prod.
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60;

type Key = string;

const buckets = new Map<
  Key,
  { windowStart: number; count: number }
>();

function getClientKey(req: Request): string {
  // Prefer auth principal or workspace id if available; fallback to IP.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const principal = (req as any).authPrincipal;
  if (principal?.workspaceId) return `ws:${principal.workspaceId}`;
  return `ip:${req.ip}`;
}

export function rateLimitRun(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const key = getClientKey(req);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(key, { windowStart: now, count: 1 });
    return next();
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000));
    return res.status(429).json({
      error: 'RATE_LIMITED',
      message: 'Too many run requests; please retry later.',
    });
  }

  bucket.count += 1;
  return next();
}
