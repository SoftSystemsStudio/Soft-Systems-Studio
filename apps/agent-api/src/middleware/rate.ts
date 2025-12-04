import rateLimit, { Options } from 'express-rate-limit';
import env from '../env';

const isProd = env.NODE_ENV === 'production';

// Rate limit configuration per environment
const RATE_LIMITS = {
  // Onboarding: workspace creation is expensive, limit tightly
  onboarding: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isProd ? 3 : 10, // 3/hour in prod, 10/hour in dev
  },
  // Login: allow more attempts but still protect against brute force
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProd ? 5 : 20, // 5 attempts in prod, 20 in dev
  },
  // Token refresh: should be called frequently but not abused
  token: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProd ? 30 : 100, // 30/15min in prod, 100 in dev
  },
  // General API: standard rate limiting for authenticated endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: isProd ? 60 : 200, // 60/min in prod, 200/min in dev
  },
};

// Shared rate limiter options
const sharedOptions: Partial<Options> = {
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    error: 'too_many_requests',
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMITED',
  },
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: false,
};

// Limit onboarding creations (workspace creation)
export const onboardingLimiter = rateLimit({
  ...sharedOptions,
  ...RATE_LIMITS.onboarding,
  keyGenerator: (req) => {
    // Use IP address as the key
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
});

// Limit login attempts - use email + IP for more targeted limiting
export const loginLimiter = rateLimit({
  ...sharedOptions,
  ...RATE_LIMITS.login,
  keyGenerator: (req) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const email = (req.body as { email?: string })?.email || '';
    // Combine IP and email to prevent distributed attacks on single account
    return `${ip}:${email}`;
  },
  // Skip rate limiting if email is not provided (will fail validation anyway)
  skip: (req) => {
    const body = req.body as { email?: string };
    return !body?.email;
  },
});

// Limit token refresh operations
export const tokenLimiter = rateLimit({
  ...sharedOptions,
  ...RATE_LIMITS.token,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
});

// General API rate limiter for authenticated endpoints
export const apiLimiter = rateLimit({
  ...sharedOptions,
  ...RATE_LIMITS.api,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    const userId = (req.auth as { sub?: string })?.sub;
    if (userId) return `user:${userId}`;
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
});

// Strict limiter for sensitive operations (password reset, etc.)
export const strictLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isProd ? 3 : 10,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
});

// Cron/Admin endpoint limiter - allows automated jobs but prevents abuse
export const cronLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 60 * 1000, // 1 minute
  max: isProd ? 10 : 50, // 10/min in prod, 50/min in dev
  keyGenerator: (req) => {
    // Use IP as key - cron jobs typically come from known IPs
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
  message: {
    error: 'too_many_requests',
    message: 'Admin endpoint rate limit exceeded',
    code: 'ADMIN_RATE_LIMITED',
  },
});

export default {
  onboardingLimiter,
  loginLimiter,
  tokenLimiter,
  apiLimiter,
  strictLimiter,
  cronLimiter,
};
