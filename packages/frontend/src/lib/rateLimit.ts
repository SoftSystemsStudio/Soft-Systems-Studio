/**
 * Minimal in-memory sliding-window rate limiter, keyed by an arbitrary string
 * (typically a client IP).
 *
 * This is intentionally simple: no Redis, no external store. On Vercel each
 * serverless instance has its own memory, so this is a best-effort per-instance
 * limit rather than a globally exact one — a determined abuser spread across
 * many cold-started instances could exceed it. That's an accepted trade-off
 * for a "basic abuse protection" ask on a low-traffic marketing site; if this
 * ever needs to be airtight, back it with Upstash Redis or similar instead.
 */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so `buckets` doesn't grow unbounded over the life of
// a warm serverless instance. Runs at most once per minute, on the request
// path (no background timers in a serverless function).
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number, maxWindowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < maxWindowMs);
    if (bucket.timestamps.length === 0) {
      buckets.delete(key);
    }
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the caller should retry, only set when allowed is false. */
  retryAfterSeconds?: number;
};

/**
 * Records one request for `key` and reports whether it's within the allowed
 * rate: at most `limit` requests per `windowMs` milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  // eslint-disable-next-line security/detect-object-injection -- key is a caller-supplied string used as a Map key, not object property access
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    const retryAfterMs = windowMs - (now - oldest);
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  bucket.timestamps.push(now);
  return { allowed: true };
}

/**
 * Best-effort extraction of the caller's IP from standard proxy headers.
 * Vercel sets `x-forwarded-for` (and `x-real-ip`) on every request.
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
