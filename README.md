# Soft Systems Studio — Website

The marketing site for [softsystemsstudiollc.com](https://softsystemsstudiollc.com): a Next.js app plus its shared UI components package.

## What this repo is

This used to be a larger monorepo that also held a customer-service chatbot, a Twilio voice receptionist, and a multi-tenant SaaS agent platform. Those were split out on **2026-08-31** so each product has its own repo:

- The chatbot moved to [`SoftSystemsStudio/sss-chatbot`](https://github.com/SoftSystemsStudio/sss-chatbot).
- The voice receptionist and SaaS platform (`apps/agent-api`, `packages/agent-orchestrator`, `packages/core-llm`, `packages/api`, `packages/agency-core`) were removed from this repo as part of the same split; they are not yet extracted to their own repo.

What's left here is just the two packages that make up the marketing site.

## Package structure

```text
.
├── packages/
│   ├── frontend/            # Next.js marketing site (app router)
│   └── ui-components/       # Shared React components (e.g. ChatWidget)
└── scripts/                 # Repo-hygiene scripts (env checks, secret/placeholder scanning)
```

`frontend` depends on `ui-components` via the `workspace:^` protocol — build `ui-components` first.

## Quick start

```bash
corepack enable
pnpm install
cp packages/frontend/.env.example packages/frontend/.env.local
pnpm dev
```

`pnpm dev` runs `frontend`'s own dev server (`next dev`). See `packages/frontend/.env.example` for the environment variables the site expects (Clerk, Resend, Stripe payment links, Sentry, Vapi demo-call, backend API URL).

## Build & deploy

```bash
pnpm --filter @softsystems/ui-components build
pnpm --filter frontend build
```

Production deploys are on **Vercel**, driven by the root [`vercel.json`](vercel.json) (`buildCommand: "pnpm --filter frontend build"`, output `packages/frontend/.next`). Vercel also runs the daily `/api/cron/cleanup-tokens` cron job, which proxies to the backend SaaS API's admin cleanup endpoint (`NEXT_PUBLIC_API_URL`) — that's a runtime call to a separate service, not a build dependency.

## What's intentionally still wired to the old backend

A few routes call out to the SaaS platform's API at runtime over HTTP (not a source dependency — nothing here imports platform code):

- `src/app/api/cron/cleanup-tokens/route.ts` — proxies to `{NEXT_PUBLIC_API_URL}/api/v1/admin/cleanup-tokens`.
- The Next.js rewrite in `next.config.mjs` — proxies `/api/v1/*` to `NEXT_PUBLIC_API_URL`.
- `src/app/api/demo-call/route.ts` and the `VAPI_*` env vars — the live-demo-call feature (Vapi.ai). Left untouched by the 2026-08-31 split.

If `NEXT_PUBLIC_API_URL` isn't configured, the rewrite and cron route no-op gracefully; they don't block the build.

## Commands

```bash
pnpm lint              # ESLint across workspace packages
pnpm typecheck         # tsc --noEmit across workspace packages
pnpm test              # per-package test scripts (frontend has none yet; ui-components has none)
pnpm format            # Prettier
pnpm secretlint        # secret scanning
pnpm scan-placeholders # find placeholder values left in source
pnpm check-env-committed # fail if a .env file is tracked in git
```

## License

Copyright © 2026 Soft Systems Studio. All rights reserved.
