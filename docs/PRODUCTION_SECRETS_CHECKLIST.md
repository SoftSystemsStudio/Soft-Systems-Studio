# Production Secrets Checklist

This checklist helps you prepare secrets for production deployment.

## 🔴 Critical - Must Have Before Deployment

- [ ] **DATABASE_URL** - Production PostgreSQL connection string
  - Get from: Railway, Supabase, or your database provider
  - Format: `postgresql://user:password@host:port/database?sslmode=require`
  - ⚠️ Must use SSL in production (`sslmode=require`)

- [ ] **OPENAI_API_KEY** - Rotate the exposed key!
  - 🔴 **URGENT**: Current key was exposed in conversation
  - Rotate at: <https://platform.openai.com/api-keys>
  - Format: `sk-proj-...` or `sk-...`

- [ ] **JWT_SECRET** - Already generated ✅
  - Current: `fXam/zQtZjdAfh6dv581Fm4WjjtGS1zhSNd7/9ewIXE=`
  - Keep this secret and don't share it!

## 🟡 High Priority - Strongly Recommended

- [ ] **REDIS_URL** - Production Redis instance
  - Options:
    - Upstash Redis (serverless): `rediss://...` with REST API
    - Redis Cloud: `redis://...`
    - Railway Redis: `redis://...`
  - Required for: Rate limiting, caching, session management

- [ ] **SENTRY_DSN** - Error tracking
  - Get from: <https://sentry.io/> (free tier available)
  - Format: `https://[key]@[org].ingest.sentry.io/[project]`
  - Set `SENTRY_ENVIRONMENT=production`

- [ ] **ADMIN_API_KEY** - Admin operations
  - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
  - Used for: Admin endpoints, internal service calls

- [ ] **CRON_SECRET** - Protect cron endpoints
  - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
  - Used in: Vercel cron jobs, cleanup tasks

## 🟢 Optional But Recommended

### Payments (If Monetizing)

- [ ] **STRIPE_SECRET_KEY** - Get from Stripe dashboard
  - Dashboard: <https://dashboard.stripe.com/apikeys>
  - Use test key (`sk_test_...`) for staging
  - Use live key (`sk_live_...`) for production

- [ ] **STRIPE_WEBHOOK_SECRET** - Webhook signature verification
  - Format: `whsec_...`
  - Get from: Stripe webhook configuration

### Email (If Using SendGrid)

- [ ] **SENDGRID_API_KEY** - Rotate the exposed key!
  - 🔴 **URGENT**: Current key was exposed
  - Rotate at: <https://app.sendgrid.com/settings/api_keys>

### OAuth (If Using Google Sign-In)

- [ ] **GOOGLE_CLIENT_ID** - Already have (public, OK to share)
- [ ] **GOOGLE_CLIENT_SECRET** - Get from Google Cloud Console
- [ ] **NEXTAUTH_SECRET** - Already generated ✅

### Vector Database (If Using RAG)

- [ ] **QDRANT_URL** - Qdrant cloud URL
- [ ] **QDRANT_API_KEY** - Qdrant API key
- [ ] **QDRANT_USE_HTTPS=true** - Enable for cloud
- [ ] **QDRANT_COLLECTION** - Collection name (default: `kb`)

### Serverless Redis (Alternative to Standard Redis)

- [ ] **UPSTASH_REDIS_REST_URL** - Upstash REST endpoint
- [ ] **UPSTASH_REDIS_REST_TOKEN** - Upstash REST token
  - Get from: <https://console.upstash.com/>

### Background Jobs (If Using Serverless)

- [ ] **QSTASH_URL** - QStash API endpoint
- [ ] **QSTASH_TOKEN** - QStash token
- [ ] **QSTASH_CURRENT_SIGNING_KEY** - Webhook verification
- [ ] **QSTASH_NEXT_SIGNING_KEY** - Key rotation

## 🔵 Environment-Specific Settings

### Production

