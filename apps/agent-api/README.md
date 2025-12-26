# apps-agent-api

## Integration tests

To run the integration tests for `apps/agent-api` you need a dedicated Postgres test database. These tests may apply schema changes and can be destructive; run them only against a disposable test database.

Steps:

1. Set a test Postgres URL (example):

```bash
export POSTGRES_URL='postgresql://postgres:postgres@localhost:5432/agent_api_test'
```

1. Opt in to applying potentially destructive schema changes for the test DB:

```bash
export PRISMA_ACCEPT_DATA_LOSS=true
```

1. Run the package tests:

```bash
pnpm -w --filter apps-agent-api test
```

Notes:
