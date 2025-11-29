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

Syncing environment files
- There's a helper script to merge example variables into your `.env` files without overwriting existing values.
- Run from the repo root to update/create both root `.env` and `apps/agent-api/.env`:

```bash
pnpm sync-env
# or: node scripts/sync-env.js
```

The script appends only missing keys from `.env.example` into the corresponding `.env` files and will not replace any existing values. It's a convenient way to keep local envs in sync with the repo examples while preserving developer secrets.

Database
- Uses Prisma. Migrations and seeds are wired in `packages/api/package.json`.

CI and Production
- `Dockerfile` builds production image for the `api` package. CI is in `.github/workflows/ci.yml`.

Docker (local)
- A `docker-compose.yml` is provided to run a local Postgres and the API service for quick testing.
- Start services:

```bash
# start DB and API (builds the API image)
docker compose up --build
```

- The API will be available at `http://localhost:4000` and uses the internal Postgres service.
- If you want the frontend in Docker as well we can add a `packages/frontend/Dockerfile` and service.

Dev Docker Compose
- For a one-command developer experience with hot reload, use the development compose file which mounts the repository into containers and starts the frontend and API in dev mode.

```bash
# start DB, API (dev) and Next frontend (hot reload)
docker compose -f docker-compose.dev.yml up --build

# stop
docker compose -f docker-compose.dev.yml down
```

Notes
- `packages/api/docker-entrypoint.sh` will wait for Postgres, run Prisma generate/migrate/seed, then start the API in dev mode.
- The dev compose mounts the workspace into the container. This is optimized for developer DX; do not use it for production images.

Next steps
- Add your agent services to `packages/api` or new packages under `packages/` and wire up inter-package types.

Pre-commit checks (local safety)
- This repository includes Husky pre-commit hooks that run quick safety checks before commits:

	- `pnpm check-env-committed` — fails if `.env` files are tracked in git.
	- `pnpm scan-placeholders` — scans tracked files for likely secret patterns or disallowed placeholder strings.

	To enable Husky hooks locally after cloning:

```bash
pnpm install
pnpm prepare
```

	After that, the pre-commit checks will run automatically when you commit.
# Soft-Systems-Studio