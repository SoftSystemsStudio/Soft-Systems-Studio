# Soft Systems Agents — Monorepo Documentation

This `docs/README.md` is a developer-focused blueprint for the agent monorepo. It describes the high-level architecture, local dev flows, and where to find key pieces of code.

Repository layout (selected):

- `apps/agent-api/` — Backend API service (Express) exposing agent endpoints and webhooks.
- `apps/marketing-site/` — Marketing + onboarding site (Next.js) (placeholder).
- `packages/core-llm/` — Shared LLM client wrapper and utilities (OpenAI wrapper, retry logic).
- `packages/agent-customer-service/` — Customer Service agent package (prompts, handlers, schemas).
- `packages/ui-components/` — Shared UI components for embedding chat widgets (placeholder).

Quickstart (developer)

1. Ensure Node 22 + pnpm are available (or use the devcontainer in `.devcontainer/`).

```bash
corepack enable
corepack prepare pnpm@8.11.0 --activate
pnpm -w install
pnpm --filter apps/agent-api dev
```

2. Start the local Postgres and API with the provided `docker-compose.dev.yml` if you want the DB and services in containers:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Where to extend

- Add new agent packages under `packages/` (e.g. `agent-appointment-booking`).
- Shared data types and utilities go into `packages/core-llm` and `packages/ui-components`.

Notes about production and CI

- Keep production images minimal (no bind mounts) and use the repository `Dockerfile`/package `Dockerfile`s in `/infra` or at package roots.
- CI should run `pnpm -w -r lint`, `pnpm -w -r test`, and `pnpm -w -r build`.

Next steps

- Implement auth and multi-tenancy (workspace tables + RBAC).
- Add tests for core LLM wrappers and handler flows.