```bash
NODE_ENV=production
LOG_LEVEL=warn
SENTRY_ENVIRONMENT=production
ALLOW_ANONYMOUS_DEV=false  # MUST be false!
SERVER_ROLE=api  # or 'worker' or 'all'
```

### Staging

```bash
NODE_ENV=production
LOG_LEVEL=info
SENTRY_ENVIRONMENT=staging
ALLOW_ANONYMOUS_DEV=false
```

### Development

```bash
NODE_ENV=development
LOG_LEVEL=debug
SENTRY_ENVIRONMENT=development
ALLOW_ANONYMOUS_DEV=false  # Set to true only if needed for local testing
```

## 📝 Platform-Specific Instructions

### Vercel (Frontend)

Add these in Vercel dashboard → Settings → Environment Variables:

```bash
# Frontend needs these
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Server-side (keep secret)
CRON_SECRET=<same as backend>
```

### Railway (Backend API)

Add these in Railway dashboard → Variables:

```bash
# All the backend secrets from above
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Railway auto-injects
NODE_ENV=production
# ... add all other secrets
```

### Using HashiCorp Vault (Recommended)

Instead of manually adding secrets to Vercel/Railway, use Vault:

1. **Store secrets in Vault** using the migration script:

   ```bash
   VAULT_ADDR=https://vault.yourdomain.com \
   VAULT_TOKEN=<your-token> \
   node scripts/migrate-env-to-vault.js
   ```

2. **Set only Vault config in your platform**:

   ```bash
   VAULT_ADDR=https://vault.yourdomain.com
   VAULT_ROLE_ID=<approle-id>
   VAULT_SECRET_ID=<approle-secret>
   VAULT_MOUNT=secret
   VAULT_PREFIX=app/prod
   VAULT_FATAL=true
   ```

3. **App loads secrets from Vault at startup** ✨

## 🔒 Security Checklist

- [ ] All exposed keys have been rotated
- [ ] `.env` file is in `.gitignore` (should already be)
- [ ] No secrets committed to git (check with `git log -S "sk-"`)
- [ ] `ALLOW_ANONYMOUS_DEV=false` in production
- [ ] `NODE_ENV=production` in production
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `ADMIN_API_KEY` is at least 32 characters
- [ ] All API keys use least-privilege permissions
- [ ] Database uses SSL (`sslmode=require`)
- [ ] Webhook secrets are configured (Stripe, QStash)

## 📊 Quick Reference: Where to Get Keys

| Service  | Dashboard URL                                       | What You Need              |
| -------- | --------------------------------------------------- | -------------------------- |
| OpenAI   | <https://platform.openai.com/api-keys>              | API Key                    |
| Stripe   | <https://dashboard.stripe.com/apikeys>              | Secret Key, Webhook Secret |
| Sentry   | <https://sentry.io/settings/projects/>              | DSN                        |
| SendGrid | <https://app.sendgrid.com/settings/api_keys>        | API Key                    |
| Upstash  | <https://console.upstash.com/>                      | Redis URL, Token, QStash   |
| Google   | <https://console.cloud.google.com/apis/credentials> | OAuth Client ID & Secret   |
| Qdrant   | <https://cloud.qdrant.io/>                          | URL, API Key               |

## ✅ Validation

Test your production config locally first:

```bash
# Copy .env to .env.production (don't commit!)
cp .env .env.production

# Edit .env.production with production values
# Then test:
NODE_ENV=production node -r dotenv/config apps/agent-api/src/index.ts dotenv_config_path=.env.production
```

## 🚀 Deployment Order

1. ✅ Generate all secrets (see above)
2. ✅ Rotate exposed keys (OpenAI, SendGrid)
3. ✅ Test locally with production config
4. ✅ Add secrets to Vault OR platform (Vercel/Railway)
5. ✅ Deploy backend (Railway/similar)
6. ✅ Deploy frontend (Vercel)
7. ✅ Verify health checks and error tracking

---

**Last Updated**: December 10, 2025  
**Status**: Ready for production deployment after rotating exposed keys
