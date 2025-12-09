# Environment Variables Reference

Complete reference for all environment variables used in Soft Systems Studio.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [By Service](#by-service)
- [Environment Files](#environment-files)
- [Validation](#validation)

---

## Quick Start

```bash
# Copy example files
cp .env.example .env
cp apps/agent-api/.env.example apps/agent-api/.env

# Or use sync script (preserves existing values)
pnpm sync-env
```

---

## Required Variables

These variables are **required** for the API to start:

| Variable         | Description                    | Example                               |
| ---------------- | ------------------------------ | ------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string   | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL`      | Redis connection string        | `redis://localhost:6379`              |
| `JWT_SECRET`     | JWT signing secret (32+ chars) | `your-super-secret-key-min-32-chars`  |
| `OPENAI_API_KEY` | OpenAI API key                 | `sk-...`                              |

---

## Optional Variables

### Server Configuration

| Variable      | Description                          | Default       |
| ------------- | ------------------------------------ | ------------- |
| `NODE_ENV`    | Environment mode                     | `development` |
| `PORT`        | HTTP server port                     | `5000`        |
| `SERVER_ROLE` | Server role (`api`, `worker`, `all`) | `api`         |
| `LOG_LEVEL`   | Logging verbosity                    | `info`        |

### Authentication

| Variable              | Description                      | Default |
| --------------------- | -------------------------------- | ------- |
| `JWT_ALGORITHM`       | JWT signing algorithm            | `HS256` |
| `API_KEY`             | Service-to-service API key       | -       |
| `CRON_SECRET`         | Cron job authentication          | -       |
| `ADMIN_API_KEY`       | Admin API key (32+ chars)        | -       |
| `ALLOW_ANONYMOUS_DEV` | Allow unauthenticated dev access | `false` |

### Vector Database (Qdrant)

| Variable            | Description              | Default     |
| ------------------- | ------------------------ | ----------- |
| `QDRANT_HOST`       | Qdrant server hostname   | `localhost` |
| `QDRANT_PORT`       | Qdrant server port       | `6333`      |
| `QDRANT_COLLECTION` | Collection name          | `kb`        |
| `QDRANT_API_KEY`    | API key for Qdrant Cloud | -           |
| `QDRANT_USE_HTTPS`  | Use HTTPS connection     | `false`     |

### Upstash (Serverless Redis/QStash)

| Variable                     | Description             | Default |
| ---------------------------- | ----------------------- | ------- |
| `UPSTASH_REDIS_REST_URL`     | Upstash REST API URL    | -       |
| `UPSTASH_REDIS_REST_TOKEN`   | Upstash REST API token  | -       |
| `QSTASH_URL`                 | QStash URL              | -       |
| `QSTASH_TOKEN`               | QStash token            | -       |
| `QSTASH_CURRENT_SIGNING_KEY` | QStash signing key      | -       |
| `QSTASH_NEXT_SIGNING_KEY`    | QStash next signing key | -       |

### Stripe (Billing)

| Variable                | Description            | Default |
| ----------------------- | ---------------------- | ------- |
| `STRIPE_SECRET_KEY`     | Stripe secret key      | -       |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | -       |

### Observability

| Variable               | Description                   | Default |
| ---------------------- | ----------------------------- | ------- |
| `SENTRY_DSN`           | Sentry DSN for error tracking | -       |
| `SENTRY_ENVIRONMENT`   | Sentry environment tag        | -       |
| `ENABLE_QUEUE_METRICS` | Enable queue metrics polling  | `false` |
| `LOG_ENABLED`          | Enable logging output         | `true`  |

### Frontend (Next.js)

| Variable                             | Description              | Required |
| ------------------------------------ | ------------------------ | -------- |
| `NEXT_PUBLIC_API_URL`                | API base URL             | Yes      |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  | Clerk public key         | Yes      |
| `CLERK_SECRET_KEY`                   | Clerk secret key         | Yes      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key        | No       |
| `NEXT_PUBLIC_SENTRY_DSN`             | Sentry DSN (client-side) | No       |

---

## By Service

### API Service (`apps/agent-api`)

```env
# Core
NODE_ENV=development
PORT=5000
SERVER_ROLE=all

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agent_api
# or
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/agent_api

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_ALGORITHM=HS256
CRON_SECRET=your-cron-secret-for-scheduled-jobs
ADMIN_API_KEY=your-admin-api-key-at-least-32-chars

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Vector Database
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=kb
QDRANT_API_KEY=
QDRANT_USE_HTTPS=false

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Observability
LOG_LEVEL=info
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=development
```

### Frontend (`packages/frontend`)

```env
# API Connection
NEXT_PUBLIC_API_URL=http://localhost:5000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Stripe (Client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
```

### Worker Service

When running workers separately:

```env
NODE_ENV=production
SERVER_ROLE=worker

DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
JWT_SECRET=...

# Enable metrics for workers
ENABLE_QUEUE_METRICS=true
```

---

## Environment Files

### File Structure

```
soft-systems-studio/
├── .env                          # Root env (shared)
├── .env.example                  # Template
├── .env.production.example       # Production template
├── .env.staging.example          # Staging template
├── apps/
│   └── agent-api/
│       ├── .env                  # API-specific env
│       └── .env.example          # API template
└── packages/
    └── frontend/
        └── .env.local            # Frontend env (Next.js)
```

### Loading Priority

**API (agent-api):**

1. Process environment (platform env vars)
2. `apps/agent-api/.env`
3. Root `.env`

**Frontend (Next.js):**

1. `.env.local` (highest priority)
2. `.env.[environment].local`
3. `.env.[environment]`
4. `.env`

### Sync Script

Keep local env files in sync with examples:

```bash
# Adds missing keys from .env.example without overwriting
pnpm sync-env
```

---

## Validation

### Zod Schema

The API validates all environment variables at startup using Zod:

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((v) => parseInt(v, 10)),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().refine((v) => v.startsWith('redis://') || v.startsWith('rediss://')),
  JWT_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().refine((v) => v.startsWith('sk-') || process.env.NODE_ENV === 'test'),
  // ... more fields
});
```

### Validation Errors

If validation fails, you'll see detailed errors:

```
❌ Environment validation failed:
  - JWT_SECRET: must be at least 32 characters for security
  - OPENAI_API_KEY: should start with sk-
```

### Type Safety

Environment variables are typed for TypeScript:

```typescript
import env from './env';

// env.PORT is number (auto-transformed)
// env.JWT_SECRET is string
// env.QDRANT_USE_HTTPS is boolean
```

---

## Production Checklist

Before deploying to production:

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` is unique, random, 32+ chars
- [ ] `CRON_SECRET` is set and secure
- [ ] `ADMIN_API_KEY` is set and secure
- [ ] Database credentials rotated from development
- [ ] Redis using TLS (`rediss://`)
- [ ] Qdrant using HTTPS and API key
- [ ] Stripe using live keys (`sk_live_`, `pk_live_`)
- [ ] Sentry DSN configured
- [ ] No `ALLOW_ANONYMOUS_DEV=true`

---

## Secrets Best Practices

1. **Never commit secrets** — `.env` files are in `.gitignore`
2. **Use platform env vars** — Vercel, Railway, Render all support secure env vars
3. **Rotate periodically** — Change secrets quarterly
4. **Least privilege** — Use scoped API keys where possible
5. **Audit usage** — Log when secrets are used (admin actions)

### Secret Managers

For production, consider:

- **AWS Secrets Manager**
- **GCP Secret Manager**
- **HashiCorp Vault**
- See `docs/VAULT.md` for local dev, mapping examples, and CI guidance.
- **Doppler**
- Platform-native (Vercel, Railway env vars)
