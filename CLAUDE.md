# CLAUDE.md

## Purpose

This file is the repo's operating runbook for Claude Code: how work is planned, executed, validated, and how context is managed.

---

## Operating Model

### Always-On Requirements

- **Thinking**: ON at all times
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

## Repo Conventions

### Tech Stack

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

### Architecture Map

```
/apps/
  agent-api/           # Main Express API (auth, agents, admin, stripe)
  voice-receptionist/  # Vapi.ai voice agent integration

/packages/
  frontend/            # Next.js marketing + dashboard
  agent-orchestrator/  # Agent execution engine (tools, state, observability)
  agent-customer-service/ # Customer service agent implementation
  agency-core/         # Shared business logic (client config mapping)
  api/                 # Legacy/shared API utilities
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

### Standard Commands

```bash
# Install dependencies
pnpm install

# Lint
pnpm lint              # Check all packages
pnpm lint:fix          # Auto-fix all packages

# Type check
pnpm typecheck         # Run tsc --noEmit across all packages

# Test
pnpm test              # Run all test suites
pnpm test:ci           # CI mode with coverage

# Build
pnpm build             # Build all packages

# Run
pnpm dev               # Start agent-api + frontend in parallel
pnpm start             # Start agent-api in production mode

# Format
pnpm format            # Format all files with Prettier
pnpm format:check      # Check formatting without writing

# Security
pnpm secretlint        # Scan for secrets
pnpm check-env-committed # Ensure no .env files staged
pnpm scan-placeholders # Find placeholder values

# Claude helpers
pnpm claude:briefing   # Generate repo summary for fresh AI session
pnpm claude:clear      # Print context restart template
pnpm claude:compact-guard # Check session compact count
```

### Code Standards

**Naming**:

- Files: `kebab-case.ts`, `PascalCase.tsx` for React components
- Variables/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Prisma models: `PascalCase` singular

**Error handling**:

- Services: throw descriptive errors
- Controllers: try/catch, return appropriate HTTP status
- Middleware: next(error) for error handling middleware
- Use custom error classes where appropriate

**Logging**:

- Use `pino` logger from `apps/agent-api/src/logger.ts`
- Structured logging with context (userId, workspaceId, requestId)
- Redact sensitive fields automatically
- No `console.log` in production code (except scripts)

**Tests required for**:

- New API endpoints (integration tests)
- Business logic functions (unit tests)
- Middleware (unit tests)
- Bug fixes (regression tests)

**ESLint rules to note**:

- `no-restricted-syntax`: Blocks direct `process.env` access (use typed env modules)
- `security/*`: ESLint plugin security rules enforced
- `@typescript-eslint/no-explicit-any`: Avoid `any`, use `unknown` or proper types

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

Required checks:

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

## Auto-updated Commit Context

**Managed by pre-commit hook** (`scripts/update-claude-context.js`)

_This section auto-populates with recent commit context to help Claude maintain continuity._

**Last updated**: 2026-01-09T04:49:18.716Z

**Current staged changes summary**:
root/: 1 modified
packages/: 2 added, 2 modified

**Recent git commits**:

```
bd1f39a - feat: rebrand homepage as tech company offering AI automation and web design (26 minutes ago)
065d4a6 - fix: resolve pre-commit hook circular issue and disable GPG signing (6 days ago)
0234366 - fix: resolve TypeScript error in env.ts blocking Railway deployment (6 days ago)
6c23bbc - chore: improve health check robustness and environment configuration (7 days ago)
606a0ef - feat: add Playwright MCP integration and website screenshot (8 days ago)
```

**Recent commits**: (rolling window of last 10)

### Commit 1: 2026-01-09T04:49:18.716Z

**Staged files**:

```
M	CLAUDE.md
A	packages/frontend/src/components/estimator/ProjectEstimator.tsx
A	packages/frontend/src/components/estimator/index.ts
M	packages/frontend/src/pages/index.tsx
M	packages/frontend/tsconfig.tsbuildinfo
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

## Quick Reference

### When to use PLANNING MODE

- Adding new features
- Changing existing behavior
- Refactoring across multiple files
- Touching "do not touch" zones
- Architecture changes
- Database schema changes

### When EXECUTION MODE is fine

- Bug fixes (scoped, clear root cause)
- Documentation updates
- Adding tests to existing code
- Formatting/linting fixes
- Configuration tweaks with clear requirements

### Emergency Procedures

**If pre-commit hook fails**:

1. Read the error message
2. Fix the issue
3. Re-stage: `git add .`
4. Try commit again

**If CI fails**:

1. Pull CI logs
2. Reproduce locally: `pnpm ci`
3. Fix and push again

**If you suspect context drift**:

1. Run `pnpm claude:briefing`
2. Review `.claude/session_state.json`
3. Consider starting fresh session with summary

---

_This CLAUDE.md is a living document. Update it as the project evolves._
