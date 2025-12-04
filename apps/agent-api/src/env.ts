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
  REDIS_URL: z
    .string()
    .default('redis://localhost:6379')
    .refine(
      (val) => val.startsWith('redis://') || val.startsWith('rediss://'),
      'REDIS_URL must start with redis:// or rediss://',
    ),

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

  // Optional: Stripe payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Optional: Cron job authentication
  CRON_SECRET: z.string().optional(),

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
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = error.errors
        .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');
      console.error('❌ Environment validation failed:\n' + formatted);
      process.exit(1);
    }
    throw error;
  }
}

// Type export for use in other modules
export type Env = z.infer<typeof envSchema>;

export const env: Env = validateEnv();

export default env;
