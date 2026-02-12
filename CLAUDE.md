# CLAUDE.md

## Purpose

This file is the repo's operating runbook for Claude Code: how work is planned, executed, validated, and how context is managed.

---

## Product Overview

**What we build**: AI agents (voice, chat, automation) deployed for business clients.

**Core value prop**: Businesses get custom AI automation without building in-house - voice receptionists, customer service agents, workflow automation.

**User types**:

- **Workspace admins**: Manage agents, view conversations, configure settings
- **End users**: Interact with deployed agents (callers, chat users)
- **Agency staff**: Internal team managing client deployments

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

**Planning output checklist**:

- Goal + success criteria
- In scope / out of scope
- Approach options + decision
- Step-by-step implementation plan
- Validation plan (tests, manual checks)
- Risks + mitigations

#### EXECUTION MODE (for scoped tasks)

**Rules**:

- Implement the approved plan (or explicitly stated assumptions)
- Add/adjust tests when behavior changes
- If ambiguity appears → stop and switch to PLANNING MODE

---

## Context Governance

### Clear Protocol (when context is getting saturated)

Run `clear`, then restate:

1. objective
2. constraints
3. current plan
4. open questions
5. next steps

### Compact Budget

- Max compacts per session: 3
- Track `compact_count`
- On attempt #4: start a new session and paste a summary + next objectives

### Session State (maintained during work)

- current_mode: PLANNING | EXECUTION
- objective:
- compact_count: 0/3
- assumptions:
- open_questions:
- next_actions:

---

## Tech Stack

- **Language/runtime**: Node.js + TypeScript 5.3+
- **Frameworks**: Express (API), Next.js 16 (Frontend)
- **Package manager**: pnpm@8.11.0 (monorepo with workspaces)
- **Database**: PostgreSQL with Prisma ORM 5.8
- **Queue**: Redis + BullMQ
- **Vector DB**: Qdrant (document embeddings)
- **Testing**: Jest 30 (unit), supertest (integration), vitest (select packages)
- **Linters/formatters**: ESLint 8 + Prettier 3
- **Git hooks**: Husky 8
- **Security**: secretlint, custom env/placeholder scanners

---

## Deployment Topology

```text
Frontend (Vercel)
├── Next.js app at packages/frontend/
├── Edge middleware for Clerk auth
└── API routes for BFF pattern

Backend (Railway)
├── agent-api Express server
├── PostgreSQL database
├── Redis cache
└── Background workers (BullMQ)
```

---

## Architecture Map

```text
/apps/
  agent-api/           # Main Express API (auth, agents, admin, stripe)
  voice-receptionist/  # Vapi.ai voice agent integration

/packages/
  frontend/            # Next.js marketing + dashboard
  agent-orchestrator/  # Agent execution engine (tools, state, observability)
  agent-customer-service/ # Customer service agent implementation
  agency-core/         # Shared business logic (client config mapping)
  api/                 # Legacy/shared API utilities (⚠️ prefer agent-api)
  core-llm/            # LLM abstractions (embeddings, providers)

/scripts/              # Automation scripts (env sync, security audit, deployment)
/docs/                 # Architecture, deployment, API docs
/ai-automation-agency-os/ # Client-specific configurations and runbooks
```

**Boundaries / "do not touch" zones**:

- `/apps/agent-api/prisma/migrations/` - Never edit manually, use Prisma CLI
- `/ai-automation-agency-os/02-clients/*/03-operations/` - Production client configs (require planning mode)
- `.env*` files - Never commit (guarded by pre-commit)
- `pnpm-lock.yaml` - Only update via `pnpm install`

---

## Data Model

### Agent API Database (Primary)

Location: `/apps/agent-api/prisma/schema.prisma`

```text
Workspace (multi-tenant container)
├── WorkspaceMembership → User (with role)
├── Conversation → Message
├── KbDocument (knowledge base)
└── RefreshToken

EstimateRequest (lead gen, standalone)
```

**Core entities**:

