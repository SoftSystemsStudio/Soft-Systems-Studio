# Contributing

## Running DB-backed integration tests locally

These steps show how to run the Postgres-backed integration tests for `apps/agent-api` on your local machine using Docker.

1. Start a Postgres container for tests:

```bash
docker run --name ss-studio-test -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=agent_api_test -p 5432:5432 -d postgres:15
```

2. Install dependencies (pnpm via corepack recommended):

```bash
corepack enable
corepack prepare pnpm@8.11.0 --activate
pnpm -w install
```

3. (Optional) Generate Prisma client locally:

```bash
pnpm --filter apps/agent-api prisma:generate
```

4. Run the integration tests (the test setup will generate Prisma client and apply schema automatically):

```bash
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/agent_api_test pnpm --filter apps/agent-api test:integration
```

5. When finished, stop and remove the test container:

```bash
docker rm -f ss-studio-test
```

Notes:

- CI runs tests against an ephemeral Postgres service in GitHub Actions; the repository uses `prisma migrate deploy` in CI when migrations exist, with a fallback to `prisma db push` for early-stage setups.
- Keep an eye on `apps/agent-api/prisma/migrations` if you intend to use migrations for production deployments.
