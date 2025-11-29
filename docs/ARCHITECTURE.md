# Architecture Overview

This document summarizes the high-level architecture and component responsibilities for the platform (production SaaS with four agents).

Architecture summary

- Frontend: Next.js + TypeScript (marketing site and logged-in app)
- Backend: API service(s) (current repo uses a TypeScript/Node API under `apps/agent-api`; blueprint suggests a Python/FastAPI option)
- Data layer: PostgreSQL (Prisma/ORM), Redis (queues & cache), Vector DB (Qdrant), Object storage (S3/Supabase)
- Agents: logical services that orchestrate tools and external integrations — Customer Service, Appointment Booking, Data Processing, Email & Social
- Observability: structured logs, Prometheus metrics, OpenTelemetry traces, Sentry
- CI/CD: GitHub Actions for lint/test/build/deploy; Vercel for frontend deployments is recommended

Directory mapping (how this repo maps to the blueprint)

- `apps/agent-api/` — main API service (TypeScript/Express + Prisma). Implements health, metrics, agent endpoints, queue worker, and Qdrant integration.
- `packages/frontend/` — Next.js frontend (marketing + app starter pages).
- `packages/*` — supporting packages (`core-llm`, `agent-customer-service`, `ui-components`, ...).
- `infra/` — docker-compose for local development (Postgres, Redis, Qdrant, worker).
- `.github/workflows/` — CI jobs and safety checks (env checks, placeholder scan).

Agents and endpoints (implemented or scaffolded)

- Customer Service agent: `POST /api/v1/agents/customer-service/run` — retrieval + LLM + persistence.
- Ingestion endpoints: `/api/v1/agents/customer-service/ingest` — ingests KB documents (async queue + worker).
- Other agents (booking, data-processing, email-social) are scoped in the blueprint and can be added under `apps/agent-api/src/api/v1/agents/` or as separate microservices.

Operational recommendations

- Tenant and RBAC enforcement: validate `req.auth` and tenant ownership on agent endpoints.
- Secrets management: use a secrets manager for production; do not commit `.env` files.
- Observability: export metrics on `/metrics`, and send error traces to Sentry. Add dashboards in Grafana for per-agent usage and cost.
- Reliability: use a dead-letter queue and retries for ingestion worker jobs.

Next steps (recommended)

1. Add tenant scoping and RBAC to agent endpoints and worker.
2. Implement the remaining agents (booking, data-processing, email-social) using the existing pattern.
3. Add integration adapters for OAuth providers and platform APIs (Google, Twilio, Gmail, Zendesk, Stripe).
4. Implement full CI workflows for backend and frontend (lint, type-check, unit tests, integration tests, deploy steps).

Reference: follow `docs/ENV.md` for environment variables and secret matrix.