- **Workspace**: Multi-tenant container, has slug, soft-deletable
- **User**: Auth entity (email, password hash), soft-deletable
- **WorkspaceMembership**: Links users to workspaces with roles
- **Conversation/Message**: Chat threads and messages
- **KbDocument**: Knowledge base documents for RAG
- **RefreshToken**: JWT refresh token storage with rotation tracking

### Legacy API Database

Location: `/packages/api/prisma/schema.prisma`

⚠️ Legacy system for client intake/proposals. Prefer agent-api for new work.

```text
Client → IntakeSubmission, ClientConfig, ProposalDraft
```

---

## Auth Patterns

### Strategy: JWT + API Key (dual)

**Primary**: JWT Bearer tokens

- Access tokens: 15min (prod) / 30min (dev)
- Refresh tokens: 7 days (prod) / 30 days (dev)
- Stored in HTTP-only cookies (production)

**Fallback**: API keys via `x-api-key` header or `api_key` query param

### Role Hierarchy (highest → lowest)

```text
super_admin (5) → admin/owner (4) → manager (3) → member/user (2) → service (1) → viewer (0)
```

### Key Middleware

| Middleware         | File                          | Purpose                        |
| ------------------ | ----------------------------- | ------------------------------ |
| `authCombined`     | `middleware/auth-combined.ts` | JWT + API key validation       |
| `requireRole`      | `middleware/role.ts`          | Role enforcement               |
| `requireWorkspace` | `middleware/tenant.ts`        | Workspace isolation            |
| `adminAuth`        | `middleware/adminAuth.ts`     | Admin/cron endpoint protection |

