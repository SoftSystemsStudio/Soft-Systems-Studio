#!/usr/bin/env sh
# Wait for Postgres to accept connections, run migrations/seeds, then start dev server
set -e

echo "[entrypoint] enabling corepack & pnpm"
corepack enable || true
corepack prepare pnpm@8.11.0 --activate || true

echo "[entrypoint] installing dependencies (workspace)"
pnpm -w install --frozen-lockfile || pnpm -w install || true

echo "[entrypoint] waiting for Postgres on db:5432..."
until nc -z db 5432; do
  echo "[entrypoint] Postgres is unavailable - sleeping"
  sleep 1
done
echo "[entrypoint] Postgres is up"

echo "[entrypoint] generating prisma client"
pnpm --filter api prisma:generate || true

echo "[entrypoint] running migrations (migrate dev)"
pnpm --filter api migrate:dev || pnpm --filter api migrate:deploy || true

echo "[entrypoint] running seed"
pnpm --filter api seed || true

echo "[entrypoint] starting API dev server"
pnpm --filter api dev
