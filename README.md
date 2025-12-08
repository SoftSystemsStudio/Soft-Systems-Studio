# Soft Systems Studio

<p align="center">
  <strong>Production-Grade AI Agent Platform</strong><br>
  Multi-tenant SaaS infrastructure for deploying intelligent business automation agents
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## Overview

Soft Systems Studio is an enterprise-ready monorepo for building, deploying, and scaling AI-powered business agents. Built with TypeScript, it provides complete infrastructure for multi-tenant agent deployments with RAG-based knowledge retrieval, secure authentication, queue-based processing, and real-time observability.

### What It Does

- **Customer Service Agents** — AI-powered chat with knowledge base retrieval and conversation memory
- **Document Ingestion** — Async processing pipeline for knowledge base documents with vector search
- **Multi-Tenant Architecture** — Workspace isolation with role-based access control
- **Production Infrastructure** — Queue workers, rate limiting, audit logging, and graceful shutdown

---

## Features

### Core Capabilities

| Feature               | Description                                                          |
| --------------------- | -------------------------------------------------------------------- |
| 🤖 **AI Agents**      | Customer service agent with RAG retrieval and LLM reasoning          |
| 📚 **Knowledge Base** | Document ingestion with Qdrant vector search                         |
| 🔐 **Authentication** | JWT + refresh tokens with workspace scoping                          |
| 👥 **Multi-Tenancy**  | Workspace isolation with RBAC (admin, owner, member, agent, service) |
| 💳 **Billing**        | Stripe integration for subscriptions and usage billing               |
| 📊 **Observability**  | Prometheus metrics, Sentry error tracking, structured logging        |

### Security Hardening

- **Zod Validation** — Strict schema validation on all API endpoints
- **Rate Limiting** — Per-endpoint and per-tenant rate limits with Redis backing
- **Timing-Safe Auth** — Constant-time comparison for secrets to prevent timing attacks
- **Audit Logging** — All admin actions logged with IP, user agent, and timestamp
- **Idempotent Operations** — Deterministic IDs and skip-duplicates for safe retries

### Infrastructure

