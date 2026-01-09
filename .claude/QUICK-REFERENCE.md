# Elite Claude Code - Quick Reference Card

## 🚀 Session Start Template

Copy this into EVERY new session:

```
[QUICK-CODE] Feature/Task Name
GOAL: [One sentence outcome]
FILES: [Key files, comma-separated]
CONTEXT: [What's done, what's next]
CONSTRAINTS: [Must-haves/must-not-haves]
PERF: [Performance requirements if any]
SECURITY: [Security considerations if any]
REF: [ADR-XXX or doc to reference]
```

**Example:**

```
[NEW-FEAT] User dashboard
GOAL: Authenticated landing page showing user stats
FILES: packages/frontend/src/pages/dashboard.tsx, apps/agent-api/src/api/v1/user/stats.ts
CONTEXT: Auth middleware ready, need to create endpoint + page
CONSTRAINTS: Must use existing auth, cache stats in Redis for 5 min
PERF: < 200ms p95 latency
SECURITY: User can only see own stats
REF: ADR-001 (Redis patterns), api/v1/auth/login.ts (auth pattern)
```

---

## 📋 Quick Start Codes

Use at beginning of request:

| Code          | Meaning        | Claude Will                           |
| ------------- | -------------- | ------------------------------------- |
| `[NEW-FEAT]`  | New feature    | Ask minimal questions, start planning |
| `[BUG-FIX]`   | Bug/error      | Focus on logs/diagnosis immediately   |
| `[QUICK-FIX]` | Obvious fix    | Just do it, no planning               |
| `[REVIEW]`    | Code review    | Analyze and report issues             |
| `[DEPLOY]`    | Deployment     | Focus on logs/config/env vars         |
| `[REFACTOR]`  | Code cleanup   | Follow existing patterns              |
| `[PERF]`      | Performance    | Profile and optimize                  |
| `[SECURITY]`  | Security issue | Treat as high priority                |

---

## 🛠️ Commands

### Context Management

```bash
# Save current state (before major work)
pnpm claude:context:save "before-auth-refactor"

# List saved contexts
pnpm claude:context:list

# Load context (for next session)
pnpm claude:context:load 2026-01-09-before-auth-refactor
```

### Session Helpers

```bash
# Get comprehensive repo briefing
pnpm claude:briefing

# Context restart template
pnpm claude:clear

# Check session compact count
pnpm claude:compact-guard
```

### Quality Checks

```bash
# Full CI simulation (before committing)
pnpm ci

# Individual checks
pnpm lint          # ESLint
pnpm typecheck     # TypeScript
pnpm test          # All tests
pnpm build         # Build all packages
pnpm secretlint    # Secret scanning
```

---

## 📚 Knowledge Base Reference

Location: `.claude/knowledge/`

| File                        | Purpose          | When to Reference            |
| --------------------------- | ---------------- | ---------------------------- |
| `architecture-decisions.md` | ADRs             | Making architectural choices |
| `performance-insights.md`   | Perf learnings   | Optimizing code              |
| `bug-patterns.md`           | Common bugs      | Debugging                    |
| `best-practices.md`         | Team conventions | Writing new code             |

**In your request:** `REF: ADR-003 (Prisma patterns)`

---

## ✅ Pre-Commit Checklist

Before asking Claude to commit:

```bash
□ pnpm test           # Tests pass
□ pnpm build          # Build succeeds
□ pnpm typecheck      # No TS errors
□ pnpm secretlint     # No secrets
```

If any fail → Share the error + what you tried
If all pass → "Ready to commit: [description]"

---

## 🎯 Elite Workflow

### Before Session:

1. `pnpm claude:context:save "before-[feature]"`
2. Check what's next (session chain or backlog)
3. Gather relevant context (ADRs, existing code)

### During Session:

- Use Quick Start Codes
- Reference ADRs and patterns
- Ask for plans before implementation
- Verify at each checkpoint

### After Session:

1. Update session chain/notes
2. Capture learnings in knowledge base
3. `pnpm claude:context:save "after-[feature]"`
4. `pnpm ci` (verify everything works)

---

## 🔥 Power Patterns

### Pattern 1: Parallel Agents

```
Launch 3 agents in parallel:
1. Backend: [task]
2. Frontend: [task]
3. Tests: [task]
```

### Pattern 2: Diff-First Development

```
Show me the DIFF for [change].
Don't implement yet - I'll review first.
```

### Pattern 3: Failure Mode Analysis

```
Run failure mode analysis on [feature]:
- What can go wrong?
- Blast radius?
- Detection?
- Rollback plan?
```

### Pattern 4: Architecture Health Check

```
Generate architecture health report:
- Circular dependencies
- God objects (> 500 lines)
- Unused exports
- Missing error handling
- Security anti-patterns
```

---

## 📊 Communication Style

**Claude Will:**

- ✅ Give solutions immediately (no "let me understand" commentary)
- ✅ Skip lengthy explanations unless asked
- ✅ Jump to Plan agents for medium+ complexity
- ✅ Assume you understand the codebase
- ✅ Flag security/performance issues proactively

**You Can:**

- Ask "why?" if you want reasoning
- Say "explain" if something is unclear
- Trust Claude will warn about risks

---

## 🚨 When Things Go Wrong

### Deployment Failing

```
[DEPLOY] Railway health checks failing
Logs: [paste full logs]
Env vars: [configured/missing]
Recent changes: [what changed]
```

### Build Errors

```
[BUG-FIX] TypeScript compilation failing
Error: [paste exact error]
File: [file:line]
What I tried: [attempts]
```

### Performance Issues

```
[PERF] API endpoint slow
Endpoint: GET /api/users
Current: p95 = 2000ms
Target: p95 = 200ms
Profiling: [if done]
```

---

## 📁 Critical Files

**Quick Access:**

- Operating runbook: `CLAUDE.md`
- Architecture: `docs/ARCHITECTURE.md`
- Deployment: `DEPLOYMENT_QUICKSTART.md`
- Environment: `apps/agent-api/src/env.ts`
- Database: `apps/agent-api/prisma/schema.prisma`
- Health check: `apps/agent-api/src/api/v1/system/health.ts`

---

## 💡 Pro Tips

1. **One Complete Message > 5 Back-and-Forth Messages**
   - Give all context upfront
   - Include files, constraints, references

2. **Save Context Before Major Work**
   - Creates restore points
   - Enables seamless session continuity

3. **Reference ADRs and Patterns**
   - Speeds up implementation
   - Ensures consistency

4. **Verify Before Commit**
   - `pnpm ci` catches issues early
   - Pre-commit hooks are your friends

5. **Document As You Go**
   - Add ADRs for big decisions
   - Capture performance insights
   - Update knowledge base

---

## 📈 Success Metrics

Track weekly:

- Features shipped
- Bugs fixed
- Test coverage
- Build time
- Session efficiency

**Goal:** 40% faster sessions with elite workflow

---

## 🔗 Resources

- Full guide: `.claude/elite-workflow.md`
- Session templates: `.claude/elite-workflow.md#session-templates`
- ADRs: `.claude/knowledge/architecture-decisions.md`
- Performance: `.claude/knowledge/performance-insights.md`

---

**Remember:** You're in the top 0.1% now. Think in systems, not solutions. Build knowledge that compounds. Automate judgment. Context is king. Quality is velocity.

**Start your next session with the template above and watch your productivity soar! 🚀**
