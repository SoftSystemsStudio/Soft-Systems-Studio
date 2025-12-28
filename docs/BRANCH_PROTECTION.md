# Branch Protection & Merge Governance

## Overview

This document describes how to set up GitHub branch protection to enforce the Phase 1/2/3 CI strategy, making "Core CI (Canonical)" the single authoritative merge gate while allowing deeper validation through optional Lane B.

---

## Phase 3 CI Lanes

### Lane A: Core CI (Canonical) — **REQUIRED MERGE GATE**

**Workflow:** `.github/workflows/ci-cd.yml`  
**Status:** ✅ Must pass to merge  
**Services:** None (fast, deterministic, no infra drift)  
**Runtime:** ~3–5 seconds  
**What it checks:**

- Build workspace (TypeScript compilation)
- Lint (ESLint)
- Typecheck (per-package tsc)
- Unit + light integration tests (60 passing, 6 skipped)

**Key property:** Always green when run locally; no flaky infra dependencies.

---

### Lane B: Full Integration Tests (Optional) — **NOT A MERGE BLOCKER**

**Workflow:** `.github/workflows/ci-full-integration.yml`  
**Status:** ⚠️ May fail; does not block merges  
**Trigger:** Manual (`workflow_dispatch`) + Nightly (02:00 UTC)  
**Services:** Postgres + Redis (controlled infra; occasional drift expected)  
**Runtime:** ~5–10 minutes  
**What it checks:**

- All of Lane A (build, lint, typecheck)
- Heavy integration suites with `CI_STABLE=true`:
  - `tests/integration/chat-route.test.ts`
  - `tests/integration/bootstrap-layering.test.ts`
  - `tests/integration/request-context.test.ts`
- Redis-backed queue tests (dlq, async workers)
- Full app bootstrap verification

**Key property:** Deep validation; acceptable infra drift; informs debt burn-down priorities.

---

## GitHub Branch Protection Setup

### Objective

Enforce Lane A as the only required check for merges to `main`. Allow Lane B to run but do not require it.

### Step-by-Step Configuration

#### 1. Navigate to Branch Protection Settings

1. Go to **GitHub Repository** → **Settings** → **Branches**
2. Click **Add rule** (or edit existing rule for `main`)
3. Enter branch name pattern: `main`

#### 2. Require Status Checks to Pass

✅ **Enable:** "Require status checks to pass before merging"

#### 3. Require Specific Status Checks

✅ **Enable:** "Require branches to be up to date before merging"

**Select exactly one required workflow:**

- ☑️ `Core CI (Canonical) / Build, Typecheck, Lint, Test`

**Do NOT select:**

- ❌ `Full Integration Tests (Lane B) / Full Integration (Services + Heavy Tests)` — leave unchecked

#### 4. Require Code Review

✅ **Enable:** "Require a pull request before merging"

- Require at least **1** approval
- ☑️ Dismiss stale pull request approvals when new commits are pushed
- ☑️ Require review from code owners (if applicable)

#### 5. Require Merge to Be Up to Date

✅ **Enable:** "Require branches to be up to date before merging"

This ensures the latest commits are tested by Lane A before merge.

#### 6. Concurrency & Cancellation

✅ **Enable:** Concurrency group in `ci-cd.yml` (already configured)

**Effect:** When you push a new commit, superseded workflow runs are cancelled automatically, reducing noise and cost.

#### 7. Restrict Who Can Push to Base Branch

✅ **Enable:** "Restrict who can push to matching branches"

- Allow only **administrators** or specific teams (optional but recommended)

#### 8. Include Administrators

⚠️ **Optional:** If you want branch protection to apply to admins too:

- ☑️ "Include administrators in restrictions"

---

## Complete Branch Protection Checklist

