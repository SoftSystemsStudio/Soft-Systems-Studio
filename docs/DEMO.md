# Demo Guide

Quick start guide to run a live demo of Soft Systems Studio.

---

## Prerequisites

- **Node.js** 22+ with corepack enabled
- **Docker** & Docker Compose
- **pnpm** 8+ (will be installed via corepack)
- **Git**

---

## 🚀 One-Command Demo

```bash
git clone https://github.com/SoftSystemsStudio/Soft-Systems-Studio.git
cd Soft-Systems-Studio
./scripts/demo.sh
```

This will:
1. Check prerequisites
2. Install dependencies
3. Start Docker services (Postgres, Redis, Qdrant)
4. Run database migrations
5. Seed demo data
6. Start the API server
7. Print demo credentials and test URLs

---

## 📋 Manual Setup

If you prefer step-by-step control:

### 1. Clone and Install

```bash
git clone https://github.com/SoftSystemsStudio/Soft-Systems-Studio.git
cd Soft-Systems-Studio
corepack enable
pnpm install
```

### 2. Environment Configuration

```bash
# Copy example environment files
cp .env.example .env
cp apps/agent-api/.env.example apps/agent-api/.env

# Edit apps/agent-api/.env with your API keys
# At minimum, set:
# - DATABASE_URL (or use default for local postgres)
# - OPENAI_API_KEY (for LLM functionality)
# - JWT_SECRET (generate with: openssl rand -base64 32)
```

**Required Environment Variables:**

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/softsystems` | PostgreSQL connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis for queues & cache |
| `QDRANT_URL` | `http://localhost:6333` | Vector database |
| `OPENAI_API_KEY` | `sk-...` | OpenAI for embeddings & LLM |
| `JWT_SECRET` | `<random-32-bytes>` | JWT signing secret |
| `PORT` | `5000` | API server port |

### 3. Start Infrastructure Services

```bash
# Start Postgres, Redis, and Qdrant
docker compose -f infra/docker-compose.yml up -d

# Verify services are running
docker compose -f infra/docker-compose.yml ps
```

Expected output:
```
NAME                IMAGE                    STATUS
infra-db-1          postgres:15-alpine       Up
infra-redis-1       redis:7-alpine           Up
infra-qdrant-1      qdrant/qdrant:latest     Up
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm --filter apps-agent-api prisma:generate

# Run migrations
pnpm --filter apps-agent-api migrate:dev

# Seed demo data
pnpm --filter apps-agent-api seed
```

### 5. Build and Start

```bash
# Build all packages
pnpm build

# Start the API server
pnpm --filter apps-agent-api start
```

Or for development with hot reload:
```bash
pnpm --filter apps-agent-api dev
```

---

## 🧪 Testing the API

### Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-12T10:30:00.000Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "qdrant": "healthy"
  }
}
```

### Authentication Flow

#### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "SecurePass123!",
    "workspaceId": "demo"
  }'
```

Expected response:
```json
{
  "userId": "usr_...",
  "email": "demo@example.com",
  "workspaceId": "demo"
}
```

#### 2. Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "SecurePass123!"
  }'
```

Expected response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_...",
    "email": "demo@example.com"
  }
}
```

**Save the accessToken for subsequent requests!**

### Agent Interaction

#### Run Customer Service Agent

```bash
# Replace YOUR_ACCESS_TOKEN with the token from login
export TOKEN="YOUR_ACCESS_TOKEN"

curl -X POST http://localhost:5000/api/v1/agents/customer-service/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "workspaceId": "demo",
    "agentId": "customer-service",
    "input": {
      "messages": [
        {
          "role": "user",
          "content": "What is Soft Systems Studio?"
        }
      ]
    },
    "stream": false
  }'
```

Expected response:
```json
{
  "runId": "run_...",
  "status": "completed",
  "reply": "Soft Systems Studio is an enterprise-ready AI agent platform..."
}
```

### Document Ingestion

#### Upload Knowledge Base Document

```bash
curl -X POST http://localhost:5000/api/v1/workspaces/demo/documents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Product Documentation",
    "content": "Soft Systems Studio provides multi-tenant AI agent infrastructure...",
    "metadata": {
      "category": "documentation",
      "author": "Demo User"
    }
  }'
```

Expected response:
```json
{
  "documentId": "doc_...",
  "status": "queued",
  "jobId": "job_..."
}
```

#### Check Ingestion Status

```bash
curl -X GET "http://localhost:5000/api/v1/workspaces/demo/documents/doc_.../status" \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "documentId": "doc_...",
  "status": "completed",
  "chunkCount": 15,
  "vectorized": true
}
```

---

## 🔍 Admin Operations

### View Metrics

```bash
curl http://localhost:5000/metrics
```

Returns Prometheus-formatted metrics for monitoring.

### View Workspace Stats

```bash
curl -X GET http://localhost:5000/api/v1/admin/workspaces/demo/stats \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "workspaceId": "demo",
  "userCount": 5,
  "documentCount": 23,
  "conversationCount": 47,
  "totalTokensUsed": 125000,
  "storageUsed": "2.3 MB"
}
```

---

## 🎭 Demo Scenarios

### Scenario 1: Customer Support Bot

**Context:** Customer asks about product features

