# Deployment Guide

Production deployment guide for Soft Systems Studio.

---

## Table of Contents

- [Architecture Options](#architecture-options)
- [Prerequisites](#prerequisites)
- [Vercel Deployment (Frontend)](#vercel-deployment-frontend)
- [Container Deployment (API)](#container-deployment-api)
- [Database Setup](#database-setup)
- [Redis Setup](#redis-setup)
- [Vector Database Setup](#vector-database-setup)
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Observability](#monitoring--observability)
- [Scaling Considerations](#scaling-considerations)

---

## Architecture Options

### Recommended Stack

| Component | Recommended Service | Alternatives                 |
| --------- | ------------------- | ---------------------------- |
| Frontend  | Vercel              | Netlify, Cloudflare Pages    |
| API       | Railway, Render     | AWS ECS, GCP Cloud Run       |
| Database  | Neon, Supabase      | AWS RDS, PlanetScale         |
| Redis     | Upstash             | AWS ElastiCache, Redis Cloud |
| Vector DB | Qdrant Cloud        | Pinecone, Weaviate           |

### Deployment Topology

```
┌─────────────────────────────────────────────────────────────┐
│                         CDN                                  │
│                       (Vercel)                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                      Frontend                                │
│                 (Next.js on Vercel)                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                      API Server                              │
│              (Express on Railway/Render)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Auth     │  │ Agents   │  │ Admin    │  │ Stripe   │    │
│  │ Routes   │  │ Routes   │  │ Routes   │  │ Webhook  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │  │   Qdrant     │
│    (Neon)    │  │  (Upstash)   │  │   (Cloud)    │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Prerequisites

Before deploying:

1. **Accounts Required:**
   - Vercel account (frontend)
   - Railway/Render account (API)
   - Neon/Supabase account (database)
   - Upstash account (Redis)
   - OpenAI account (LLM)
   - Stripe account (billing)
   - Sentry account (error tracking)

2. **Domain Setup:**
   - Frontend domain (e.g., `app.softsystems.studio`)
   - API domain (e.g., `api.softsystems.studio`)

3. **SSL Certificates:**
   - Automatic via Vercel/Railway
   - Or manual via Let's Encrypt

---

## Vercel Deployment (Frontend)

### 1. Connect Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link
```

### 2. Configure Project

In Vercel dashboard:

- **Framework Preset:** Next.js
- **Root Directory:** `packages/frontend`
- **Build Command:** `pnpm build`
- **Output Directory:** `.next`

### 3. Environment Variables

Set in Vercel dashboard (Settings > Environment Variables):

```env
# Required
NEXT_PUBLIC_API_URL=https://api.softsystems.studio
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx

# Clerk Auth
CLERK_SECRET_KEY=sk_live_xxx

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Stripe (public key for client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### 4. Deploy

```bash
# Production deployment
vercel --prod

# Preview deployment (PR)
vercel
```

---

## Container Deployment (API)

### Docker Build

```dockerfile
# Dockerfile (already in repo)
FROM node:22-slim AS builder
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter apps-agent-api build

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/apps/agent-api/dist ./dist
COPY --from=builder /app/apps/agent-api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/src/index.js"]
```

### Railway Deployment

1. **Connect Repository:** Link GitHub repo in Railway dashboard

2. **Configure Service:**
   - Root Directory: `/`
   - Build Command: `pnpm install && pnpm --filter apps-agent-api build`
   - Start Command: `pnpm --filter apps-agent-api start`

3. **Add Environment Variables:** (see [Environment Configuration](#environment-configuration))

4. **Add Database:** Railway provisions PostgreSQL automatically

### Render Deployment

1. **Create Web Service:** Connect repository

2. **Configure:**
   - Environment: Docker
   - Dockerfile Path: `./Dockerfile`
   - Health Check Path: `/health`

3. **Add Environment Variables**

### Manual Docker Deployment

```bash
# Build
docker build -t soft-systems-api:latest .

# Run
docker run -d \
  --name soft-systems-api \
  -p 5000:5000 \
  --env-file .env.production \
  soft-systems-api:latest

# Health check
curl http://localhost:5000/health
```

---

## Database Setup

### Neon (Recommended)

1. Create project at [neon.tech](https://neon.tech)
2. Create database: `soft_systems_production`
3. Copy connection string

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/soft_systems_production?sslmode=require
```

### Run Migrations

```bash
# From local machine with DATABASE_URL set
pnpm --filter apps-agent-api migrate:deploy

# Or in CI/CD
npx prisma migrate deploy
```

### Seed Production Data (Optional)

```bash
# Only if needed
pnpm --filter apps-agent-api seed
```

---

## Redis Setup

### Upstash (Recommended)

1. Create database at [upstash.com](https://upstash.com)
2. Select region close to API server
3. Copy credentials

```env
# Standard Redis URL
REDIS_URL=rediss://default:xxx@us1-xxx.upstash.io:6379

# REST API (for serverless)
UPSTASH_REDIS_REST_URL=https://us1-xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### QStash (Background Jobs in Serverless)

For Vercel serverless deployments:

```env
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=xxx
QSTASH_CURRENT_SIGNING_KEY=xxx
QSTASH_NEXT_SIGNING_KEY=xxx
```

---

## Vector Database Setup

### Qdrant Cloud

1. Create cluster at [cloud.qdrant.io](https://cloud.qdrant.io)
2. Note cluster URL and API key
3. Create collection (or let app auto-create)

```env
QDRANT_HOST=xxx-xxx.aws.cloud.qdrant.io
QDRANT_PORT=6333
QDRANT_API_KEY=xxx
QDRANT_USE_HTTPS=true
QDRANT_COLLECTION=kb
```

### Self-Hosted Qdrant

```bash
# Docker
docker run -p 6333:6333 qdrant/qdrant

# With persistence
docker run -p 6333:6333 -v qdrant_storage:/qdrant/storage qdrant/qdrant
```

---

## Environment Configuration

### Production Environment Variables

```env
# ===========================================
# REQUIRED
# ===========================================

NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Redis
REDIS_URL=rediss://default:xxx@host:6379

# Authentication
JWT_SECRET=your-32-character-minimum-secret-here
JWT_ALGORITHM=HS256

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# ===========================================
# RECOMMENDED
# ===========================================

# Vector Database
QDRANT_HOST=xxx.cloud.qdrant.io
QDRANT_PORT=6333
QDRANT_API_KEY=xxx
QDRANT_USE_HTTPS=true

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=production

# Admin/Cron Auth
CRON_SECRET=your-32-character-cron-secret
ADMIN_API_KEY=your-32-character-admin-key

# ===========================================
# OPTIONAL
# ===========================================

# Upstash REST (serverless)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# QStash
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=xxx

# Server role (api, worker, all)
SERVER_ROLE=all

# Logging
LOG_LEVEL=info
```

---

## CI/CD Pipeline

### GitHub Actions

The repository includes CI workflows in `.github/workflows/`:

```yaml
# ci.yml - Main CI pipeline
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
```

### Deployment Triggers

- **Production:** Push to `main` branch
- **Staging:** Push to `staging` branch
- **Preview:** Pull request opened

---

## Monitoring & Observability

### Metrics (Prometheus)

The API exposes metrics at `/metrics`:

```bash
# Scrape config for Prometheus
scrape_configs:
  - job_name: 'soft-systems-api'
    static_configs:
      - targets: ['api.softsystems.studio']
    metrics_path: '/metrics'
```

Key metrics:

- `http_requests_total` — Request count by route/status
- `http_request_duration_seconds` — Latency histogram
- `queue_waiting_jobs` — Queue depth
- `queue_active_jobs` — Active workers
- `queue_failed_jobs` — Failed jobs

### Error Tracking (Sentry)

Configure Sentry for both frontend and API:

```env
# API
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=production

# Frontend (in vercel env vars)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Logging

Structured JSON logs with Pino:

```json
{
  "level": "info",
  "time": 1701691200000,
  "msg": "Request completed",
  "req": { "method": "POST", "url": "/api/v1/agents/customer-service/run" },
  "res": { "statusCode": 200 },
  "responseTime": 234
}
```

Ship logs to:

- Railway: Built-in log viewer
- Render: Built-in logs
- AWS: CloudWatch Logs
- Third-party: Datadog, Logtail, Papertrail

---

## Scaling Considerations

### Horizontal Scaling

**API Servers:**

- Stateless design allows horizontal scaling
- Use load balancer (Railway/Render handle this)
- Session state in Redis, not memory

**Workers:**

- Scale workers independently
- Set `SERVER_ROLE=worker` for dedicated worker instances
- BullMQ handles job distribution

### Database Scaling

**PostgreSQL:**

- Neon: Automatic scaling with connection pooling
- Add read replicas for heavy read workloads
- Consider pgBouncer for connection management

**Redis:**

- Upstash: Automatic scaling
- Increase memory for larger queues

### Vector Database

**Qdrant:**

- Scale collection shards for larger datasets
- Add replicas for read performance
- Consider dedicated cluster for >1M vectors

### Cost Optimization

| Tier    | Expected Cost | Capacity                |
| ------- | ------------- | ----------------------- |
| Starter | ~$50/mo       | 10K MAU, 100K API calls |
| Growth  | ~$200/mo      | 50K MAU, 500K API calls |
| Scale   | ~$500/mo      | 200K MAU, 2M API calls  |

_Costs vary by provider and usage patterns._

---

## Troubleshooting

### Common Issues

**Database connection failed:**

```bash
# Check connection string
psql $DATABASE_URL -c "SELECT 1"

# Verify SSL mode
?sslmode=require  # Add to connection string
```

**Redis connection failed:**

```bash
# Test connection
redis-cli -u $REDIS_URL ping
```

**Prisma migration failed:**

```bash
# Reset and re-run (development only!)
npx prisma migrate reset

# Check pending migrations
npx prisma migrate status
```

**Container won't start:**

```bash
# Check logs
docker logs soft-systems-api

# Verify env vars
docker exec soft-systems-api env | grep -E 'DATABASE|REDIS|JWT'
```

### Health Check Endpoints

```bash
# Basic health
curl https://api.softsystems.studio/health

# Detailed status
curl https://api.softsystems.studio/status

# Expected response
{"status":"healthy","services":{"database":"connected","redis":"connected"}}
```

---

## Rollback Procedures

### Database Rollback

```bash
# Rollback last migration
npx prisma migrate rollback

# Restore from backup (platform-specific)
# Neon: Point-in-time recovery in dashboard
```

### API Rollback

```bash
# Railway: Redeploy previous version from dashboard
# Render: Rollback to previous deploy
# Docker: Tag and run previous image
docker run soft-systems-api:v0.1.0
```

### Frontend Rollback

```bash
# Vercel: Instant rollback in dashboard
vercel rollback [deployment-url]
```
