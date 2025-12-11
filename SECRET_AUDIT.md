# Secret & Environment Variable Audit

Generated: December 10, 2025

## 🔴 REQUIRED (App won't start without these)

### Backend (apps/agent-api)

| Variable                         | Purpose                    | Example                               | Validation                      |
| -------------------------------- | -------------------------- | ------------------------------------- | ------------------------------- |
| `DATABASE_URL` or `POSTGRES_URL` | PostgreSQL connection      | `postgresql://user:pass@host:5432/db` | Must be valid URL               |
| `OPENAI_API_KEY`                 | OpenAI API access          | `sk-proj-...`                         | Must start with `sk-`           |
| `JWT_SECRET`                     | Sign authentication tokens | `your-super-secret-32-char-string`    | Min 32 characters in production |

## 🟡 RECOMMENDED (App runs but features limited)

### Backend - Core Services

| Variable    | Purpose                          | Default                  | Why You Need It                          |
| ----------- | -------------------------------- | ------------------------ | ---------------------------------------- |
| `REDIS_URL` | Caching, sessions, rate limiting | `redis://localhost:6379` | Required for production state management |
| `NODE_ENV`  | Environment mode                 | `development`            | Set to `production` for proper security  |
| `PORT`      | API server port                  | `5000`                   | -                                        |
| `LOG_LEVEL` | Logging verbosity                | `info`                   | `debug` in dev, `warn` in prod           |

### Backend - Authentication

| Variable        | Purpose                 | Default | Why You Need It                  |
| --------------- | ----------------------- | ------- | -------------------------------- |
| `JWT_ALGORITHM` | JWT signing algorithm   | `HS256` | Options: HS256, HS384, HS512     |
| `API_KEY`       | Service-to-service auth | -       | Optional: For internal services  |
| `ADMIN_API_KEY` | Admin operations        | -       | Min 32 chars if used             |
| `CRON_SECRET`   | Protect cron endpoints  | -       | Required if using scheduled jobs |

### Backend - Observability

| Variable             | Purpose                | Default | Why You Need It                   |
| -------------------- | ---------------------- | ------- | --------------------------------- |
| `SENTRY_DSN`         | Error tracking         | -       | Highly recommended for production |
| `SENTRY_ENVIRONMENT` | Sentry environment tag | -       | e.g., `production`, `staging`     |

### Backend - Payments

| Variable                | Purpose                | Default | Why You Need It               |
| ----------------------- | ---------------------- | ------- | ----------------------------- |
| `STRIPE_SECRET_KEY`     | Stripe API access      | -       | Required if monetizing        |
| `STRIPE_WEBHOOK_SECRET` | Verify Stripe webhooks | -       | Required for webhook security |

### Backend - Vector Database (Optional)

| Variable            | Purpose         | Default     | Why You Need It                |
| ------------------- | --------------- | ----------- | ------------------------------ |
| `QDRANT_HOST`       | Qdrant server   | `localhost` | For vector search/RAG          |
| `QDRANT_PORT`       | Qdrant port     | `6333`      | -                              |
| `QDRANT_COLLECTION` | Collection name | `kb`        | -                              |
| `QDRANT_API_KEY`    | Qdrant auth     | -           | Required if using cloud Qdrant |
| `QDRANT_USE_HTTPS`  | Use HTTPS       | `false`     | Set `true` for cloud           |

### Backend - Serverless/Upstash (Alternative to Redis)

| Variable                     | Purpose                | Default | Why You Need It                         |
| ---------------------------- | ---------------------- | ------- | --------------------------------------- |
| `UPSTASH_REDIS_REST_URL`     | Upstash REST API       | -       | Alternative to REDIS_URL for serverless |
| `UPSTASH_REDIS_REST_TOKEN`   | Upstash auth           | -       | Required with UPSTASH_REDIS_REST_URL    |
| `QSTASH_URL`                 | Upstash QStash API     | -       | Background jobs in serverless           |
| `QSTASH_TOKEN`               | QStash auth            | -       | Required with QSTASH_URL                |
| `QSTASH_CURRENT_SIGNING_KEY` | Verify QStash webhooks | -       | Security for webhook verification       |
| `QSTASH_NEXT_SIGNING_KEY`    | Key rotation           | -       | For zero-downtime key rotation          |

### Backend - Server Configuration

