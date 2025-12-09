## Integration tests

To run the integration tests for `apps/agent-api` you need a dedicated Postgres test database. These tests may apply schema changes and can be destructive; run them only against a disposable test database.

Steps:

1. Set a test Postgres URL (example):

```bash
export POSTGRES_URL='postgresql://postgres:postgres@localhost:5432/agent_api_test'
```

2. Opt in to applying potentially destructive schema changes for the test DB:

```bash
export PRISMA_ACCEPT_DATA_LOSS=true
```

3. Run the package tests:

```bash
pnpm -w --filter apps-agent-api test
```

Notes:

- The test setup will skip applying Prisma schema changes unless both `POSTGRES_URL` is set and `PRISMA_ACCEPT_DATA_LOSS=true`.
- This is deliberate to prevent accidental data loss in development or CI environments.
