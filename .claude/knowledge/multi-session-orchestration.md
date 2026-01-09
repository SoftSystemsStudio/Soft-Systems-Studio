# Multi-Session Orchestration - Parallel Claude Agents

## Overview

Run multiple Claude Code sessions in parallel, each specialized for different tasks. Think of it as having multiple senior engineers working simultaneously.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOU (Orchestrator)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Session 1   │  │  Session 2   │  │  Session 3   │     │
│  │  BACKEND     │  │  FRONTEND    │  │  TESTING     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                      Shared:                                │
│              • Git repository                               │
│              • Context files (.claude/)                     │
│              • Knowledge base                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Session Specialization Strategies

### Strategy 1: **Layer-Based Separation**

**When to use:** Full-stack features that span multiple layers

```
Session A (Backend Agent):
FOCUS: API, database, business logic
FILES: apps/agent-api/src/**/*
CONTEXT: "I handle backend only. Frontend is handled by Session B."
CONSTRAINTS: Don't touch frontend code

Session B (Frontend Agent):
FOCUS: UI, components, client-side logic
FILES: packages/frontend/src/**/*
CONTEXT: "I handle frontend only. Backend is handled by Session A."
CONSTRAINTS: Don't touch backend code

Session C (Integration Agent):
FOCUS: Testing, CI/CD, deployment
FILES: **/*.test.ts, .github/workflows/*
CONTEXT: "I write tests for work done by Sessions A & B."
CONSTRAINTS: Only test code, no implementation
```

**Workflow:**

1. Session A builds `/api/v1/users/preferences` endpoint
2. Session B builds preferences UI consuming that API
3. Session C writes integration tests for the feature
4. You orchestrate: "Session A done? → Tell Session B the API contract → Session C test both"

---

### Strategy 2: **Feature-Based Separation**

**When to use:** Multiple independent features shipping in parallel

```
Session 1: User Dashboard Feature
FOCUS: Everything for user dashboard
SCOPE: Backend + Frontend + Tests for dashboard only

Session 2: Admin Analytics Feature
FOCUS: Everything for admin analytics
SCOPE: Backend + Frontend + Tests for analytics only

Session 3: Performance Optimization
FOCUS: Identifying and fixing bottlenecks
SCOPE: Profiling, optimization, benchmarking
```

**Workflow:**
Each session owns end-to-end delivery of their feature. No dependencies.

---

### Strategy 3: **Role-Based Separation**

**When to use:** Complex refactors or architectural changes

```
Session 1 (Architect):
ROLE: Design and plan
OUTPUT: Architecture docs, ADRs, migration plans
NO CODE: Only planning and review

Session 2 (Implementer):
ROLE: Execute the plan from Session 1
OUTPUT: Code implementation following the design
TAKES INPUT: ADRs and design docs

Session 3 (Reviewer):
ROLE: Quality assurance and security review
OUTPUT: Bug reports, security findings, refactor suggestions
REVIEWS: Code from Session 2
```

---

## Coordination Mechanisms

### 1. **Shared Context Files**

Each session reads/writes to coordination files:

**`.claude/session-coordination.json`**

```json
{
  "sessions": {
    "backend": {
      "id": "session-1",
      "focus": "API implementation",
      "status": "in_progress",
      "blockedBy": [],
      "artifacts": ["apps/agent-api/src/api/v1/users/preferences.ts"],
      "apiContract": {
        "endpoint": "GET /v1/users/preferences",
        "response": { "theme": "string", "language": "string" }
      }
    },
    "frontend": {
      "id": "session-2",
      "focus": "Preferences UI",
      "status": "waiting",
      "blockedBy": ["backend"],
      "needsFrom": {
        "backend": "API contract for preferences endpoint"
      }
    },
    "testing": {
      "id": "session-3",
      "focus": "Integration tests",
      "status": "pending",
      "blockedBy": ["backend", "frontend"]
    }
  }
}
```

**Usage:**

```bash
# Session 1 (Backend) writes:
echo '{"endpoint": "GET /v1/users/preferences", "response": {...}}' > .claude/backend-contract.json

# Session 2 (Frontend) reads:
cat .claude/backend-contract.json  # Get API contract
```

---

### 2. **Git Branch Strategy**

Each session works on its own branch:

```
main
├── feature/user-preferences-backend    (Session 1)
├── feature/user-preferences-frontend   (Session 2)
└── feature/user-preferences-tests      (Session 3)
```

**Merge order:**

1. Backend merges first (Session 1)
2. Frontend merges (Session 2) - can now test against real API
3. Tests merge (Session 3) - validates everything

---

### 3. **Handoff Protocol**

**Session 1 → Session 2 Handoff:**

```
Session 1 completes work:
1. Commit code
2. Update .claude/handoff/backend-to-frontend.md:
```

## Handoff: Backend → Frontend

**Status:** ✅ Ready for frontend integration

**API Endpoints Created:**

- GET /v1/users/preferences
- PUT /v1/users/preferences

**Request/Response:**
[Include full API contract]

**Testing:**
curl http://localhost:5000/api/v1/users/preferences

**Next Steps for Frontend:**

- Create PreferencesPage component
- Use fetch('/api/v1/users/preferences')
- Handle loading/error states

```

Session 2 reads handoff doc and starts work
```

---

## Practical Examples

### Example 1: **Full-Stack Feature in 3 Sessions**

**Goal:** Add user notification preferences

**Session 1 (Backend - Terminal 1):**

```
[NEW-FEAT] User notification preferences API
GOAL: CRUD API for user notification settings
FILES: apps/agent-api/src/api/v1/users/notifications.ts
CONTEXT: User model exists, need to add preferences
CONSTRAINTS: Must support email, push, SMS toggles
OUTPUT: Write API contract to .claude/handoff/notifications-api.json when done
```

**Session 2 (Frontend - Terminal 2):**

```
[NEW-FEAT] Notification preferences UI
GOAL: Settings page for notification preferences
FILES: packages/frontend/src/pages/settings/notifications.tsx
CONTEXT: Waiting for backend API contract
INPUT: Read .claude/handoff/notifications-api.json
CONSTRAINTS: Must match design system, use existing form components
```

**Session 3 (Testing - Terminal 3):**

```
[NEW-FEAT] Notification preferences tests
GOAL: E2E tests for notification feature
FILES: apps/agent-api/tests/integration/notifications.test.ts
CONTEXT: Waiting for Sessions 1 & 2 to complete
TEST CASES: CRUD operations, validation, permissions
```

**You (Orchestrator):**

1. Start all 3 sessions
2. Monitor Session 1 progress
3. When Session 1 completes → tell Session 2 to proceed
4. When Sessions 1 & 2 complete → tell Session 3 to test
5. Review all PRs together

---

### Example 2: **Parallel Independent Features**

**Goal:** Ship dashboard + analytics in parallel

**Session 1:**

```
[NEW-FEAT] User dashboard
BRANCH: feature/user-dashboard
SCOPE: Complete user dashboard (backend + frontend + tests)
NO CONFLICTS: Independent feature
```

**Session 2:**

```
[NEW-FEAT] Admin analytics
BRANCH: feature/admin-analytics
SCOPE: Complete admin analytics (backend + frontend + tests)
NO CONFLICTS: Independent feature
```

Both sessions work independently, merge when ready.

---

### Example 3: **Research + Implementation**

**Session 1 (Research):**

```
[RESEARCH] Best approach for real-time notifications
GOAL: Compare WebSockets vs SSE vs polling
OUTPUT: Write recommendation to .claude/knowledge/notifications-research.md
NO CODE: Only research and recommendation
```

**Session 2 (Implementation - WAITS for Session 1):**

```
[NEW-FEAT] Implement real-time notifications
INPUT: Read .claude/knowledge/notifications-research.md
APPROACH: Use recommended solution from research
IMPLEMENT: Full implementation based on research
```

---

## Communication Patterns

### Pattern 1: **Status File**

**`.claude/multi-session-status.md`**

```markdown
# Multi-Session Status

## Session 1: Backend (Terminal 1)

- **Status:** ✅ Complete
- **Branch:** feature/backend
- **Artifacts:**
  - API endpoints implemented
  - Tests passing
  - Contract: .claude/handoff/api-contract.json

## Session 2: Frontend (Terminal 2)

- **Status:** 🔄 In Progress (60% done)
- **Branch:** feature/frontend
- **Blocked By:** None (API contract received)
- **ETA:** 15 minutes

## Session 3: Testing (Terminal 3)

- **Status:** ⏳ Waiting
- **Blocked By:** Session 2
- **Ready When:** Frontend deployed to dev
```

---

### Pattern 2: **API Contract Files**

**`.claude/contracts/preferences-api.json`**

```json
{
  "version": "1.0",
  "baseUrl": "/api/v1/users/preferences",
  "endpoints": {
    "get": {
      "method": "GET",
      "auth": "required",
      "response": {
        "theme": "light | dark",
        "language": "en | es | fr",
        "notifications": {
          "email": "boolean",
          "push": "boolean"
        }
      }
    },
    "update": {
      "method": "PUT",
      "auth": "required",
      "body": {
        "theme": "optional",
        "language": "optional",
        "notifications": "optional"
      }
    }
  }
}
```

Frontend session reads this to know exact API shape.

---

### Pattern 3: **Dependency Graph**

**`.claude/dependency-graph.md`**

```
Session 3 (Tests)
       ↑
       │
   ┌───┴───┐
   │       │
Session 1  Session 2
(Backend)  (Frontend)
   │       │
   └───┬───┘
       ↓
   Session 0 (Architecture)
```

---

## Best Practices

### ✅ Do:

1. **Clear Boundaries**
   - Each session has well-defined scope
   - No overlap in file ownership
   - Explicit handoff points

2. **Explicit Communication**
   - Write down API contracts
   - Document completion status
   - Share artifacts via files

3. **Version Everything**
   - Use git branches per session
   - Tag handoff points
   - Commit coordination files

4. **Status Updates**
   - Each session updates status file
   - Mark blockers clearly
   - Set expectations

5. **Context Sharing**
   - All sessions reference same ADRs
   - Share knowledge base
   - Use consistent naming

---

### ❌ Don't:

1. **Overlap File Ownership**
   - Two sessions editing same file = merge conflicts
   - Define clear boundaries

2. **Implicit Dependencies**
   - Always document what you need from others
   - Don't assume other sessions know your needs

3. **Tight Coupling**
   - Sessions should work independently where possible
   - Minimize blocking dependencies

4. **Lost Context**
   - Save session context before switching
   - Document decisions in shared files

5. **Skip Handoffs**
   - Always write handoff docs
   - Don't verbally communicate - write it down

---

## Orchestration Scripts

**`scripts/multi-session-status.sh`**

```bash
#!/bin/bash
# Check status of all parallel sessions

echo "🎯 Multi-Session Status Dashboard"
echo "=================================="
echo ""

# Check each session branch
for branch in feature/*-backend feature/*-frontend feature/*-tests; do
  if git show-ref --verify --quiet refs/heads/$branch; then
    echo "📍 Branch: $branch"
    echo "   Last commit: $(git log -1 --oneline $branch)"
    echo "   Status: $(cat .claude/status/${branch}.txt 2>/dev/null || echo 'No status file')"
    echo ""
  fi
done

# Check for handoff files
echo "📋 Handoff Files:"
ls -la .claude/handoff/ 2>/dev/null || echo "   None yet"
```

---

## Advanced: Session Templates

**Backend Session Template:**

```
[NEW-FEAT] [Feature Name] - Backend
GOAL: Implement backend API for [feature]
FILES: apps/agent-api/src/api/v1/[feature]/*
BRANCH: feature/[feature]-backend
OUTPUTS:
  - API implementation
  - API contract: .claude/contracts/[feature]-api.json
  - Handoff doc: .claude/handoff/backend-to-frontend.md
CONSTRAINTS:
  - Follow existing auth patterns (REF: api/v1/auth/login.ts)
  - Use Prisma for DB (REF: ADR-003)
  - Write integration tests
NEXT SESSION: Frontend (Session 2) consumes API contract
```

