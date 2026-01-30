---
name: context-session
description: Manages Claude Code session context according to CLAUDE.md operating model. Helps maintain session state, context governance, and the compact budget.
user-invocable: false
---

# Context Session Skill

This skill provides background knowledge for managing Claude Code sessions according to the project's operating model defined in CLAUDE.md.

## Session State Variables

Track these throughout the session:

```
current_mode: PLANNING | EXECUTION
objective: [Current goal]
compact_count: 0/3
assumptions: [Working assumptions]
open_questions: [Open items]
next_actions: [Queued work]
```

## Mode Selection

### Use PLANNING MODE when:

- Adding new features
- Changing existing behavior
- Cross-module refactors
- Architecture changes
- Database schema changes
- Touching "do not touch" zones:
  - `/apps/agent-api/prisma/migrations/`
  - `/ai-automation-agency-os/02-clients/*/03-operations/`
  - `.env*` files
  - `pnpm-lock.yaml`

### Use EXECUTION MODE when:

- Scoped bug fixes (clear root cause)
- Documentation updates
- Adding tests to existing code
- Formatting/linting fixes
- Configuration tweaks with clear requirements

## Planning Output Checklist

When in PLANNING MODE, output must include:

1. **Goal + success criteria**
2. **In scope / out of scope**
3. **Approach options + decision**
4. **Step-by-step implementation plan**
5. **Validation plan** (tests, manual checks)
6. **Risks + mitigations**

## Context Management Commands

```bash
# Get repo overview after context clear
pnpm claude:briefing

# Get context restart template
pnpm claude:clear

# Check compact budget
pnpm claude:compact-guard

# Save context snapshot
pnpm claude:context:save "label"

# Load saved context
pnpm claude:context:load <context-id>

# List all saved contexts
pnpm claude:context:list
```

## Compact Budget Protocol

- **Maximum compacts per session**: 3
- **Track**: `compact_count`
- **On attempt #4**: Start a new session with summary + objectives

### After Running `clear`

Restate:

1. Objective
2. Constraints
3. Current plan
4. Open questions
5. Next steps

## Quick Start Codes

Reference these from `.claude/QUICK-REFERENCE.md`:

| Code          | Purpose                    |
| ------------- | -------------------------- |
| `[NEW-FEAT]`  | New feature implementation |
| `[BUG-FIX]`   | Bug fix workflow           |
| `[QUICK-FIX]` | Small, scoped fix          |
| `[REVIEW]`    | Code review                |
| `[DEPLOY]`    | Deployment tasks           |
| `[REFACTOR]`  | Refactoring workflow       |
| `[PERF]`      | Performance optimization   |
| `[SECURITY]`  | Security-related changes   |

## Quality Gates

Before committing, ensure:

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm secretlint` passes
- [ ] No `.env` files staged
- [ ] No placeholder values

## Context Drift Detection

Signs of context drift:

- Repeating earlier mistakes
- Forgetting established decisions
- Inconsistent naming/patterns
- Missing previously discussed requirements

**When detected**:

1. Run `pnpm claude:briefing`
2. Review `.claude/session_state.json`
3. Consider fresh session with summary

## Related Files

- Operating model: `/CLAUDE.md`
- Quick reference: `/.claude/QUICK-REFERENCE.md`
- Session state: `/.claude/session_state.json` (gitignored)
- Context manager: `/.claude/context-manager.js`
