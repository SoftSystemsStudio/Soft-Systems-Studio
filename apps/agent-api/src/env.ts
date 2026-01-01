/* eslint-disable no-restricted-syntax -- env module needs direct process.env access */
import { z } from 'zod';

/**
 * Sync DATABASE_URL with POSTGRES_URL for Prisma compatibility
 * Prisma uses DATABASE_URL, but Railway/Vercel often set POSTGRES_URL
 */
if (process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
} else if (process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

/**
 * Environment variable schema with comprehensive validation
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server configuration
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(65535)),

  // Database - accept either POSTGRES_URL or DATABASE_URL
  POSTGRES_URL: z
    .string()
    .min(1, 'POSTGRES_URL or DATABASE_URL is required')
    .url('POSTGRES_URL must be a valid URL'),

  // Redis - supports Upstash Redis (rediss://) or standard Redis (redis://)
  // In tests we allow REDIS_URL to be missing so the test-time stub can be used.
  REDIS_URL: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return process.env.NODE_ENV === 'test';
      return val.startsWith('redis://') || val.startsWith('rediss://');
    }, 'REDIS_URL must start with redis:// or rediss://'),

  // Upstash Redis REST API (optional - for serverless environments)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Upstash QStash (optional - for background jobs in serverless)
  QSTASH_URL: z.string().url().optional(),
  QSTASH_TOKEN: z.string().optional(),
  QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  QSTASH_NEXT_SIGNING_KEY: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z
    .string()
    .min(1, 'OPENAI_API_KEY is required')
    .refine(
      (val) => val.startsWith('sk-') || process.env.NODE_ENV === 'test',
      'OPENAI_API_KEY should start with sk-',
    ),

  // JWT Authentication
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .refine(
      (val) => val.length >= 32 || process.env.NODE_ENV !== 'production',
      'JWT_SECRET must be at least 32 characters in production',
    ),
  JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512']).default('HS256'),

  // Optional: API Key for service-to-service auth
  API_KEY: z.string().optional(),

  // Optional: Qdrant vector database
  QDRANT_HOST: z.string().default('localhost'),
  QDRANT_PORT: z.string().default('6333'),
  QDRANT_COLLECTION: z.string().default('kb'),
  QDRANT_API_KEY: z.string().optional(),
  QDRANT_USE_HTTPS: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),

  // Optional consolidated URL (e.g. https://abc.qdrant.io:6333)
  // If provided, we derive host/port/use_https from this value after validation.
  QDRANT_URL: z.string().url().optional(),

  // Health requirements (allow making dependencies optional in some environments)
  REQUIRE_QDRANT_HEALTH: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  REQUIRE_REDIS_HEALTH: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),

  // Qdrant health probe timeout (milliseconds) - used by /health quick checks
  // Accepts a string in env (e.g. "500") and coerces to number. Must be positive.
  QDRANT_HEALTH_TIMEOUT_MS: z
    .string()
    .default('500')
    .refine(
      (val) => /^\d+$/.test(val),
      'QDRANT_HEALTH_TIMEOUT_MS must be a positive integer (milliseconds)',
    )
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1)),

  // General Qdrant network timeout for requests (milliseconds)
  QDRANT_TIMEOUT_MS: z
    .string()
    .default('30000')
    .refine(
      (val) => /^\d+$/.test(val),
      'QDRANT_TIMEOUT_MS must be a positive integer (milliseconds)',
    )
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1)),

  // Optional connect timeout (not currently used directly)
  QDRANT_CONNECT_TIMEOUT_MS: z
    .string()
    .default('5000')
    .refine(
      (val) => /^\d+$/.test(val),
      'QDRANT_CONNECT_TIMEOUT_MS must be a positive integer (milliseconds)',
    )
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0)),

  // Retry/backoff configuration for Qdrant client
  QDRANT_RETRY_MAX: z
    .string()
    .default('3')
    .refine((val) => /^\d+$/.test(val), 'QDRANT_RETRY_MAX must be a non-negative integer')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0)),

  QDRANT_RETRY_BASE_MS: z
    .string()
    .default('250')
    .refine(
      (val) => /^\d+$/.test(val),
      'QDRANT_RETRY_BASE_MS must be a non-negative integer (milliseconds)',
    )
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0)),

  QDRANT_RETRY_JITTER_MS: z
    .string()
    .default('100')
    .refine(
      (val) => /^\d+$/.test(val),
      'QDRANT_RETRY_JITTER_MS must be a non-negative integer (milliseconds)',
    )
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0)),

  // Timeout for collection existence checks and similar quick probes
  QDRANT_COLLECTION_CHECK_TIMEOUT_MS: z
    .string()
    .default('5000')
    .refine(
      (val) => /^\d+$/.test(val),
      'QDRANT_COLLECTION_CHECK_TIMEOUT_MS must be a positive integer (milliseconds)',
    )
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1)),

  // Optional: Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_ENABLED: z
    .string()
    .optional()
    .transform((val) => val === 'true'),

  // Security: Allow anonymous access in development (MUST be explicitly enabled)
  // Set to 'true' only for local development without auth
  ALLOW_ANONYMOUS_DEV: z
    .string()
    .optional()
    .transform((val) => val === 'true'),

  // Optional: Sentry
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  // Optional: Git commit SHA (CI/CD may set this)
  GIT_COMMIT_SHA: z.string().optional(),
  COMMIT_SHA: z.string().optional(),

  // Optional: npm package version (set by npm during lifecycle scripts)
  npm_package_version: z.string().optional(),

  // Optional: Stripe payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Optional: Cron job authentication
  CRON_SECRET: z.string().optional(),

  // Optional: Admin API key for service-to-service admin calls
  ADMIN_API_KEY: z.string().min(32).optional(),

  // Server role: 'api' (default), 'worker', or 'all'
  // Used to gate background processes like queue metrics
  SERVER_ROLE: z.enum(['api', 'worker', 'all']).default('api'),

  // Enable queue metrics polling (auto-enabled for 'worker' and 'all' roles)
  // Set to 'true' to explicitly enable in any role
  ENABLE_QUEUE_METRICS: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

// Parse and validate environment variables
function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);

    // Derive Qdrant connection settings from QDRANT_URL when provided
    if (parsed.QDRANT_URL) {
      try {
        const url = new URL(parsed.QDRANT_URL);
        parsed.QDRANT_HOST = url.hostname;
        parsed.QDRANT_PORT = url.port || (url.protocol === 'https:' ? '443' : '80');
        parsed.QDRANT_USE_HTTPS = url.protocol === 'https:';
      } catch (err) {
        const message = `Invalid QDRANT_URL: ${String(err?.message ?? err)}`;
        if (process.env.NODE_ENV === 'test') {
          throw new Error(message);
        }
        console.error(message);
        process.exit(1);
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = error.errors
        .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');
      const message = '❌ Environment validation failed:\n' + formatted;
      // In test environments we throw so Jest can surface failures without killing the runner.
      if (process.env.NODE_ENV === 'test') {
        throw new Error(message);
      }
      console.error(message);
      process.exit(1);
    }
    throw error;
  }
}

// Type export for use in other modules
export type Env = z.infer<typeof envSchema>;

// Lazy environment validation: only validate on first access
// This allows modules to be imported without environment variables being set
// Critical for Lane A testing where we don't have DATABASE_URL, JWT_SECRET, etc.
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

// For backwards compatibility: validate eagerly when imported at runtime
// Tests can override this behavior by calling getEnv() directly
export const env: Env = (() => {
  // If NODE_ENV is 'test', don't validate eagerly - allow lazy validation
  if (process.env.NODE_ENV === 'test') {
    // Return a proxy that validates on first property access
    return new Proxy({} as Env, {
      get: (_target, prop) => {
        return getEnv()[prop as keyof Env];
      },
    });
  }
  // In production/development, validate eagerly
  return getEnv();
})();

export default env;
