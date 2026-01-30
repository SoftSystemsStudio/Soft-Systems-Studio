---
name: deploy-railway
description: Use for Railway deployment tasks including debugging builds, configuring environment variables, troubleshooting health checks, and managing Docker builds.
---

# Deploy Railway Skill

## Overview

This project deploys to Railway using Docker. Key documentation:

- `DEPLOYMENT_QUICKSTART.md`
- `.claude/railway-setup-complete-guide.md`

## Dockerfile Patterns for Monorepo

### Key Build Optimizations

```dockerfile
# Use --ignore-scripts to avoid postinstall issues
RUN pnpm install --frozen-lockfile --ignore-scripts

# Generate Prisma client explicitly after source copy
COPY apps/agent-api/prisma ./apps/agent-api/prisma
RUN pnpm --filter apps-agent-api prisma generate
```

### Security

```dockerfile
# Run as non-root user
USER node
```

### Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/system/health || exit 1
```

## Health Endpoint

The health endpoint at `/api/v1/system/health` validates:

1. **PostgreSQL connection** - Database is reachable
2. **Redis connection** - Cache/queue is reachable
3. **Qdrant connection** - Vector DB is reachable

```typescript
// Health check response
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "qdrant": "ok"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Environment Variables

**Never commit `.env` files** - Configure in Railway dashboard or `railway.json`.

### Required Variables

| Variable            | Description                  |
| ------------------- | ---------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string |
| `REDIS_URL`         | Redis connection string      |
| `QDRANT_HOST`       | Qdrant server host           |
| `QDRANT_API_KEY`    | Qdrant authentication        |
| `JWT_SECRET`        | JWT signing secret           |
| `STRIPE_SECRET_KEY` | Stripe API key               |

### Railway-Specific

| Variable              | Description                              |
| --------------------- | ---------------------------------------- |
| `RAILWAY_ENVIRONMENT` | Current environment (production/staging) |
| `PORT`                | Port to listen on (Railway sets this)    |

## Build Troubleshooting

### Common Issues

| Issue                     | Solution                                         |
| ------------------------- | ------------------------------------------------ |
| `pnpm-lock.yaml` mismatch | Run `pnpm install` locally, commit lock file     |
| Prisma client missing     | Add explicit `prisma generate` in Dockerfile     |
| Out of memory             | Increase Railway instance size or optimize build |
| Health check failing      | Check service dependencies are healthy first     |
| Timeout on start          | Increase `start-period` in HEALTHCHECK           |

### Debug Build Locally

```bash
# Test the Docker build locally
docker build -t agent-api .

# Run with environment
docker run -p 3000:3000 --env-file .env.local agent-api

# Check health
curl http://localhost:3000/api/v1/system/health
```

## Deployment Checklist

1. **Pre-deploy**
   - [ ] All tests passing (`pnpm test`)
   - [ ] Build succeeds (`pnpm build`)
   - [ ] No secrets in code (`pnpm secretlint`)
   - [ ] Environment variables configured in Railway

2. **Deploy**
   - [ ] Push to deploy branch (or trigger manual deploy)
   - [ ] Monitor build logs in Railway dashboard

3. **Post-deploy**
   - [ ] Health check passes
   - [ ] Verify logs for errors
   - [ ] Test critical endpoints
   - [ ] Monitor metrics

## Railway CLI Commands

```bash
# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Open dashboard
railway open

# Run command in Railway environment
railway run pnpm prisma migrate deploy
```

## Rollback

If deployment fails:

1. Go to Railway dashboard
2. Select the service
3. Go to Deployments tab
4. Click "Rollback" on the last working deployment

## Related Files

- Dockerfile: `/Dockerfile` or `/apps/agent-api/Dockerfile`
- Docker ignore: `/.dockerignore`
- Health endpoint: `/apps/agent-api/src/api/v1/system/health.ts`
- Deployment guide: `/DEPLOYMENT_QUICKSTART.md`