| Variable               | Purpose          | Default | Why You Need It                       |
| ---------------------- | ---------------- | ------- | ------------------------------------- |
| `SERVER_ROLE`          | Server type      | `api`   | Options: `api`, `worker`, `all`       |
| `ENABLE_QUEUE_METRICS` | Queue monitoring | `false` | Set `true` to enable metrics polling  |
| `ALLOW_ANONYMOUS_DEV`  | Skip auth in dev | `false` | **NEVER** set to `true` in production |

## 🟢 FRONTEND (packages/frontend)

### Required for Features

| Variable                             | Purpose              | Example                      | Why You Need It                     |
| ------------------------------------ | -------------------- | ---------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_API_URL`                | Backend API endpoint | `https://api.yourdomain.com` | Frontend needs to know where API is |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe checkout      | `pk_live_...`                | If using Stripe payments            |

### Optional/Monitoring

| Variable                        | Purpose                 | Example                     | Why You Need It            |
| ------------------------------- | ----------------------- | --------------------------- | -------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`        | Frontend error tracking | `https://...@sentry.io/...` | Recommended for production |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics        | `G-XXXXXXXXXX`              | If using analytics         |
| `NEXT_PUBLIC_RELEASE_VERSION`   | Version tracking        | `1.0.0`                     | For release tracking       |
| `CRON_SECRET`                   | Cron auth (server-side) | `your-secret`               | Match backend CRON_SECRET  |

## 🔵 VAULT CONFIGURATION (Optional - for production)

| Variable            | Purpose                 | Example                                    | Why You Need It                   |
| ------------------- | ----------------------- | ------------------------------------------ | --------------------------------- |
| `VAULT_ADDR`        | Vault server URL        | `https://vault.yourdomain.com`             | Enable Vault integration          |
| `VAULT_TOKEN`       | Vault auth (dev only)   | `root`                                     | For local development             |
| `VAULT_ROLE_ID`     | AppRole ID (prod)       | `abc-123...`                               | Production authentication         |
| `VAULT_SECRET_ID`   | AppRole secret (prod)   | `xyz-789...`                               | Production authentication         |
| `VAULT_MOUNT`       | KV mount point          | `secret`                                   | Default is fine                   |
| `VAULT_PREFIX`      | Path prefix             | `app/prod`                                 | Organize secrets by env           |
| `VAULT_MAPPING`     | Explicit mapping        | `{"JWT_SECRET":"app/prod/jwt#JWT_SECRET"}` | **Recommended** over auto-mapping |
| `VAULT_FATAL`       | Fail on missing secrets | `true`                                     | Set `true` in production          |
| `VAULT_CACHE_TTL`   | Cache duration (ms)     | `300000`                                   | 5 min default                     |
| `REQUIRED_ENV_VARS` | Enforce vars            | `DATABASE_URL,JWT_SECRET,OPENAI_API_KEY`   | Comma-separated list              |

## 📊 SUMMARY

### Absolute Minimum (Development)

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
OPENAI_API_KEY=sk-...
JWT_SECRET=your-32-character-or-longer-secret-key
```

### Recommended (Staging/Production)

```bash
# Core
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
JWT_SECRET=...

# Auth & Security
ADMIN_API_KEY=...
CRON_SECRET=...

# Observability
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production

# Optional but recommended
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### With Vault (Production)

```bash
# Vault config
VAULT_ADDR=https://vault.yourdomain.com
VAULT_ROLE_ID=...
VAULT_SECRET_ID=...
VAULT_MOUNT=secret
VAULT_PREFIX=app/prod
VAULT_FATAL=true

# Vault will populate these from Vault paths:
# (you don't set them in env, Vault provides them)
# - DATABASE_URL
# - OPENAI_API_KEY
# - JWT_SECRET
# - STRIPE_SECRET_KEY
# - etc.
```

## 🔍 CURRENTLY MISSING

Based on your code, you are likely missing:

1. **Customer secret management** - No `WorkspaceSecret` table in schema
2. **Encryption utilities** - Need to encrypt customer API keys in database
3. **Secret management UI** - No frontend for customers to add their keys
4. **Key resolution logic** - Need to check workspace secrets before falling back to your keys

## 🎯 NEXT STEPS

1. Create a `.env` file with your current secrets
2. Run the migration script: `node scripts/migrate-env-to-vault.js --dry-run`
3. Review the generated `VAULT_MAPPING`
4. Actually migrate: Remove `--dry-run` flag
5. Add `VAULT_*` variables to your production environment
6. Remove plain secrets from production env (Vault will provide them)

---

**Note:** Never commit `.env` files to git! They should be in `.gitignore`.