- **BullMQ Queues** — Reliable background job processing with exponential backoff
- **Graceful Shutdown** — Clean process termination for serverless and container deployments
- **Environment Validation** — Fail-fast startup with comprehensive env var checking
- **Docker Support** — Development and production Docker configurations

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Frontend                                    │
│                     Next.js + Clerk Auth + Tailwind                     │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             Agent API                                    │
│                    Express + TypeScript + Prisma                        │
├─────────────────────────────────────────────────────────────────────────┤
│  Routes          │  Middleware       │  Services                        │
│  ─────────────   │  ────────────     │  ──────────                      │
│  /auth/*         │  requireAuth      │  chat.ts (RAG + LLM)            │
│  /agents/*       │  requireWorkspace │  ingest.ts (KB ingestion)       │
│  /admin/*        │  requireRole      │  qdrant.ts (vector search)      │
│  /stripe/*       │  validateBody     │  token.ts (JWT management)      │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│    PostgreSQL    │   │      Redis       │   │      Qdrant      │
│   (Prisma ORM)   │   │  (BullMQ/Cache)  │   │  (Vector Store)  │
└──────────────────┘   └────────┬─────────┘   └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Ingest Worker   │
                       │   (BullMQ)       │
                       └──────────────────┘
```

### Package Structure

```
soft-systems-studio/
├── apps/
│   └── agent-api/              # Main API service
│       ├── src/
│       │   ├── api/v1/         # REST endpoints
│       │   ├── middleware/     # Auth, rate limiting, validation
│       │   ├── services/       # Business logic
│       │   ├── schemas/        # Zod validation schemas
│       │   └── worker/         # BullMQ workers
│       └── prisma/             # Database schema & migrations
│
├── packages/
│   ├── frontend/               # Next.js web application
│   ├── agency-core/            # Shared config types & prompts
│   ├── agent-customer-service/ # Customer service agent logic
│   ├── core-llm/               # LLM abstraction layer
│   └── ui-components/          # Shared React components
│
├── docs/                       # Documentation
├── infra/                      # Docker compose for local dev
└── scripts/                    # Build & utility scripts
```

---

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 8+
- Docker (for local Postgres/Redis/Qdrant)

### Development Setup

```bash
# 1. Clone and install
git clone https://github.com/SoftSystemsStudio/Soft-Systems-Studio.git
cd Soft-Systems-Studio
corepack enable
pnpm install

# 2. Set up environment
cp .env.example .env
cp apps/agent-api/.env.example apps/agent-api/.env
# Edit .env files with your credentials

# 3. Start infrastructure
docker compose -f infra/docker-compose.yml up -d

# 4. Initialize database
pnpm --filter apps-agent-api prisma:generate
pnpm --filter apps-agent-api migrate:dev
pnpm --filter apps-agent-api seed

# 5. Start development servers
pnpm dev
```

### Using Docker Compose

```bash
# Full stack with hot reload
docker compose -f docker-compose.dev.yml up --build

# Production build
docker compose up --build
```

---

## Documentation

| Document                             | Description                          |
| ------------------------------------ | ------------------------------------ |
| [Architecture](docs/ARCHITECTURE.md) | System design and component overview |
| [API Reference](docs/API.md)         | REST API endpoints and schemas       |
| [Environment](docs/ENV.md)           | Environment variables reference      |
| [Security](docs/SECURITY.md)         | Security model and best practices    |
| [Deployment](docs/DEPLOYMENT.md)     | Production deployment guide          |
| [Contributing](CONTRIBUTING.md)      | Development workflow and testing     |

---

## API Endpoints

## Secrets and configuration

Runtime secrets are sourced from HashiCorp Vault at process startup via `bootstrapVault` (see `apps/agent-api/src/bootstrap/vault.ts`). The bootstrapper authenticates to Vault, reads KV v2 secrets, and populates `process.env` before the application is loaded.

Key environment variables:

- `VAULT_ADDR` – Vault base URL.
- `VAULT_TOKEN` or `VAULT_ROLE_ID` / `VAULT_SECRET_ID` – authentication (token or AppRole).
- `VAULT_MOUNT` – KV mount name (default: `secret`).
- `VAULT_PREFIX` – optional path prefix for all secret lookups (e.g. `myteam`).
- `VAULT_MAPPING` – JSON mapping from env var names to Vault KV v2 paths, e.g.:

  ```json
  {
    "DATABASE_URL": "app/prod/db#DATABASE_URL",
    "REDIS_URL": "app/prod/redis#url",
    "JWT_SECRET": "app/prod/jwt#secret"
  }
  ```

Each mapping value uses the format `<relativePath>#<fieldName>`, where:

- `relativePath` is combined with `VAULT_MOUNT` and `VAULT_PREFIX`, e.g. `secret/myteam/app/prod/db`.
- `fieldName` is the key within the secret’s data.

### Required environment variables

To enforce that certain variables are present after Vault hydration, set:

- `REQUIRED_ENV_VARS` – comma-separated list of required env vars, e.g.:

  ```bash
  REQUIRED_ENV_VARS=DATABASE_URL,REDIS_URL,JWT_SECRET
  ```

Enforcement semantics:

- In non-production (`NODE_ENV !== "production"`): missing vars are logged as warnings.
- In production (`NODE_ENV === "production"`):
  - Default behavior: missing vars are fatal and cause startup to fail.
  - `VAULT_FATAL=false`: disables fatal behavior and downgrades to warnings (escape hatch).

> Note: `bootstrapVault` runs before the application entrypoint. All required variables must be resolvable from Vault or set in the process environment prior to app startup.

### Authentication

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| POST   | `/api/v1/auth/login`      | User login with email/password |
| POST   | `/api/v1/auth/token`      | Refresh access token           |
| POST   | `/api/v1/auth/onboarding` | Create workspace and user      |

### Agents

| Method | Endpoint                                 | Description                      |
| ------ | ---------------------------------------- | -------------------------------- |
| POST   | `/api/v1/agents/customer-service/run`    | Chat with customer service agent |
| POST   | `/api/v1/agents/customer-service/ingest` | Ingest KB documents              |

### Admin

| Method | Endpoint                | Description                 |
| ------ | ----------------------- | --------------------------- |
| POST   | `/api/v1/admin/cleanup` | Trigger data cleanup (cron) |

### Billing

| Method | Endpoint                 | Description            |
| ------ | ------------------------ | ---------------------- |
| POST   | `/api/v1/stripe/webhook` | Stripe webhook handler |

### Health & Metrics

| Method | Endpoint   | Description            |
| ------ | ---------- | ---------------------- |
| GET    | `/health`  | Health check           |
| GET    | `/status`  | Detailed system status |
| GET    | `/metrics` | Prometheus metrics     |

---

## Deployment

### Vercel (Recommended for Frontend)

The frontend is configured for Vercel deployment. Set environment variables in the Vercel dashboard.

### Railway / Render (API)

The API includes a `Dockerfile` optimized for containerized deployments:

```bash
docker build -t soft-systems-api .
docker run -p 5000:5000 --env-file .env soft-systems-api
```

### Environment Variables

See [docs/ENV.md](docs/ENV.md) for the complete environment variable reference.

**Required for production:**

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` — 32+ character secret for JWT signing
- `OPENAI_API_KEY` — OpenAI API key for LLM calls

---

## Tech Stack

| Layer               | Technology                         |
| ------------------- | ---------------------------------- |
| **Language**        | TypeScript 5.x                     |
| **Runtime**         | Node.js 22                         |
| **Frontend**        | Next.js 14, React 18, Tailwind CSS |
| **Backend**         | Express 4, Prisma 6, BullMQ        |
| **Database**        | PostgreSQL 15                      |
| **Cache/Queue**     | Redis (Upstash compatible)         |
| **Vector DB**       | Qdrant                             |
| **Auth**            | JWT + Clerk (frontend)             |
| **Payments**        | Stripe                             |
| **Observability**   | Pino, Prometheus, Sentry           |
| **Package Manager** | pnpm workspaces                    |

---

## Scripts

```bash
# Development
pnpm dev                    # Start all services in dev mode
pnpm build                  # Build all packages
pnpm lint                   # Run ESLint
pnpm typecheck              # TypeScript type checking
pnpm test                   # Run all tests

# Database
pnpm --filter apps-agent-api migrate:dev      # Run migrations (dev)
pnpm --filter apps-agent-api migrate:deploy   # Run migrations (prod)
pnpm --filter apps-agent-api seed             # Seed database

# Utilities
pnpm sync-env               # Sync .env.example to .env
pnpm format                 # Format code with Prettier
```

---

## License

Copyright © 2025 Soft Systems Studio. All rights reserved.

---

<p align="center">
  Built with ❤️ for production AI deployments
</p>