```
MAIN BRANCH PROTECTION CHECKLIST
================================

[ ] 1. Branch name pattern: main
[ ] 2. ✅ Require pull request before merging
         - At least 1 approval required
         - ☑️ Dismiss stale approvals
         - ☑️ Require code owner review (if applicable)
[ ] 3. ✅ Require status checks to pass
         - ☑️ Require branches to be up to date before merging
         - ☑️ Core CI (Canonical) / Build, Typecheck, Lint, Test
         - ❌ (Do NOT check Full Integration Tests)
[ ] 4. ✅ Require conversation resolution before merging
[ ] 5. ✅ Require signed commits (optional but recommended)
[ ] 6. ✅ Restrict who can push to matching branches (optional)
[ ] 7. ✅ Allow force pushes: Disabled
[ ] 8. ✅ Allow deletions: Disabled
[ ] 9. ✅ Concurrency: cancel-in-progress enabled in ci-cd.yml
[ ] 10. ✅ Create: enabled (allow creation of matching branches)
```

---

## Workflow for Contributors

### To Merge a PR to `main`

1. **Get approved** by at least 1 reviewer
   - Code review is your accountability mechanism
   - Lane A CI must be green

2. **Wait for Lane A (Core CI) to pass**
   - Runs automatically on push to PR
   - ~3–5 seconds
   - No manual intervention needed
   - If it fails: fix and re-push

3. **Click "Merge" button**
   - GitHub enforces that Lane A is green
   - You cannot bypass this without admin override
   - Lane B (Full Integration) may still be running nightly; that's OK

### Optional: Run Lane B Before Merge

If you want deep validation **before** merging (not required):

1. Go to **Actions** → **Full Integration Tests (Lane B)**
2. Click **Run workflow** → **Run workflow**
3. Wait ~5–10 minutes for results
4. Review output (informational; does not block merge)

---

## Automation & Notifications

### Lane A Failure Notifications

When Lane A fails, GitHub automatically:

- Shows red ❌ on the PR
- Prevents merge button from being clickable
- (Optional) Sends email to PR author

**Action:** Fix the issue and re-push; Lane A will re-run automatically.

### Lane B Failure Notifications (Nightly)

When Lane B fails (nightly or manual dispatch), GitHub:

- Shows result in **Actions** tab
- Does NOT prevent merge (not a blocker)
- (Optional) Sends Slack/Discord notification (set up separately)

**Action:** Review the nightly results; create issues for flaky tests; prioritize for Phase 3B refactoring.

---

## Phase 3B: Debt Burn-Down Roadmap

### When Lane B Identifies Flaky Tests

1. **Document the failure pattern** in an issue:
   - Workflow name: `Full Integration Tests (Lane B)`
   - Test file: `tests/integration/XXX.test.ts`
   - Failure rate: % (over N runs)
   - Suspected cause: infra drift, timing, missing mock, etc.

2. **Prioritize refactoring** (highest ROI first):
   - **chat-route.test.ts:** Replace full app boot with router-level harness
   - **bootstrap-layering.test.ts:** Split static analysis (fast) from runtime checks (service lane)
   - **request-context.test.ts:** Isolate middleware; avoid full Express app import

3. **Target metrics for Phase 3B:**
   - Lane B runtime: <5 min (was potentially 10+ min)
   - Test pass rate: >95% (reduce flakiness)
   - Reduced service setup burden (use testcontainers or similar)

---

## Key Operational Rules

### Rule 1: Lane A is the Merge Gate

- If Lane A is green and you have 1 approval → you can merge
- If Lane A is red → you cannot merge (GitHub blocks you)
- No exceptions; no manual bypass needed for normal flow

### Rule 2: Lane B Does Not Block

- Lane B may be running but does not prevent merge
- Lane B failures are tracked separately as infra/test debt
- Use Lane B results to prioritize debt burn-down

### Rule 3: Concurrency Cancels Redundant Runs

- When you push a new commit, superseded Lane A runs are cancelled
- Reduces CI queue pressure and cost
- Already configured in `ci-cd.yml` (`cancel-in-progress: true`)

### Rule 4: Admins Can Override (Rare)

