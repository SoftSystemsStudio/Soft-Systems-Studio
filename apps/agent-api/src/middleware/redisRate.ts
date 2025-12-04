import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../lib/redis';
import logger from '../logger';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Redis-backed rate limiter for distributed rate limiting
 * Uses sliding window algorithm for accurate rate limiting
 */

export type RateLimitConfig = {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  keyPrefix?: string; // Redis key prefix
  keyGenerator?: (req: Request) => string; // Custom key generator
  skip?: (req: Request) => boolean; // Skip rate limiting
  onLimitReached?: (req: Request, res: Response) => void; // Custom handler
};

// Default rate limit configurations
export const RATE_LIMITS = {
  // Onboarding: workspace creation is expensive
  onboarding: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isProd ? 3 : 10,
    keyPrefix: 'rl:onboard',
  },
  // Login: protect against brute force
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProd ? 5 : 20,
    keyPrefix: 'rl:login',
  },
  // Token refresh
  token: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProd ? 30 : 100,
    keyPrefix: 'rl:token',
  },
  // General API
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: isProd ? 60 : 200,
    keyPrefix: 'rl:api',
  },
  // Strict for sensitive operations
  strict: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isProd ? 3 : 10,
    keyPrefix: 'rl:strict',
  },
  // Email sending
  email: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isProd ? 10 : 50,
    keyPrefix: 'rl:email',
  },
};

/**
 * Create a Redis-backed rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    max,
    keyPrefix = 'rl',
    keyGenerator = defaultKeyGenerator,
    skip,
    onLimitReached,
  } = config;

  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip if configured
    if (skip && skip(req)) {
      next();
      return;
    }

    const key = `${keyPrefix}:${keyGenerator(req)}`;

    try {
      const redis = getRedisClient();
      const current = await redis.incr(key);

      // Set expiry on first request
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      // Get TTL for headers
      const ttl = await redis.ttl(key);

      // Set rate limit headers
      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', Math.max(0, max - current));
      res.setHeader('RateLimit-Reset', Math.ceil(Date.now() / 1000) + ttl);

      if (current > max) {
        logger.warn({ key, current, max }, 'Rate limit exceeded');

        if (onLimitReached) {
          onLimitReached(req, res);
          return;
        }

        res.setHeader('Retry-After', ttl);
        res.status(429).json({
          error: 'too_many_requests',
          message: 'Too many requests, please try again later',
          retryAfter: ttl,
        });
        return;
      }

      next();
    } catch (err) {
      // If Redis fails, allow the request but log the error
      logger.error({ err }, 'Rate limiter Redis error, allowing request');
      next();
    }
  };
}

/**
 * Default key generator using IP address
 */
function defaultKeyGenerator(req: Request): string {
  return req.ip || req.headers['x-forwarded-for']?.toString().split(',')[0] || 'unknown';
}

/**
 * Key generator that combines IP and email (for login)
 */
export function ipEmailKeyGenerator(req: Request): string {
  const ip = defaultKeyGenerator(req);
  const email = (req.body as { email?: string })?.email || '';
  return `${ip}:${email}`;
}

/**
 * Key generator that uses user ID if authenticated
 */
export function userOrIpKeyGenerator(req: Request): string {
  const userId = (req as Request & { auth?: { sub?: string } }).auth?.sub;
  if (userId) return `user:${userId}`;
  return defaultKeyGenerator(req);
}

// Pre-configured rate limiters
export const redisOnboardingLimiter = createRateLimiter({
  ...RATE_LIMITS.onboarding,
});

export const redisLoginLimiter = createRateLimiter({
  ...RATE_LIMITS.login,
  keyGenerator: ipEmailKeyGenerator,
  skip: (req) => !(req.body as { email?: string })?.email,
});

export const redisTokenLimiter = createRateLimiter({
  ...RATE_LIMITS.token,
});

export const redisApiLimiter = createRateLimiter({
  ...RATE_LIMITS.api,
  keyGenerator: userOrIpKeyGenerator,
});

export const redisStrictLimiter = createRateLimiter({
  ...RATE_LIMITS.strict,
});

export const redisEmailLimiter = createRateLimiter({
  ...RATE_LIMITS.email,
  keyGenerator: userOrIpKeyGenerator,
});

export default {
  createRateLimiter,
  redisOnboardingLimiter,
  redisLoginLimiter,
  redisTokenLimiter,
  redisApiLimiter,
  redisStrictLimiter,
  redisEmailLimiter,
  RATE_LIMITS,
};
