# Multi-Session Status Dashboard

**Last Updated:** [Auto-updated by sessions]

---

## Active Sessions

### Session 1: [FOCUS]

- **Terminal:** 1
- **Status:** 🔄 Active / ⏸️ Paused / ✅ Complete
- **Branch:** feature/[name]
- **Focus:** [Backend/Frontend/Tests/etc]
- **Progress:** 0%
- **Blocked By:** None
- **Artifacts:**
  - [List files created/modified]
- **Next Steps:**
  - [What's next for this session]

### Session 2: [FOCUS]

- **Terminal:** 2
- **Status:** ⏳ Waiting / 🔄 Active / ✅ Complete
- **Branch:** feature/[name]
- **Focus:** [Backend/Frontend/Tests/etc]
- **Progress:** 0%
- **Blocked By:** Session 1 (waiting for API contract)
- **Needs:**
  - [What this session is waiting for]

### Session 3: [FOCUS]

- **Terminal:** 3
- **Status:** ⏳ Pending / 🔄 Active / ✅ Complete
- **Branch:** feature/[name]
- **Focus:** [Backend/Frontend/Tests/etc]
- **Progress:** 0%
- **Blocked By:** Sessions 1 & 2
- **Needs:**
  - [What this session is waiting for]

---

## Dependency Graph

```
Session 3
    ↑
    │
┌───┴───┐
│       │
Session 1  Session 2
```

---

## Handoff Status

- [ ] Session 1 → Session 2: API contract
  - **File:** `.claude/contracts/[feature]-api.json`
  - **Status:** Pending

- [ ] Session 2 → Session 3: Implementation complete
  - **File:** `.claude/handoff/frontend-ready.md`
  - **Status:** Pending

---

## Merge Order

1. ✅ / ⏳ Session 1: [branch] → main
2. ⏳ Session 2: [branch] → main (after Session 1)
3. ⏳ Session 3: [branch] → main (after Sessions 1 & 2)

---

## Notes

- [Any coordination notes or decisions]
- [Blockers or issues]
- [Next orchestration steps]

---

## Quick Commands

```bash
# Update status
echo "Session 1: 50% complete" > .claude/status/session-1.txt

# Check handoffs
ls .claude/handoff/

# View contracts
cat .claude/contracts/*.json

# Monitor branches
git branch -a | grep feature
```

---

**Instructions:**

1. Each session updates its own section when making progress
2. Mark blockers clearly
3. Update handoff checklist when artifacts are ready
4. Orchestrator (you) coordinates based on this dashboard
