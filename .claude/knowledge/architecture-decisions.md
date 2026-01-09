# Architecture Decision Records

Document all significant architectural decisions here. Each ADR should include context, decision, rationale, alternatives, and lessons learned.

---

## ADR-001: Monorepo with pnpm Workspaces (Existing)

**Context:** Managing multiple related packages (agent-api, frontend, agent-orchestrator, etc.) that share dependencies and need coordinated releases.

**Decision:** Use pnpm workspaces with monorepo structure.

**Rationale:**

- Efficient disk usage (pnpm's content-addressable storage)
- Fast installs (pnpm is 2x faster than npm/yarn)
- Workspace protocol for inter-package dependencies
- Built-in support for multiple packages

**Alternatives Considered:**

1. Separate repos - ❌ Coordination overhead, version drift
2. Lerna + npm - ❌ Slower, more complex
3. Yarn workspaces - ❌ Less efficient than pnpm

**Implementation:** Root `pnpm-workspace.yaml` + individual package.json files

**Lessons Learned:**

- Use `pnpm -r` for recursive commands across all workspaces
- Shared dev dependencies should be in root package.json
- Build order matters - use `pnpm -r --filter` for specific packages

---

## ADR-002: TypeScript Strict Mode (Existing)

**Context:** Need type safety across large codebase with multiple contributors.

**Decision:** Enable strict mode in all `tsconfig.json` files.

**Rationale:**

- Catch errors at compile time vs runtime
- Better IDE autocomplete and refactoring
- Prevents entire classes of bugs (null refs, undefined access)

**Configuration:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Lessons Learned:**

- Use `unknown` instead of `any` when type is truly unknown
- Catch blocks: `catch (err: unknown)` + type guard
- Optional chaining `?.` and nullish coalescing `??` are your friends

---

## ADR-003: Prisma ORM (Existing)

**Context:** Need type-safe database access with migration support for PostgreSQL.

**Decision:** Use Prisma ORM v5.8+

**Rationale:**

- Auto-generated TypeScript types from schema
- Migration tooling built-in
- Connection pooling via PgBouncer support
- Excellent dev experience

**Implementation:** `apps/agent-api/prisma/schema.prisma`

**Alternatives Considered:**

1. Knex.js - ❌ Not type-safe
2. TypeORM - ❌ Complex, decorator-heavy
3. Raw SQL - ❌ No type safety, manual migrations

**Lessons Learned:**

- Always use `prisma.$queryRaw` with parameterized queries (prevents SQL injection)
- Use `prisma generate` in postinstall hook
- Never edit migrations manually - use Prisma CLI

---

## ADR-004: Health Check Endpoint Pattern (Existing)

**Context:** Need to monitor service health for Railway/Kubernetes deployments.

**Decision:** `/health` endpoint that checks all critical dependencies (database, Redis, Qdrant).

**Rationale:**

- Platform-agnostic health checking
- Returns 503 if any dependency is down (prevents routing to unhealthy instances)
- Includes latency metrics for observability

**Implementation:** `apps/agent-api/src/api/v1/system/health.ts`

**Response Format:**

```json
{
  "status": "ok" | "degraded",
  "services": {
    "database": "healthy" | "unhealthy",
    "redis": "healthy" | "unhealthy",
    "qdrant": "healthy" | "unhealthy"
  },
  "qdrant": {
    "healthy": true,
    "latencyMs": 45
  }
}
```

**Lessons Learned:**

- Set short timeouts (250-500ms) so health checks don't block
- Make Redis/Qdrant checks optional via env vars (REQUIRE_REDIS_HEALTH)
- Log failures for debugging but don't crash the health endpoint itself

---

## ADR-005: Pre-commit Hooks with Husky (Existing)

**Context:** Need to enforce code quality and prevent secrets/bad code from being committed.

**Decision:** Use Husky v8 for git hooks with comprehensive checks.

**Rationale:**

- Catch issues before they reach CI/remote repo
- Faster feedback loop (local vs waiting for CI)
- Prevents accidental secret commits

**Hook Chain:**

1. Update CLAUDE.md context (informational)
2. secretlint (security)
3. check-env-committed (security)
4. scan-placeholders (security)
5. Prettier format check (quality)
6. ESLint (quality)
7. TypeScript typecheck (correctness)

**Lessons Learned:**

- Auto-format files before staging (prevents format check loop)
- Allow bypass with `--no-verify` for emergencies only
- Keep checks fast (< 30 seconds total) or developers will bypass

---

## ADR-006: [TEMPLATE FOR NEXT DECISION]

**Context:** [What problem are we solving?]

**Decision:** [What did we decide?]

**Rationale:**

- [Why did we make this choice?]
- [What are the benefits?]

**Alternatives Considered:**

1. [Option 1] - ❌ [Why rejected]
2. [Option 2] - ❌ [Why rejected]

**Implementation:** [Where is this implemented?]

**Lessons Learned:**

- [What did we learn during/after implementation?]
- [What would we do differently next time?]

**Future Optimization:**

- [What could be improved in the future?]

---

## How to Add New ADRs

1. Copy the template above
2. Assign next sequential number (ADR-XXX)
3. Fill in all sections (don't skip!)
4. Add date in the title
5. Reference the ADR in related code comments:
   ```typescript
   // Following ADR-003 pattern for database access
   const user = await prisma.user.findUnique({ where: { id } });
   ```

---

## ADR Index

- **ADR-001:** Monorepo with pnpm Workspaces
- **ADR-002:** TypeScript Strict Mode
- **ADR-003:** Prisma ORM
- **ADR-004:** Health Check Endpoint Pattern
- **ADR-005:** Pre-commit Hooks with Husky
- **ADR-006:** [Available]