- If Lane A legitimately can't pass due to infra issue:
  1. Document the reason in a comment
  2. Get explicit approval from tech lead
  3. Use "Dismiss stale reviews" + "Bypass branch protections" (admin only)
  4. After merge, file issue to resolve the infra problem

---

## GitHub Actions Configuration Tips

### Monitor Workflow Runs

**To see all workflow runs:**

- Repository → **Actions** tab
- Filter by workflow name (e.g., "Core CI (Canonical)")
- Click any run to see step-by-step logs

### Troubleshoot Lane A Failures

1. Click the failing PR → **Checks** tab
2. Find "Core CI (Canonical)" → click **Details**
3. Expand the failing step
4. Read the error; fix locally; re-push

### Troubleshoot Lane B Failures (Nightly)

1. Go to **Actions** → **Full Integration Tests (Lane B)**
2. Find the nightly run (by timestamp or commit)
3. Expand failing test step
4. Note the service issue (DB migration, Redis hang, etc.)
5. Create issue for Phase 3B refactoring

---

## Cost & Performance Impact

### With This Setup

| Metric                       | Value                                           |
| ---------------------------- | ----------------------------------------------- |
| **Lane A runtime**           | ~3–5s                                           |
| **Lane A per-PR cost**       | ~$0.01 (compute)                                |
| **Lane B runtime** (nightly) | ~5–10 min                                       |
| **Lane B per-night cost**    | ~$0.05 (compute)                                |
| **Total nightly cost**       | ~$0.10 (Lane A on all PRs + nightly Lane B)     |
| **Merge throughput**         | Unblocked (Lane A is fast)                      |
| **Developer experience**     | High (fast feedback; deep validation available) |

---

## Success Criteria

✅ You've successfully implemented Phase 3 merge governance when:

1. **PR reviewers see:**
   - Green ✅ "Core CI (Canonical)" required
   - Orange ⚠️ "Full Integration Tests (Lane B)" running (but not required)

2. **You can merge when:**
   - Lane A is green
   - You have 1 approval
   - GitHub merge button is clickable

3. **Nightly validation runs:**
   - Lane B runs at 02:00 UTC every day
   - Results visible in Actions tab
   - Does not block any merges

4. **Team knows:**
   - Where to find CI status (Actions tab + PR checks)
   - What Lane A vs Lane B means
   - How to run Lane B manually for pre-merge validation

---

## Troubleshooting Branch Protection Issues

### "Merge button is disabled; Lane A is green"

**Cause:** Branch protection rule not saved properly.  
**Fix:**

1. Go to Settings → Branches → main
2. Scroll to "Require status checks to pass"
3. Verify "Core CI (Canonical) / Build, Typecheck, Lint, Test" is checked
4. Click "Save changes"

### "I accidentally disabled protection; how do I re-enable?"

**Fix:**

1. Go to Settings → Branches
2. Click **Edit** on the main branch rule
3. Check all items in this checklist
4. Click "Save changes"

### "Lane A passed but merge is still blocked"

**Cause:** Likely a stale approval or another branch protection rule.  
**Fix:**

1. Check the PR for pending comments/approvals
2. Verify the branch is up to date (click "Update branch" if needed)
3. If still blocked, ask a repo admin to review branch protection settings

---

## Next Steps

1. **Apply this checklist** to GitHub Settings → Branches → main
2. **Test it:** Create a dummy PR to `main`, verify Lane A is required
3. **Communicate to team:** Share this doc; explain the new merge flow
4. **Monitor nightly runs:** Set a calendar reminder to check Lane B results (first week)
5. **Begin Phase 3B:** Collect flaky test patterns; prioritize refactoring

---

## Reference

- **Core CI Workflow:** `.github/workflows/ci-cd.yml` (Lane A)
- **Full Integration Workflow:** `.github/workflows/ci-full-integration.yml` (Lane B)
- **CI Strategy Guide:** `docs/CI.md`
