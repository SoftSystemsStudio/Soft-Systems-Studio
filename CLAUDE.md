# CLAUDE.md

## Purpose

This file is the repo's operating runbook for Claude Code: how work is planned, executed, validated, and how context is managed.

---

## Product Overview

**What this repo is**: the marketing website for Soft Systems Studio (softsystemsstudiollc.com) — a Next.js site plus its shared UI components package.

**Provenance**: until 2026-08-31 this repo was a larger monorepo, `SoftSystemsStudio/Soft-Systems-Studio`, that also held a customer-service chatbot, a Twilio voice receptionist, and a multi-tenant SaaS agent platform. Those were split out so each product gets its own repo — the chatbot is now [`SoftSystemsStudio/sss-chatbot`](https://github.com/SoftSystemsStudio/sss-chatbot); the voice receptionist and SaaS platform code were removed from this repo in the same pass and are not yet in a repo of their own. The repo itself was then renamed `SoftSystemsStudio/sss-website` to match what it now contains (GitHub redirects the old name). If you're looking for `apps/agent-api`, `packages/agent-orchestrator`, `packages/core-llm`, `packages/api`, or `packages/agency-core`, they no longer live here.

**User types**:

- **Site visitors** — read the marketing pages, submit the intake form, book a demo call
- **Austin (owner)** — receives intake-form leads by email, no admin dashboard in this repo (the old `/admin` dashboard was deleted in the 2026-08-31 split; it duplicated the lead tool's own dashboard and was unreachable dead weight)

---

## Operating Model

### Always-On Requirements

- **Verify before asserting**: check files/grep/tests instead of guessing
- **Keep diffs tight**: minimal, reversible changes

### Modes

#### PLANNING MODE (required for new features or refactors)

**Trigger**: adding features, changing behavior, cross-module refactors, architecture changes

**Rules**:

- Ask clarifying questions first
- Provide a written plan before coding

#### EXECUTION MODE (for scoped tasks)

**Rules**:

- Implement the approved plan (or explicitly stated assumptions)
- Add/adjust tests when behavior changes
- If ambiguity appears → stop and switch to PLANNING MODE

---

## Tech Stack

- **Language/runtime**: Node.js 22 + TypeScript 5.x
- **Framework**: Next.js 16 (App Router), React 18
- **Package manager**: pnpm@8.11.0 (two-package workspace)
- **Styling**: Tailwind CSS 3.4
- **Auth (site)**: Clerk — only gates the (currently empty) signed-in nav state; there is no protected dashboard left in this repo
- **Email**: Resend (intake-form notifications, welcome emails)
- **Payments**: Stripe Payment Links (hardcoded URLs in `api/intake/route.ts`, not the Stripe API)
- **Error tracking**: Sentry
- **Voice demo**: LiveKit (`/api/livekit-token` mints a room-scoped token; `components/VoiceDemo.tsx` connects in-browser) — replaced the Vapi phone-callback demo on 2026-09-01. The agent itself runs as a separate always-on service on LiveKit Cloud (project `sss-receptionist`), not in this repo.

---

## Deployment Topology

```text
Vercel
├── Next.js app at packages/frontend/
├── Edge middleware for Clerk auth
├── Daily cron: /api/cron/cleanup-tokens (proxies to the SaaS backend, elsewhere)
└── API routes for BFF pattern (intake, livekit-token, cron)
```

There is no backend deployed from this repo. `NEXT_PUBLIC_API_URL` (when set) points at the separate SaaS platform's API for the `/api/v1/*` rewrite and the cleanup-tokens cron proxy — that's a runtime HTTP call, not a build dependency.

---

## Architecture Map

```text
/packages/
  frontend/            # Next.js marketing site (app router)
  ui-components/       # Shared React components (ChatWidget, etc.)

/scripts/              # Repo-hygiene scripts (env checks, secret/placeholder scanning)
```

**Boundaries / "do not touch" zones**:

- `.env*` files — never commit (guarded by pre-commit and `check-env-committed`)
- `pnpm-lock.yaml` — only update via `pnpm install`
- `src/app/api/livekit-token/route.ts` — mints tokens server-side only; `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET` must never reach the client

---

## Frontend Patterns

Location: `/packages/frontend/`

### State Management

React hooks only (`useState`, `useEffect`, `useRef`) - no global state library.

### Data Fetching

Native `fetch()` + Next.js API routes. No React Query, SWR, or tRPC.

### Styling

- **Primary**: Tailwind CSS 3.4 (utility-first)
- **Design tokens**: Custom colors (`brand-lime`), glows, animations in `tailwind.config.cjs`
- **Global CSS**: `/src/styles/globals.css` - glassmorphism, gradients, terminal effects

### Key Conventions

- 3D/heavy components: Use `dynamic()` with `ssr: false`
- Forms: HTML forms + Zod validation on API routes
- Auth: Clerk via `@clerk/nextjs`

---

## Code Standards

### Naming

- Files: `kebab-case.ts`, `PascalCase.tsx` for React components
- Variables/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

### ESLint Rules to Note

- `no-restricted-syntax`: Blocks direct `process.env` access (use `lib/env.ts`)
- `@typescript-eslint/no-explicit-any`: Avoid `any`, use `unknown` or proper types

---

## Standard Commands

```bash
pnpm install
pnpm dev               # frontend dev server
pnpm lint              # ESLint across workspace packages
pnpm lint:fix
pnpm typecheck         # tsc --noEmit across workspace packages
pnpm format
pnpm format:check
pnpm test              # per-package test scripts (none meaningful yet)
pnpm build              # pnpm -r build (ui-components then frontend, dependency order)

# Security / hygiene
pnpm secretlint
pnpm check-env-committed
pnpm scan-placeholders
```

---

## Change Management

### Feature/Refactor Workflow

1. **PLANNING MODE** — write the plan, get clarification
2. **Implement in small commits** — each passes lint + typecheck
3. **Validate** — manual check in the browser; run `pnpm ci` locally
4. **Document** any new behavior in this file or the README

### Bugfix Workflow

1. Repro steps
2. Root cause
3. Minimal patch
4. Regression check (manual, since there's no meaningful automated coverage yet)

---

## Quality Gates (pre-commit / CI)

### Pre-commit (Husky)

- secretlint (secret scanning)
- check-env-committed (prevent `.env` commits)
- scan-placeholders (find placeholder values)
- format:check (Prettier)
- lint (ESLint)
- typecheck (TypeScript)

### CI (`.github/workflows/ci.yml`)

Install → build (`pnpm -w -r build`) → lint → typecheck `@softsystems/ui-components` → `frontend` test script. `.github/workflows/security.yml` runs gitleaks + secretlint + the env/placeholder scanners on a schedule and on push/PR to `main`.

---

## Known Issues & Tech Debt

| Issue                                                        | Impact | Notes                                                                                  |
| ------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| No frontend tests                                              | Low    | `frontend`'s `test` script is a stub                                                    |
| `/api/cron/cleanup-tokens` and the `/api/v1/*` rewrite depend on a backend that no longer lives in this repo | Medium | They no-op gracefully without `NEXT_PUBLIC_API_URL`, but confirm the target service's URL before relying on either |
| `docker-compose*.yml`, root `Dockerfile`, `railway.json`, `infra/` were removed 2026-08-31 | — | They existed only for the now-removed SaaS backend |

---

_This CLAUDE.md is a living document. Update it as the project evolves._
