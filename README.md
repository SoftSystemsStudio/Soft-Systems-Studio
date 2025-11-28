# Soft Systems Studio — Monorepo for AI Agents

This repository is a production-focused monorepo scaffold for building AI agents and companion tooling. It's designed for developers working in GitHub Codespaces or similar environments and uses TypeScript, Node 22, pnpm workspaces, Next.js (frontend), Express (REST API backend), Prisma and PostgreSQL.

**Architecture**
- `packages/api`: Express + TypeScript API, Prisma ORM, health checks, structured logging (pino).
- `packages/frontend`: Next.js TypeScript frontend.

Key features:
- Monorepo using `pnpm` workspaces
- Devcontainer for Codespaces with Node 22
- ESLint + Prettier standard config
- Jest testing setup
- Prisma + PostgreSQL schema + seed
- Dockerfile for production build
- Minimal GitHub Actions CI: lint, test, build

Quickstart
1. Install Node 22 and pnpm (or use Codespaces/devcontainer)

```bash
corepack enable
corepack prepare pnpm@8.11.0 --activate
pnpm -w install
pnpm --filter api dev
pnpm --filter frontend dev
```

Environment
- Copy `.env.example` to `.env` in the root and in `packages/api` and adjust `POSTGRES_URL`.

Database
- Uses Prisma. Migrations and seeds are wired in `packages/api/package.json`.

CI and Production
- `Dockerfile` builds production image for the `api` package. CI is in `.github/workflows/ci.yml`.

Next steps
- Add your agent services to `packages/api` or new packages under `packages/` and wire up inter-package types.
# Soft-Systems-Studio