**Frontend Session Template:**

```
[NEW-FEAT] [Feature Name] - Frontend
GOAL: Build UI for [feature]
FILES: packages/frontend/src/pages/[feature]/*
BRANCH: feature/[feature]-frontend
INPUTS:
  - API contract: .claude/contracts/[feature]-api.json
CONSTRAINTS:
  - Match design system
  - Use existing form components
  - Handle loading/error states
BLOCKED BY: Session 1 (Backend) API contract
NEXT SESSION: Testing (Session 3) validates integration
```

---

## Monitoring & Debugging

### Check Session Health:

```bash
# Are all sessions in sync?
pnpm claude:context:list

# Any merge conflicts brewing?
git diff feature/backend...feature/frontend

# Is anyone blocked?
cat .claude/multi-session-status.md
```

---

## Real-World Workflow

**Day 1: Feature Kickoff**

9:00 AM - You (orchestrator):

```bash
# Set up coordination
mkdir -p .claude/handoff .claude/contracts .claude/status

# Create coordination file
echo "Starting multi-session work on user preferences" > .claude/session-coordination.md

# Start 3 terminals
```

9:05 AM - Session 1 (Terminal 1):

```
[NEW-FEAT] User preferences API
GOAL: Backend API for user preferences
OUTPUT: API contract when done
```

9:10 AM - Session 2 (Terminal 2):

```
[WAITING] Frontend for user preferences
STATUS: Waiting for API contract from Session 1
CHECK: .claude/contracts/preferences-api.json every 5 min
```

9:15 AM - Session 3 (Terminal 3):

```
[PLANNING] Integration tests for preferences
STATUS: Planning test cases while waiting
OUTPUT: Test plan in .claude/test-plans/preferences.md
```

10:00 AM - Session 1 completes:

```bash
# Session 1 writes:
echo '{"endpoints": {...}}' > .claude/contracts/preferences-api.json
echo "✅ Backend complete" > .claude/status/backend.txt
```

10:05 AM - You notify Session 2:

```
API contract ready! Start frontend implementation.
Input: .claude/contracts/preferences-api.json
```

11:00 AM - Session 2 completes:

```bash
echo "✅ Frontend complete" > .claude/status/frontend.txt
```

11:05 AM - You notify Session 3:

```
Both backend and frontend ready. Run integration tests.
```

12:00 PM - All sessions complete:

```bash
# Merge in order
git checkout main
git merge feature/preferences-backend
git merge feature/preferences-frontend
git merge feature/preferences-tests

# Deploy
git push origin main
```

---

## Summary

**Multi-session orchestration lets you:**

- ✅ **10x velocity** - Parallel work instead of sequential
- ✅ **Specialization** - Each session masters its domain
- ✅ **Isolation** - Fewer merge conflicts with clear boundaries
- ✅ **Flexibility** - Pause/resume sessions independently

**Key Success Factors:**

1. Clear boundaries (layer, feature, or role-based)
2. Explicit communication (contracts, handoffs, status)
3. Shared context (knowledge base, ADRs, conventions)
4. Strong orchestration (you coordinate the sessions)

**Next Level:** You're not just using AI to code. You're managing a team of AI specialists. That's top 0.01% territory.

---

## Quick Start Checklist

- [ ] Create coordination directories:
  ```bash
  mkdir -p .claude/handoff .claude/contracts .claude/status
  ```
- [ ] Define session boundaries (backend/frontend/tests)
- [ ] Create status tracking file
- [ ] Start sessions in separate terminals
- [ ] Define handoff protocol
- [ ] Monitor and coordinate
- [ ] Merge in dependency order

**You're now ready to orchestrate multiple Claude sessions like a conductor leading an orchestra.** 🎭