```bash
curl -X POST http://localhost:5000/api/v1/agents/customer-service/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "workspaceId": "demo",
    "agentId": "customer-service",
    "input": {
      "messages": [
        {"role": "user", "content": "How does multi-tenancy work?"}
      ]
    }
  }'
```

### Scenario 2: Knowledge Base Query

**Context:** User needs technical documentation

```bash
curl -X POST http://localhost:5000/api/v1/agents/customer-service/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "workspaceId": "demo",
    "agentId": "customer-service",
    "input": {
      "messages": [
        {"role": "user", "content": "Show me deployment options"}
      ]
    }
  }'
```

### Scenario 3: Multi-Turn Conversation

```bash
# First message
curl -X POST http://localhost:5000/api/v1/agents/customer-service/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "workspaceId": "demo",
    "agentId": "customer-service",
    "input": {
      "messages": [
        {"role": "user", "content": "What databases do you support?"}
      ]
    }
  }'

# Follow-up question (uses conversation memory)
curl -X POST http://localhost:5000/api/v1/agents/customer-service/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "workspaceId": "demo",
    "agentId": "customer-service",
    "input": {
      "messages": [
        {"role": "user", "content": "What databases do you support?"},
        {"role": "assistant", "content": "We support PostgreSQL..."},
        {"role": "user", "content": "How do I connect to PostgreSQL?"}
      ]
    }
  }'
```

---

## 📊 Monitoring

### View Real-Time Metrics

Open Prometheus metrics endpoint:
```bash
curl http://localhost:5000/metrics | grep -E "^(http|job|llm)_"
```

Key metrics to watch:
- `http_request_duration_seconds` - API response times
- `job_queue_waiting` - Pending background jobs
- `llm_api_calls_total` - LLM API usage
- `llm_tokens_used` - Token consumption

### Check Worker Status

```bash
# View Dead Letter Queue stats
pnpm --filter apps-agent-api dlq:stats

# List failed jobs
pnpm --filter apps-agent-api dlq:list
```

---

## 🛠️ Troubleshooting

### API Won't Start

**Symptom:** `Error: Cannot connect to database`

**Solution:**
```bash
# Check Docker services are running
docker compose -f infra/docker-compose.yml ps

# Restart if needed
docker compose -f infra/docker-compose.yml restart

# Check logs
docker compose -f infra/docker-compose.yml logs db
```

### Authentication Fails

**Symptom:** `401 Unauthorized` on API requests

**Solutions:**
1. Verify JWT_SECRET is set in `.env`
2. Check token hasn't expired (15 min lifetime)
3. Ensure Authorization header format: `Bearer <token>`

```bash
# Decode JWT to check expiry (requires jq)
echo $TOKEN | cut -d. -f2 | base64 -d | jq .exp
```

### Agent Responses Are Slow

**Symptom:** Requests take >10 seconds

**Checklist:**
- [ ] OPENAI_API_KEY is valid
- [ ] Qdrant service is running
- [ ] Redis is connected (check with `redis-cli ping`)
- [ ] Database connection pool not exhausted

```bash
# Check service connectivity
curl http://localhost:6333/healthz  # Qdrant
redis-cli ping                       # Redis
psql $DATABASE_URL -c "SELECT 1"    # Postgres
```

### Documents Not Ingesting

**Symptom:** Status stuck at "queued"

**Solution:**
```bash
# Check worker is running
pnpm --filter apps-agent-api worker

# Check queue stats
pnpm --filter apps-agent-api dlq:stats

# View specific job
pnpm --filter apps-agent-api dlq:inspect <jobId>
```

### Port Already in Use

**Symptom:** `Error: listen EADDRINUSE :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=5001 pnpm --filter apps-agent-api start
```

---

## 🎥 Video Walkthrough

Coming soon: Link to YouTube demo video

---

## 📚 Next Steps

After running the demo:

1. **Explore Documentation:**
   - [API Reference](./API.md)
   - [Architecture Deep Dive](./ARCHITECTURE.md)
   - [Deployment Guide](./DEPLOYMENT.md)
   - [Security Best Practices](./SECURITY.md)

2. **Customize Your Agent:**
   - Modify prompts in `packages/agent-customer-service/src/prompts/`
   - Add custom tools and integrations
   - Configure persona and behavior

3. **Scale to Production:**
   - Review [Production Secrets Checklist](./PRODUCTION_SECRETS_CHECKLIST.md)
   - Set up monitoring with Prometheus & Grafana
   - Configure error tracking with Sentry
   - Deploy to Railway, Render, or AWS

4. **Add More Agents:**
   - Create new agent package in `packages/`
   - Register in agent registry
   - Configure routes and permissions

---

## 🤝 Getting Help

- **Documentation:** [docs/README.md](./README.md)
- **Issues:** [GitHub Issues](https://github.com/SoftSystemsStudio/Soft-Systems-Studio/issues)
- **Email:** <contact@softsystemsstudio.com>
- **Community:** [Discord](https://discord.gg/softsystems) (coming soon)

---

## 🔐 Demo Credentials

**Default Demo Workspace:**
- Workspace ID: `demo`
- Name: Demo Workspace

**Test Users:**
After running seed script, you can login with:
- Email: `demo@example.com`
- Password: `SecurePass123!`

**⚠️ Security Warning:**
These are demo credentials only. Never use default credentials in production!

---

## 📝 License

This project is licensed under the terms specified in the LICENSE file.