### Auth Routes

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/create-workspace` - Onboarding
- `POST /api/v1/auth/token/refresh` - Token rotation
- `POST /api/v1/auth/token/revoke` - Logout

---

## Third-Party Integrations

| Service       | Purpose                      | Required | Config Keys                               |
| ------------- | ---------------------------- | -------- | ----------------------------------------- |
| PostgreSQL    | Primary database             | Yes      | `DATABASE_URL`                            |
| Redis/Upstash | Cache, rate limiting, queues | Yes      | `REDIS_URL` or `UPSTASH_REDIS_REST_*`     |
| OpenAI        | LLM chat & embeddings        | Yes      | `OPENAI_API_KEY`                          |
| Qdrant        | Vector search/RAG            | No       | `QDRANT_HOST`, `QDRANT_API_KEY`           |
| Stripe        | Payments, subscriptions      | No       | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_*`   |
| Clerk         | Frontend auth                | No       | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_*` |
| Vapi.ai       | Voice agents                 | No       | `VAPI_API_KEY`                            |
| ElevenLabs    | Text-to-speech               | No       | `ELEVENLABS_API_KEY`                      |
| Resend        | Transactional email          | No       | `RESEND_API_KEY`                          |
| Sentry        | Error tracking               | No       | `SENTRY_DSN`                              |
| N8N           | Workflow webhooks            | No       | `N8N_*_WEBHOOK_URL`                       |
| Anthropic     | Alternative LLM              | No       | `ANTHROPIC_API_KEY`                       |

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
- **CSS Modules**: Page-specific styles where needed

### Component Organization

```text
/components/
├── ui/           # Reusable components (Button, Card, HoloCard)
├── sentient/     # Feature sections (hero/, pricing/, faq/)
├── motion/       # Animation components
├── three/        # 3D/Three.js components (use ssr: false)
└── demo/         # Demo-specific components
```

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
- Prisma models: `PascalCase` singular

### Error Handling

- Services: throw descriptive errors
- Controllers: try/catch, return appropriate HTTP status
- Middleware: next(error) for error handling middleware
- Use custom error classes where appropriate

### Logging

- Use `pino` logger from `apps/agent-api/src/logger.ts`
- Structured logging with context (userId, workspaceId, requestId)
- Redact sensitive fields automatically
- No `console.log` in production code (except scripts)

### Tests Required For

- New API endpoints (integration tests)
- Business logic functions (unit tests)
- Middleware (unit tests)
- Bug fixes (regression tests)

### ESLint Rules to Note

- `no-restricted-syntax`: Blocks direct `process.env` access (use typed env modules)
- `security/*`: ESLint plugin security rules enforced
- `@typescript-eslint/no-explicit-any`: Avoid `any`, use `unknown` or proper types

---

## Standard Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev               # Start agent-api + frontend in parallel
pnpm start             # Start agent-api in production mode

# Quality
pnpm lint              # Check all packages
pnpm lint:fix          # Auto-fix all packages
pnpm typecheck         # Run tsc --noEmit across all packages
pnpm format            # Format all files with Prettier
pnpm format:check      # Check formatting without writing

# Testing
pnpm test              # Run all test suites
pnpm test:ci           # CI mode with coverage
pnpm build             # Build all packages

# Security
pnpm secretlint        # Scan for secrets
pnpm check-env-committed # Ensure no .env files staged
pnpm scan-placeholders # Find placeholder values

# Claude helpers
pnpm claude:briefing   # Generate repo summary for fresh AI session
pnpm claude:clear      # Print context restart template
pnpm claude:compact-guard # Check session compact count
```

---

## Change Management

### Feature/Refactor Workflow

1. **PLANNING MODE**
   - Write plan to `docs/plans/YYYY-MM-DD-feature-name.md`
   - Get approval/clarification
2. **Implement in small commits**
   - Each commit passes lint + typecheck + tests
   - Commit messages follow conventional commits
3. **Validate** (tests + manual)
   - Update tests for behavior changes
   - Run full CI suite locally: `pnpm ci`
4. **Document any new behavior**
   - Update README, ARCHITECTURE.md, or inline docs as needed

### Bugfix Workflow

1. **Repro steps** - Document how to reproduce
2. **Root cause** - Identify the underlying issue
3. **Patch** - Minimal, focused fix
4. **Regression test** - Add test that would have caught it

---

## Quality Gates (pre-commit / CI)

### Pre-commit Checks (via Husky)

- ✅ CLAUDE.md context update (auto)
- ✅ secretlint (secret scanning)
- ✅ check-env-committed (prevent .env commits)
- ✅ scan-placeholders (find placeholder values)
- ✅ format:check (Prettier)
- ✅ lint (ESLint)
- ✅ typecheck (TypeScript)

**If checks fail**: fix before commit. No bypassing with `--no-verify` except emergencies.

### CI Checks (GitHub Actions / deployment)

- All pre-commit checks
- Full test suite: `pnpm test:ci`
- Build verification: `pnpm build`
- Security audit: `pnpm audit`

---

## Known Issues & Tech Debt

| Issue                      | Impact | Notes                                                     |
| -------------------------- | ------ | --------------------------------------------------------- |
| `/packages/api/` is legacy | Medium | Prefer `/apps/agent-api/` for new work                    |
| Dual auth systems          | Medium | Custom JWT (API) + Clerk (frontend) - needs consolidation |
| No frontend tests          | Low    | Test coverage is API-only currently                       |
| Patterns scattered         | Low    | Some inconsistency in error handling, validation          |

---

## Auto-updated Commit Context

**Managed by pre-commit hook** (`scripts/update-claude-context.js`)

_This section auto-populates with recent activity to help Claude maintain continuity._

**Last updated**: 2026-02-12T15:28:46.541Z

**Staged changes**: 1 files (1 modified) in: frontend

**Recent commits**:

```text
e4344ca fix(frontend): Force SSR on admin pages to prevent Clerk prerender error (46 minutes ago)
919b243 fix(frontend): Normalize API URL env vars missing protocol prefix (24 hours ago)
57a99ff fix(frontend): Fix Vercel build - normalize API URL and preserve Next.js API routes (24 hours ago)
418dcfc feat: Add AI receptionist config and Call Me Now button (25 hours ago)
de40050 feat: Add Expo, Supabase, RevenueCat, App Store Connect MCP servers and n8n skill (10 days ago)
```

## Session Checkpoints

**Current session state**: See `.claude/session_state.json` (gitignored)

**To reload context after `clear`**:

```bash
pnpm claude:briefing
```

**To get a restart template**:

```bash
pnpm claude:clear
```

**To check compact budget**:

```bash
pnpm claude:compact-guard
```

---

_This CLAUDE.md is a living document. Update it as the project evolves._
