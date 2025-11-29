# Environment variables and secrets

This file documents the critical environment variables used across the system and recommended locations for each secret.

Core application

- `APP_ENV` — `development` / `staging` / `production`
- `APP_NAME` — e.g., `business-agents-saas`
- `LOG_LEVEL` — `INFO` / `DEBUG`
- `JWT_SECRET` — long random secret for JWT signing (backend only)
- `JWT_ALGORITHM` — `HS256`

Database & cache

- `POSTGRES_URL` or `DATABASE_URL` — Postgres connection; used by Prisma/ORM (backend only)
- `REDIS_URL` — Redis connection for queues and cache

Vector DB (Qdrant)

- `QDRANT_URL` — e.g., `http://localhost:6333`
- `QDRANT_API_KEY` — if using a secured Qdrant instance

LLMs & provider keys

- `OPENAI_API_KEY` — primary LLM key (CI and backend should have access where necessary)
- `ANTHROPIC_API_KEY` — optional

OAuth and external services

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- `SENDGRID_API_KEY` or `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

Observability

- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT`
- `OTEL_EXPORTER_ENDPOINT`

CI/CD secrets (GitHub Actions / Vercel)

- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `OPENAI_API_KEY` (if tests or builds require it)

Best practices

1. Never commit `.env` files. Use `.env.example` for placeholders and `scripts/sync-env.js` to populate local `.env` safely.
2. Use a secrets manager in production (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault, or platform environment variables).
3. Limit scopes for OAuth tokens (least privilege) and store tenant tokens encrypted in the DB.
4. Rotate keys periodically and implement revocation/refresh flows for OAuth-based integrations.
