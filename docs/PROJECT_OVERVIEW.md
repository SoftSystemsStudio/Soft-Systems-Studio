# Soft Systems Studio - Project Overview

**Production-Grade Multi-Tenant AI Agent Platform**

Version: 0.1.0  
Last Updated: December 12, 2025

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [What Is Soft Systems Studio?](#what-is-soft-systems-studio)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Package Structure](#package-structure)
- [Core Capabilities](#core-capabilities)
- [Development Workflow](#development-workflow)
- [Deployment Options](#deployment-options)
- [Documentation Index](#documentation-index)
- [Getting Started](#getting-started)

---

## Executive Summary

Soft Systems Studio is an **enterprise-ready TypeScript monorepo** designed for building, deploying, and scaling AI-powered business agents. It provides complete infrastructure for multi-tenant SaaS deployments with:

- 🤖 **AI Agent Framework** - Pluggable agent architecture with RAG-based knowledge retrieval
- 🏢 **Multi-Tenancy** - Workspace isolation with role-based access control (RBAC)
- 🔐 **Security Hardening** - JWT authentication, rate limiting, audit logging, timing-safe operations
- 📊 **Production Observability** - Prometheus metrics, Sentry error tracking, structured logging
- 🚀 **Scalable Infrastructure** - BullMQ queues, graceful shutdown, Docker/Kubernetes ready

**Target Use Cases:**
- Customer service automation
- Document-based Q&A systems
- Internal knowledge management agents
- Multi-tenant AI-powered SaaS products

---

## What Is Soft Systems Studio?

Soft Systems Studio is a **full-stack platform** that provides everything needed to deploy production AI agents:

### For Product Teams
- Pre-built customer service agent with conversation memory
- Document ingestion pipeline with vector search
- Multi-workspace dashboard and admin console
- Billing integration via Stripe

### For Engineering Teams
- Type-safe TypeScript monorepo with pnpm workspaces
- Modular architecture with clear separation of concerns
- Comprehensive test coverage (unit, integration, E2E)
- Docker Compose for local development
- Production-ready deployment configurations

### For Operations Teams
- Prometheus metrics for monitoring
- Sentry integration for error tracking
- Structured JSON logging with correlation IDs
- Health checks and graceful shutdown
- Database migrations with Prisma

---

## Key Features

### 🤖 AI Agent System

**Customer Service Agent**
- RAG (Retrieval-Augmented Generation) with vector search
- Conversation memory and context management
- Multi-turn dialogue handling
- Configurable system prompts and behavior

**Document Knowledge Base**
- Async document ingestion via BullMQ queues
- Vector embeddings stored in Qdrant
- Semantic search for relevant context retrieval
- Support for multiple document formats

### 🔐 Security & Authentication

**Authentication Layer**
- JWT access tokens (short-lived, 15 minutes)
- Refresh tokens (long-lived, 7 days) with rotation
- Timing-safe secret comparison
- Session invalidation on logout

**Authorization**
- Role-Based Access Control (RBAC)
  - `admin` - Platform administrators
  - `owner` - Workspace owners
  - `member` - Workspace members
  - `agent` - Service accounts for AI agents
  - `service` - Inter-service authentication
- Workspace-scoped resource isolation
- API key authentication for service-to-service calls

**Security Hardening**
- Helmet.js security headers
- Rate limiting (per-IP, per-workspace, per-endpoint)
- Request validation with Zod schemas
- SQL injection prevention via Prisma ORM
- Environment variable validation at startup

### 👥 Multi-Tenancy

**Workspace Isolation**
- Each workspace operates as an isolated tenant
- Database-level data isolation with workspace_id foreign keys
- Redis-based rate limit tracking per workspace
- Independent billing and usage metering

**User Management**
- Users can belong to multiple workspaces
- Role assignments per workspace
- Invite system for onboarding team members

### 📊 Observability

**Metrics (Prometheus)**
- HTTP request duration and status codes
- Queue depths (waiting, active, failed jobs)
- Database connection pool status
- Redis connection health
- LLM API call latency and token usage
- Rate limit hit counters

**Logging (Pino)**
- Structured JSON logs
- Request correlation IDs
- Automatic PII redaction
- Log levels: trace, debug, info, warn, error, fatal

**Error Tracking (Sentry)**
- Automatic exception capture
- User context and breadcrumbs
- Performance monitoring
- Release tracking

### 🚀 Infrastructure

**Queue System (BullMQ)**
- Reliable background job processing
- Exponential backoff retry logic
- Dead Letter Queue (DLQ) for failed jobs
- Job prioritization and concurrency control

**Database (PostgreSQL + Prisma)**
- Type-safe database access
- Automatic migrations
- Connection pooling
- Query performance monitoring

**Caching (Redis)**
- Rate limit storage
- Session caching
- Queue backing store

**Vector Store (Qdrant)**
- Efficient similarity search
- Hybrid search (vector + keyword)
- Collection-based isolation

---

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **Runtime** | Node.js | 22.x | JavaScript runtime |
| **Package Manager** | pnpm | 8.x | Fast, efficient workspace manager |
| **Framework** | Express | 4.x | REST API server |
| **Frontend** | Next.js | 14.x | React framework with SSR |
| **UI Library** | React | 18.x | Component library |

### Data Layer

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Primary Database** | PostgreSQL 15 | Relational data storage |
| **ORM** | Prisma 6 | Type-safe database client |
| **Cache & Queues** | Redis 7 | In-memory data store |
| **Vector Database** | Qdrant | Similarity search |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Queue System** | BullMQ | Background job processing |
| **API Gateway** | Express + Middleware | Request routing & validation |
| **Authentication** | JWT + Clerk | Token-based auth |
| **Payments** | Stripe | Billing & subscriptions |
| **Containerization** | Docker | Local development & deployment |

### Observability

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Logging** | Pino | Structured JSON logging |
| **Metrics** | Prometheus + prom-client | Time-series metrics |
| **Error Tracking** | Sentry | Exception monitoring |
| **Health Checks** | Custom middleware | Kubernetes readiness/liveness |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Jest** | Unit & integration testing |
| **Supertest** | API endpoint testing |
| **TypeScript** | Static type checking |
| **Husky** | Git hooks for pre-commit checks |

---

## System Architecture

### High-Level Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
│                   (Browser / Mobile / API Clients)                │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐          ┌────────────────────────┐    │
│  │  Frontend (Next.js) │          │   API Gateway          │    │
│  │  • Marketing pages  │          │   (Express)            │    │
│  │  • Dashboard UI     │◄────────►│   • REST endpoints     │    │
│  │  • Admin console    │          │   • WebSocket support  │    │
│  │  • Clerk auth       │          │   • Request validation │    │
│  └─────────────────────┘          └────────┬───────────────┘    │
│                                             │                     │
└─────────────────────────────────────────────┼─────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                       MIDDLEWARE LAYER                            │
├──────────────────────────────────────────────────────────────────┤
│  Authentication │ Authorization │ Validation │ Rate Limiting     │
│  requireAuth    │ requireRole   │ validateBody│ rateLimiters    │
└────────────────────────────────────┬─────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Auth Service │  │ Chat Service │  │  Ingest Service      │  │
│  │ • Login      │  │ • RAG chain  │  │  • Doc processing    │  │
│  │ • Token mgmt │  │ • LLM calls  │  │  • Embedding gen     │  │
│  │ • Sessions   │  │ • Memory     │  │  • Queue management  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                   │
└────────────────┬──────────────┬───────────────┬──────────────────┘
                 │              │               │
       ┌─────────┼──────────────┼───────────────┼─────────┐
       ▼         ▼              ▼               ▼         ▼
┌───────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐
│PostgreSQL │ │ Redis  │ │  Qdrant  │ │  OpenAI  │ │ Stripe  │
│  (Prisma) │ │(Cache/ │ │ (Vector) │ │  (LLM)   │ │(Billing)│
│           │ │ Queue) │ │          │ │          │ │         │
└───────────┘ └────────┘ └──────────┘ └──────────┘ └─────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  Background       │
         │  Workers          │
         │  (BullMQ)         │
         │  • Document jobs  │
         │  • Cleanup tasks  │
         └──────────────────┘
```

### Request Flow

**1. User Request → API Gateway**
```text
Client → Nginx/Load Balancer → Express Server → Route Handler
```

**2. Authentication & Authorization**
```text
Route Handler → requireAuth middleware → JWT verification
              → requireWorkspace middleware → Workspace check
              → requireRole middleware → Permission check
              → Controller function
```

**3. Service Layer Processing**
```text
Controller → Service → Database/External APIs → Response
                    → Queue job (async)
```

**4. Background Processing**
```text
BullMQ Queue → Worker → Service → Database/APIs
            → Retry on failure
            → DLQ on exhaustion
```

---

## Package Structure

### Monorepo Layout

```text
soft-systems-studio/
├── apps/
│   └── agent-api/                    # Main API application
│       ├── src/
│       │   ├── index.ts              # Bootstrap layer (Express setup)
│       │   ├── api/v1/               # Versioned REST endpoints
│       │   │   ├── auth/             # Authentication routes
│       │   │   ├── agents/           # AI agent routes
│       │   │   ├── admin/            # Admin operations
│       │   │   ├── observability/    # Metrics endpoint
│       │   │   └── system/           # Health & status
│       │   ├── middleware/           # Request processing
│       │   │   ├── requireAuth.ts
│       │   │   ├── requireWorkspace.ts
│       │   │   ├── requireRole.ts
│       │   │   ├── validateBody.ts
│       │   │   └── rateLimiters.ts
│       │   ├── services/             # Business logic
│       │   │   ├── auth.ts
│       │   │   ├── chat.ts
│       │   │   ├── ingest.ts
│       │   │   └── token.ts
│       │   ├── schemas/              # Zod validation schemas
│       │   ├── worker/               # BullMQ job processors
│       │   ├── lib/                  # Utility functions
│       │   └── types/                # TypeScript type definitions
│       ├── prisma/
│       │   ├── schema.prisma         # Database schema
│       │   ├── migrations/           # Database migrations
│       │   └── seed.ts               # Seed data
│       └── tests/
│           ├── unit/                 # Unit tests
│           └── integration/          # Integration tests
│
├── packages/
│   ├── frontend/                     # Next.js web application
│   │   ├── src/
│   │   │   ├── pages/                # Next.js pages
│   │   │   ├── components/           # React components
│   │   │   ├── lib/                  # Frontend utilities
│   │   │   └── styles/               # CSS/Tailwind
│   │   └── public/                   # Static assets
│   │
│   ├── agency-core/                  # Shared agent configuration
│   │   └── src/
│   │       ├── configTypes.ts        # Type definitions
│   │       ├── mapping.ts            # Config mapping logic
│   │       └── prompts.ts            # System prompts
│   │
│   ├── agent-customer-service/       # Customer service agent
│   │   └── src/
│   │       ├── handlers/             # Agent handlers
│   │       ├── prompts/              # Agent-specific prompts
│   │       └── schemas.ts            # Input/output schemas
│   │
│   ├── agent-orchestrator/           # Agent orchestration layer
│   │   └── src/
│   │       └── index.ts              # runChat facade
│   │
│   ├── core-llm/                     # LLM abstraction
│   │   └── src/
│   │       └── index.ts              # LLM client wrapper
│   │
│   └── ui-components/                # Shared React components
│       └── src/
│           └── ChatWidget.tsx        # Embeddable chat widget
│
├── docs/                             # Documentation
│   ├── PROJECT_OVERVIEW.md           # This file
│   ├── ARCHITECTURE.md               # Detailed architecture
│   ├── API.md                        # API reference
│   ├── DEPLOYMENT.md                 # Deployment guide
│   ├── SECURITY.md                   # Security documentation
│   ├── ENV.md                        # Environment variables
│   ├── DLQ.md                        # Dead Letter Queue guide
│   ├── METRICS_PROMETHEUS.md         # Metrics documentation
│   └── README.md                     # Documentation index
│
├── infra/                            # Infrastructure
│   └── docker-compose.yml            # Local dev services
│
├── scripts/                          # Utility scripts
│   ├── deploy.sh                     # Deployment script
│   ├── security-audit.sh             # Security scanning
│   └── sync-env.js                   # Env sync utility
│
├── types/                            # Global TypeScript types
│
├── docker-compose.yml                # Production Docker setup
├── docker-compose.dev.yml            # Dev Docker setup
├── Dockerfile                        # API Docker image
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # pnpm workspace config
├── tsconfig.json                     # Root TypeScript config
└── README.md                         # Project README
```

### Package Dependencies

```text
                    ┌─────────────────┐
                    │   agent-api     │
                    │   (Express)     │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────────┐  ┌────────────┐  ┌───────────────┐
│agent-orchestrator│  │ agency-core│  │   core-llm    │
└──────────────────┘  └────────────┘  └───────────────┘
          │
          ▼
┌──────────────────────┐
│agent-customer-service│
└──────────────────────┘

                    ┌─────────────────┐
                    │    frontend     │
                    │    (Next.js)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  ui-components  │
                    └─────────────────┘
```

---

## Core Capabilities

### 1. Customer Service Agent

**Functionality:**
- Conversational AI with multi-turn dialogue support
- Knowledge retrieval from vector database
- Context-aware responses with conversation memory
- Configurable system prompts and persona

**Key Components:**
- `agent-customer-service` package - Agent logic
- `agent-orchestrator` package - Orchestration layer
- `core-llm` package - LLM abstraction
- Chat service - Integration layer

**API Endpoints:**
```http
POST /api/v1/agents/customer-service/run
POST /api/v1/agents/customer-service/chat
```

### 2. Document Ingestion Pipeline

**Functionality:**
- Async document processing via background jobs
- Text extraction and chunking
- Embedding generation with OpenAI
- Vector storage in Qdrant
- Retry logic with exponential backoff

**Key Components:**
- Ingest service - Job creation
- BullMQ worker - Job processing
- Qdrant integration - Vector storage
- DLQ system - Failed job handling

**API Endpoints:**
```http
POST /api/v1/agents/customer-service/ingest
```

### 3. Authentication & Authorization

**Functionality:**
- User registration and login
- JWT token generation and validation
- Refresh token rotation
- Workspace-scoped sessions
- Role-based access control

**Key Components:**
- Auth routes - Login/logout/token endpoints
- Auth service - Business logic
- Token service - JWT operations
- Middleware - requireAuth, requireWorkspace, requireRole

**API Endpoints:**
```http
POST /api/v1/auth/login
POST /api/v1/auth/token
POST /api/v1/auth/logout
POST /api/v1/auth/onboarding
```

### 4. Multi-Tenant Workspaces

**Functionality:**
- Workspace creation and management
- User invitations and role assignment
- Resource isolation per workspace
- Usage tracking and billing

**Key Components:**
- Workspace service
- Prisma schema with workspace_id foreign keys
- Middleware for workspace context

### 5. Observability

**Functionality:**
- HTTP request metrics (duration, status codes, routes)
- Queue metrics (depth, processing time, failures)
- Database metrics (query time, connection pool)
- Custom business metrics (LLM usage, API calls)
- Structured logging with correlation IDs
- Error tracking with user context

**Key Components:**
- Prometheus metrics endpoint
- Pino logger integration
- Sentry error reporting
- Health check endpoints

**Endpoints:**
```http
GET /api/v1/observability/metrics    # Prometheus metrics
GET /api/v1/system/health             # Health check
GET /api/v1/system/status             # Detailed status
```

---

## Development Workflow

### Local Development Setup

**Prerequisites:**
- Node.js 22+
- pnpm 8+
- Docker & Docker Compose
- Git

**Initial Setup:**
```bash
# 1. Clone repository
git clone https://github.com/SoftSystemsStudio/Soft-Systems-Studio.git
cd Soft-Systems-Studio

# 2. Enable pnpm
corepack enable

# 3. Install dependencies
pnpm install

# 4. Set up environment variables
cp .env.example .env
cp apps/agent-api/.env.example apps/agent-api/.env
# Edit .env files with your credentials

# 5. Start infrastructure services
docker compose -f infra/docker-compose.yml up -d

# 6. Run database migrations
pnpm --filter apps-agent-api prisma:generate
pnpm --filter apps-agent-api migrate:dev

# 7. Seed database (optional)
pnpm --filter apps-agent-api seed

# 8. Start development servers
pnpm dev
```

### Development Commands

```bash
# Start all services in watch mode
pnpm dev

# Run tests
pnpm test                              # All tests
pnpm --filter apps-agent-api test      # API tests only

# Code quality
pnpm lint                              # Run ESLint
pnpm lint:fix                          # Fix ESLint issues
pnpm format                            # Format with Prettier
pnpm typecheck                         # TypeScript type checking

# Database operations
pnpm --filter apps-agent-api migrate:dev      # Create & run migration
pnpm --filter apps-agent-api migrate:deploy   # Apply migrations (prod)
pnpm --filter apps-agent-api prisma studio    # Open Prisma Studio

# Build for production
pnpm build                             # Build all packages
```

### Testing Strategy

**Unit Tests:**
- Service functions
- Utility functions
- Schema validations
- Located in `tests/unit/`

**Integration Tests:**
- API endpoints with mocked services
- Database interactions
- Queue job processing
- Located in `tests/integration/`

**E2E Tests:**
- Complete user flows
- Multi-service interactions
- Located in frontend tests

**Running Tests:**
```bash
# All tests
pnpm test

# Watch mode
pnpm --filter apps-agent-api test -- --watch

# Coverage report
pnpm test:ci
```

### Git Workflow

**Branch Strategy:**
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `docs/*` - Documentation updates

**Commit Convention:**
```text
type(scope): description

feat: Add new feature
fix: Bug fix
docs: Documentation update
refactor: Code refactoring
test: Test updates
chore: Build/tooling changes
```

**Pre-commit Hooks:**
- Lint staged files
- Type checking
- Format code
- Run affected tests

---

## Deployment Options

### 1. Docker Compose (Development)

**Use Case:** Local development with hot reload

```bash
docker compose -f docker-compose.dev.yml up --build
```

**Services:**
- API server with nodemon
- PostgreSQL
- Redis
- Qdrant

### 2. Docker Compose (Production)

**Use Case:** Self-hosted production deployment

```bash
docker compose up -d --build
```

**Features:**
- Optimized Docker images
- Health checks
- Automatic restarts
- Volume persistence

### 3. Railway

**Use Case:** Managed PaaS deployment

**Steps:**
1. Connect GitHub repository
2. Configure environment variables
3. Deploy with automatic builds

**Pros:**
- Automatic scaling
- Built-in PostgreSQL/Redis
- Simple deployment

### 4. Render

**Use Case:** Managed container deployment

**Steps:**
1. Create web service from Docker
2. Add PostgreSQL database
3. Add Redis instance
4. Configure environment

### 5. Kubernetes

**Use Case:** Large-scale production deployments

**Components:**
- API deployment (replicas for HA)
- Worker deployment (autoscaling)
- PostgreSQL StatefulSet or managed service
- Redis deployment or managed service
- Ingress for load balancing

**Example Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-api
  template:
    metadata:
      labels:
        app: agent-api
    spec:
      containers:
      - name: api
        image: ghcr.io/softsystemsstudio/agent-api:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
```

### 6. Vercel (Frontend Only)

**Use Case:** Frontend deployment with edge network

**Steps:**
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy

**Features:**
- Automatic deployments on push
- Preview deployments for PRs
- Edge network CDN
- Serverless functions

---

## Documentation Index

### Getting Started
- [Main README](../README.md) - Project overview and quick start
- [Contributing Guide](../CONTRIBUTING.md) - Development setup and workflow
- **[Project Overview](PROJECT_OVERVIEW.md)** - This document

### Architecture & Design
- [Architecture](ARCHITECTURE.md) - System design, data flows, and package structure
- [API Reference](API.md) - REST API endpoints, authentication, and examples
- [Client Config](CLIENT_CONFIG.md) - ClientConfig contract and usage

### Operations & Deployment
- [Deployment Guide](DEPLOYMENT.md) - Production deployment for all platforms
- [Environment Variables](ENV.md) - Complete environment variable reference
- [Security](SECURITY.md) - Security model, authentication, and best practices

### Features & Guides
- [Dead Letter Queue](DLQ.md) - DLQ system for failed jobs
- [Prometheus Metrics](METRICS_PROMETHEUS.md) - Metrics collection and monitoring
- [ISS-1 Implementation](ISS-1-IMPLEMENTATION.md) - Customer service agent implementation

### Development
- [Tailwind Pivot](Tailwind-Pivot.md) - Frontend styling migration notes

---

## Getting Started

### For New Developers

1. **Read this document** to understand the overall system
2. **Review [Architecture](ARCHITECTURE.md)** for technical details
3. **Follow [Quick Start](../README.md#quick-start)** to set up local environment
4. **Review [Contributing Guide](../CONTRIBUTING.md)** for development workflow
5. **Explore [API Reference](API.md)** to understand endpoints

### For Product Managers

1. **Read [Key Features](#key-features)** to understand capabilities
2. **Review [Core Capabilities](#core-capabilities)** for feature details
3. **Check [Deployment Options](#deployment-options)** for hosting
4. **Read [Security](SECURITY.md)** for compliance requirements

### For DevOps/SRE

1. **Review [System Architecture](#system-architecture)** for infrastructure
2. **Read [Deployment Guide](DEPLOYMENT.md)** for deployment options
3. **Check [Observability](#5-observability)** for monitoring setup
4. **Review [Environment Variables](ENV.md)** for configuration

### For Security Teams

1. **Read [Security](SECURITY.md)** for security model
2. **Review [Authentication & Authorization](#3-authentication--authorization)**
3. **Check [Security Hardening](#security--authentication)** features
4. **Review audit logging and compliance features

---

## Support & Resources

### Community
- **GitHub Issues:** [Report bugs and request features](https://github.com/SoftSystemsStudio/Soft-Systems-Studio/issues)
- **GitHub Discussions:** [Ask questions and share ideas](https://github.com/SoftSystemsStudio/Soft-Systems-Studio/discussions)

### Documentation
- **Full Documentation:** `/docs` directory
- **API Reference:** [API.md](API.md)
- **Architecture Guide:** [ARCHITECTURE.md](ARCHITECTURE.md)

### Contact
- **Security Issues:** security@softsystems.studio
- **General Inquiries:** contact@softsystemsstudio.com

---

## License

Copyright © 2025 Soft Systems Studio. All rights reserved.

---

**Built with ❤️ for production AI deployments.**
