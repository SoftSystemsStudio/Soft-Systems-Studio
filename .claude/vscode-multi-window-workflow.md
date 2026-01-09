# VS Code Multi-Window Claude Code Workflow

## Overview

This guide shows how to run multiple Claude Code sessions in parallel using VS Code's multi-window capabilities.

---

## The Challenge

Claude Code in VS Code is an **extension**, not a CLI tool. You can't run `claude code` from terminal. Instead, you work through the VS Code chat interface.

---

## Solution: Multiple VS Code Windows

### Setup

1. **Current Window** (Terminal 1 - Backend Session)
   - Your existing VS Code window
   - Claude Code chat open
   - Focus: Backend implementation

2. **New Window** (Terminal 2 - Frontend Session)

   ```bash
   # From integrated terminal in Window 1:
   code -n /workspaces/Soft-Systems-Studio
   ```

   - Opens new VS Code window with same workspace
   - Independent Claude Code chat session
   - Focus: Frontend implementation

3. **Third Window** (Terminal 3 - Testing Session)

   ```bash
   # From integrated terminal in Window 1 or 2:
   code -n /workspaces/Soft-Systems-Studio
   ```

   - Another independent window
   - Focus: Testing and validation

---

## Workflow

### Window 1: Backend Agent

**Initial Prompt:**

```
[NEW-FEAT] User preferences API - Backend
GOAL: Implement backend API for user preferences
FILES: apps/agent-api/src/api/v1/users/preferences.ts
BRANCH: feature/user-preferences-backend
CONTEXT: User model exists in Prisma, need CRUD endpoints
CONSTRAINTS:
- Follow auth patterns from api/v1/auth/login.ts
- Use Prisma for database access (ADR-003)
- Write integration tests
OUTPUT: API contract to .claude/contracts/preferences-api.json when done

Let's plan this first.
```

**During Work:**

- Focus only on backend files
- Don't touch frontend code
- Write API contract when done

**Completion:**

```bash
# Window 1 agent writes contract
echo '{
  "version": "1.0",
  "baseUrl": "/api/v1/users/preferences",
  "endpoints": {
    "get": { "method": "GET", "auth": "required", "response": {...} },
    "update": { "method": "PUT", "auth": "required", "body": {...} }
  }
}' > .claude/contracts/preferences-api.json

# Update status
echo "✅ Backend API complete" > .claude/status/backend.txt

# Commit
git add .
git commit -m "feat: add user preferences backend API"
git push origin feature/user-preferences-backend
```

---

### Window 2: Frontend Agent

**Wait for backend completion**, then:

**Initial Prompt:**

```
[NEW-FEAT] User preferences UI - Frontend
GOAL: Build preferences page consuming backend API
FILES: packages/frontend/src/pages/settings/preferences.tsx
BRANCH: feature/user-preferences-frontend
CONTEXT: Backend API ready, contract available
INPUT: Read .claude/contracts/preferences-api.json for API shape
CONSTRAINTS:
- Match design system (check existing pages)
- Use existing form components
- Handle loading/error states
BLOCKED BY: Backend (Session 1) - ✅ COMPLETE

Let's start implementation.
```

**During Work:**

- Read API contract first
- Focus only on frontend files
- Don't touch backend code

**Completion:**

```bash
# Update status
echo "✅ Frontend complete" > .claude/status/frontend.txt

# Commit
git add .
git commit -m "feat: add user preferences frontend UI"
git push origin feature/user-preferences-frontend
```

---

### Window 3: Testing Agent

**Wait for both backend and frontend**, then:

**Initial Prompt:**

```
[NEW-FEAT] User preferences integration tests
GOAL: E2E tests for preferences feature
FILES: apps/agent-api/tests/integration/preferences.test.ts
BRANCH: feature/user-preferences-tests
CONTEXT: Backend and frontend both complete
TEST CASES:
- GET preferences (authenticated user)
- PUT preferences (valid data)
- PUT preferences (invalid data)
- GET preferences (unauthenticated)
BLOCKED BY: Sessions 1 & 2 - ✅ BOTH COMPLETE

Let's write comprehensive tests.
```

**During Work:**

- Test both backend API and frontend integration
- Follow existing test patterns

**Completion:**

```bash
# Run tests
pnpm test preferences

# Update status
echo "✅ Tests passing" > .claude/status/tests.txt

# Commit
git add .
git commit -m "test: add user preferences integration tests"
git push origin feature/user-preferences-tests
```

---

## Coordination Dashboard

**Update `.claude/multi-session-status.md` from each window:**

### Window 1 Updates:

```markdown
## Session 1: Backend (Window 1)

- **Status:** 🔄 In Progress
- **Branch:** feature/user-preferences-backend
- **Progress:** 60%
- **Artifacts:**
  - apps/agent-api/src/api/v1/users/preferences.ts
  - .claude/contracts/preferences-api.json
```

### Window 2 Updates:

```markdown
## Session 2: Frontend (Window 2)

- **Status:** ⏳ Waiting for backend
- **Blocked By:** Session 1
- **Needs:** API contract from .claude/contracts/preferences-api.json
```

---

## Communication Between Windows

### Via Files (Recommended)

**Window 1 writes:**

```bash
# Backend agent completes work
cat > .claude/handoff/backend-to-frontend.md <<EOF
## Handoff: Backend → Frontend

**Status:** ✅ Ready

**API Endpoints:**
- GET /api/v1/users/preferences
- PUT /api/v1/users/preferences

**Contract:** See .claude/contracts/preferences-api.json

**Test Command:**
\`\`\`bash
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/v1/users/preferences
\`\`\`

**Next Steps:**
- Create PreferencesPage component
- Use fetch('/api/v1/users/preferences')
- Handle loading/error states
EOF
```

**Window 2 reads:**

```bash
# Frontend agent checks for handoff
cat .claude/handoff/backend-to-frontend.md
cat .claude/contracts/preferences-api.json
```

### Via Git Branches

Each window works on its own branch:

```
main
├── feature/user-preferences-backend    (Window 1)
├── feature/user-preferences-frontend   (Window 2)
└── feature/user-preferences-tests      (Window 3)
```

**Merge order:**

1. Backend merges first
2. Frontend merges (can now test against real API)
3. Tests merge (validates everything)

---

## Tips for Multi-Window Success

### 1. Keep Windows Focused

**Window 1 (Backend):**

- Only backend files visible in explorer
- Terminal focused on agent-api
- Tests filtered to backend only

**Window 2 (Frontend):**

- Only frontend files visible
- Terminal focused on frontend dev server
- Tests filtered to frontend only

### 2. Use Status Files

Each window updates its status:

```bash
# Window 1
echo "Backend: 50% - Implementing GET endpoint" > .claude/status/session-1.txt

# Window 2
echo "Frontend: Waiting for API contract" > .claude/status/session-2.txt

# Window 3
echo "Tests: Planning test cases" > .claude/status/session-3.txt
```

### 3. Checkpoint Commits

Commit frequently so other windows can pull latest:

```bash
# Window 1 commits API contract
git add .claude/contracts/preferences-api.json
git commit -m "docs: add preferences API contract"
git push

# Window 2 pulls contract
git pull origin main
```

---

## Alternative: Sequential Work with Context Switching

If multi-window feels too complex, use **single session with context switching**:

**1. Backend Phase:**

```
[NEW-FEAT] User preferences - Backend only
... work on backend ...
... commit and push ...

# Save context
pnpm claude:context:save "after-backend-preferences"
```

**2. Frontend Phase:**

```
[NEW-FEAT] User preferences - Frontend only
CONTEXT: Backend complete, contract in .claude/contracts/
... work on frontend ...
... commit and push ...

# Save context
pnpm claude:context:save "after-frontend-preferences"
```

**3. Testing Phase:**

```
[NEW-FEAT] User preferences - Tests only
CONTEXT: Backend and frontend complete
... write tests ...
... commit and push ...
```

---

## Troubleshooting

### "Can't open new VS Code window"

**Solution:**

```bash
# Check if code CLI is in PATH
which code

# If not found, use full path
/vscode/bin/linux-x64/*/bin/remote-cli/code -n /workspaces/Soft-Systems-Studio
```

### "New window shares same Claude session"

This shouldn't happen - each VS Code window gets its own extension instance. If it does:

- Close all windows
- Open fresh window
- Start new Claude chat in each window

### "Context files not syncing between windows"

All windows share the same filesystem, so files should sync immediately. If not:

```bash
# Force git to refresh
git status

# Check file exists
ls -la .claude/contracts/
cat .claude/contracts/preferences-api.json
```

---

## Summary

**Multi-Window Workflow:**

- ✅ Parallel development (backend, frontend, tests)
- ✅ Each window has independent Claude session
- ✅ Coordinate via files (.claude/contracts/, .claude/handoff/)
- ✅ Merge branches in dependency order

**Sequential Workflow:**

- ✅ Simpler (one session)
- ✅ Use context manager to switch focus
- ✅ Work in phases: backend → frontend → tests

**Choose based on:**

- Parallel work = Multi-window
- Sequential work = Single session with context switching

**The key:** Either way, use `.claude/` coordination files to maintain context and track progress!
