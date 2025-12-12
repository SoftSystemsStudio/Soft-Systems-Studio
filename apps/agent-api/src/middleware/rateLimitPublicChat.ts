/**
 * Rate Limiter for Public Chat Endpoint
 * Limits requests by IP address to prevent abuse
 */
import rateLimit from 'express-rate-limit';

/**
 * Public chat rate limiter
 * - 10 requests per minute per IP
 * - Prevents abuse of unauthenticated endpoint
 * - Returns 429 with Retry-After header when exceeded
 */
export const rateLimitPublicChat = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many chat requests from this IP. Please try again in a minute.',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  // Use IP address as key
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  // Skip rate limiting for local development
  skip: (req) => {
    const isLocal =
      req.hostname === 'localhost' || req.hostname === '127.0.0.1' || req.hostname === '::1';
    return process.env.NODE_ENV === 'development' && isLocal;
  },
  handler: (_req, res) => {
    res.status(429).json({
      error: 'TOO_MANY_REQUESTS',
      message: 'Too many chat requests. Please wait a minute and try again.',
      retryAfter: 60,
    });
  },
});
