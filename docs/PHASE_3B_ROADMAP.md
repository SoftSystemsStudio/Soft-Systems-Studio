# Phase 3B: Heavy Test Refactoring Roadmap

## Status: ✅ Step 1 Complete - Router Harness Pattern Validated

### Completed in This Session

- ✅ Created [apps/agent-api/tests/integration/fixtures/chatRouterHarness.ts](apps/agent-api/tests/integration/fixtures/chatRouterHarness.ts)
- ✅ Refactored [apps/agent-api/tests/integration/chat-route.test.ts](apps/agent-api/tests/integration/chat-route.test.ts) to use harness
- ✅ **5 tests passing in <1s without CI_STABLE, no env vars needed**
- ✅ Harness demonstrates: JSON parsing, auth context, error handling, no bootstrap

### Next: Refactor Real middleware to avoid env bootstrap requirement

---

## Current State (Phase 3A)

| Suite              | File                                           | Status            | Runtime | Why Heavy                           | Pass Rate |
| ------------------ | ---------------------------------------------- | ----------------- | ------- | ----------------------------------- | --------- |
| Chat Route         | `tests/integration/chat-route.test.ts`         | Gated (CI_STABLE) | ~5s     | Full app boot + middleware          | ~80%      |
| Bootstrap Layering | `tests/integration/bootstrap-layering.test.ts` | Gated (CI_STABLE) | ~10s    | File parsing + runtime route checks | ~90%      |
| Request Context    | `tests/integration/request-context.test.ts`    | Gated (CI_STABLE) | ~5s     | Full Express app + middleware chain | ~70%      |

**Combined:** ~20s runtime + 3 external service dependencies (Postgres, Redis, Qdrant)

---

## Refactoring Strategy (Highest ROI First)

### Priority 1: chat-route.test.ts (Highest ROI)

#### Current Problem

- Imports full `app` from `src/index.ts` at module level
- Triggers env validation (requires OPENAI_API_KEY, JWT_SECRET, etc.)
- Full Express middleware chain instantiation
- All route handlers mounted

#### Cost

- Runtime: ~5s
- Infra deps: app bootstrap (minimal but slow)

#### Refactoring Plan

**Step 1: Create a Router-Level Test Harness**

Instead of importing the full app, create a minimal test-only route harness:

```typescript
// tests/integration/fixtures/chatRouterHarness.ts
import express, { Express } from 'express';
import chatRouter from '../../../src/api/v1/agents/customer-service/router';

export function createChatTestApp(): Express {
  const app = express();

  // Only mount what we need: auth middleware + chat router
  app.use((req, _res, next) => {
    // Mock auth context without full JWT validation
    (req as any).auth = { userId: 'test-user', workspaceId: 'test-ws' };
    next();
  });

  app.use('/api/v1/agents/customer-service', chatRouter);

  return app;
}
```

**Step 2: Update Test File**

```typescript
// tests/integration/chat-route.test.ts (refactored)
import request from 'supertest';
import { createChatTestApp } from './fixtures/chatRouterHarness';
import * as chatService from '../../src/services/chat';

jest.mock('../../src/services/chat');

const describeSkipIfNotStable = process.env.CI_STABLE ? describe : describe.skip;

describeSkipIfNotStable('POST /api/v1/agents/customer-service/chat', () => {
  let app: Express;

  beforeAll(() => {
    // No env validation! Direct router mount.
    app = createChatTestApp();
  });

  it('should process chat message', async () => {
    (chatService.runChat as jest.Mock).mockResolvedValue({
      reply: 'Hello!',
      conversationId: 'conv-123',
    });

    const res = await request(app)
      .post('/api/v1/agents/customer-service/chat')
      .send({ message: 'Hi' })
      .expect(200);

    expect(res.body.reply).toBe('Hello!');
  });
});
```

**Result:**

- ✅ No env validation errors
- ✅ Isolated to the route under test
- ✅ Can run in Lane A without CI_STABLE
- ✅ Runtime: ~1–2s (was ~5s)

#### Acceptance Criteria

- [ ] Test harness created and used
- [ ] No app-level imports in test file
- [ ] Test passes without CI_STABLE flag
- [ ] Runtime <2s
- [ ] Move from Lane B to Lane A

---

### Priority 2: bootstrap-layering.test.ts (Medium ROI)

#### Current Problem

- Performs file-based static analysis (fast)
- Performs runtime route checks (requires app import, triggers env validation)
- All checks bundled into one describe block

#### Cost

- Runtime: ~10s (mixed fast + slow)
- Infra deps: app bootstrap for runtime checks

#### Refactoring Plan

**Step 1: Split into Two Suites**

```typescript
// tests/integration/bootstrap-layering.test.ts (refactored)

// ✅ FAST: Static file analysis (no app import, no env validation)
describe('Bootstrap Layer - Static Analysis', () => {
  let bootstrapContent: string;

  beforeAll(() => {
    bootstrapContent = fs.readFileSync(BOOTSTRAP_PATH, 'utf8');
  });

  test('should not contain direct route handlers', () => {
    const pattern = /^\s*app\.(get|post|put|delete|patch)\s*\(/gm;
    expect(bootstrapContent.match(pattern)).toBeNull();
  });

  // ... other static checks
});

// ⚠️ HEAVY: Runtime route verification (only runs with CI_STABLE)
const describeSkipIfNotStable = process.env.CI_STABLE ? describe : describe.skip;

describeSkipIfNotStable('Bootstrap Layer - Runtime Route Verification', () => {
  let app: Express;

  beforeAll(() => {
    app = require('../../src/index').default;
  });

  test('should have all expected routes mounted', async () => {
    // Use supertest to check route availability
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
  });

  // ... other runtime checks
});
```

**Result:**

- ✅ Static analysis runs in Lane A (no deps)
- ✅ Runtime checks stay in Lane B (gated)
- ✅ Combined runtime: ~1s (static) + ~5s (runtime in Lane B)
- ✅ Better failure diagnostics (know which part failed)

#### Acceptance Criteria

- [ ] Static analysis suite created and runs in Lane A
- [ ] Runtime suite remains in Lane B with CI_STABLE guard
- [ ] Static suite runtime <1s
- [ ] Both suites pass independently
- [ ] Clear separation of concerns

---

### Priority 3: request-context.test.ts (Lowest ROI, But Important)

#### Current Problem

- Tests middleware chain behavior
- Requires full Express app instantiation
- All middleware must be mounted correctly
- Currently slow due to test harness setup

#### Cost

- Runtime: ~5s
- Infra deps: full app bootstrap

#### Refactoring Plan

**Step 1: Create Middleware Test Harness**

```typescript
// tests/integration/fixtures/middlewareHarness.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import { requestContext } from '../../../src/middleware/requestContext';
import { errorHandler } from '../../../src/middleware/errorHandler';

export function createMiddlewareTestApp(): Express {
  const app = express();

  // Mount only middleware under test
  app.use(requestContext);

  // Test route that uses context
  app.get('/test', (req: Request, res: Response) => {
    res.json({ success: true });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}
```

**Step 2: Refactor Test**

```typescript
// tests/integration/request-context.test.ts (refactored)
import request from 'supertest';
import { createMiddlewareTestApp } from './fixtures/middlewareHarness';

describe('Request Context Middleware', () => {
  let app: Express;

  beforeAll(() => {
    app = createMiddlewareTestApp();
  });

  it('should add request ID to context', async () => {
    const res = await request(app).get('/test');
    expect(res.body.success).toBe(true);
    // Verify request ID was set via mock
  });
});
```

**Result:**

- ✅ Isolated to middleware under test
- ✅ No full app dependency
- ✅ Can eventually move to Lane A
- ✅ Runtime: ~2s (was ~5s)

#### Acceptance Criteria

- [ ] Middleware harness created
- [ ] Tests use harness instead of full app
- [ ] No env validation during test setup
- [ ] Runtime <2s
- [ ] All middleware tests pass
- [ ] Plan for moving to Lane A (future)

---

## Implementation Schedule

| Phase            | Tests                       | Timeline | Outcome                                                     |
| ---------------- | --------------------------- | -------- | ----------------------------------------------------------- |
| **3A (Current)** | All 3 gated (CI_STABLE)     | Now      | Fast Lane A; Lane B optional                                |
| **3B.1**         | chat-route → Lane A harness | Week 1–2 | +1 test in Lane A                                           |
| **3B.2**         | bootstrap-layering split    | Week 2–3 | +1 suite in Lane A; better diagnostics                      |
| **3B.3**         | request-context → Lane A    | Week 3–4 | All 3 suites back in Lane A (refactored)                    |
| **3C**           | Measure + iterate           | Week 4+  | Monitor Lane B for flakiness; refactor more tests as needed |

---

## Testing the Refactored Tests

### During Development (Locally)

```bash
# Test individual suite (without CI_STABLE)
pnpm test -- tests/integration/chat-route.test.ts --runInBand

# Should pass even without Postgres/Redis
# Expected: "X tests passed in Ys"
```

### Before Moving to Lane A

```bash
# Run Lane A + this test suite
pnpm -w -r build
pnpm lint
pnpm -w exec tsc --noEmit
pnpm test -- tests/integration/chat-route.test.ts --runInBand

# All should pass in <5s total
```

### Lane B Validation (Still Runs)

```bash
# Set CI_STABLE and run full suite
CI_STABLE=true pnpm test --runInBand

# Should include newly refactored tests + any remaining heavy tests
```

---

## Metrics to Track

### Per-Test Metrics

| Test                         | Metric    | Target | Current   |
| ---------------------------- | --------- | ------ | --------- |
| chat-route                   | Runtime   | <2s    | ~5s       |
| chat-route                   | Pass rate | >95%   | ~80%      |
| chat-route                   | Env deps  | 0      | 3         |
| bootstrap-layering (static)  | Runtime   | <1s    | N/A (new) |
| bootstrap-layering (runtime) | Runtime   | <5s    | ~10s      |
| request-context              | Runtime   | <2s    | ~5s       |

### Lane Impact Metrics

| Metric            | Current (Phase 3A)    | Target (Phase 3B end)            |
| ----------------- | --------------------- | -------------------------------- |
| Lane A runtime    | ~3–5s                 | ~5–8s (slightly larger)          |
| Lane A test count | 60 passing, 6 skipped | 70+ passing, 0 skipped           |
| Lane B runtime    | ~20s (3 heavy tests)  | ~10s (1–2 remaining heavy tests) |

---

## Risk Mitigation

### Risk 1: Refactored Tests Become Fragile

**Mitigation:**

- Use the harness consistently across all tests
- Don't import full app in test files
- Mock external services explicitly

### Risk 2: Moving Tests to Lane A Increases Lane A Runtime Too Much

**Mitigation:**

- Target <2s per refactored test
- Keep harnesses lightweight
- Use lazy loading for middleware/routes

### Risk 3: Lane B Fails After Refactoring

**Mitigation:**

- Always keep a version of the full test in Lane B
- Verify both harness + full test pass before removing full version
- Run nightly Lane B for ~1 month after each refactor

---

## Success Criteria

✅ Phase 3B is complete when:

1. **chat-route.test.ts**
   - [ ] Runs in Lane A without CI_STABLE
   - [ ] Runtime <2s
   - [ ] Pass rate >95%
   - [ ] All existing test cases covered

2. **bootstrap-layering.test.ts**
   - [ ] Static suite in Lane A
   - [ ] Runtime checks in Lane B
   - [ ] Combined runtime <6s
   - [ ] Both suites independently verifiable

3. **request-context.test.ts**
   - [ ] Runs without full app import
   - [ ] Runtime <2s
   - [ ] Lane A ready (but not urgent; can stay in Lane B longer)

4. **Documentation**
   - [ ] Harness patterns documented in CONTRIBUTING.md
   - [ ] Team knows how to write new integration tests using harnesses
   - [ ] Future tests avoid full app imports by default

---

## Next Actions

1. **Choose one test:** Start with chat-route (highest ROI)
2. **Create harness:** Minimal router + test-only middleware
3. **Refactor tests:** Use harness instead of full app import
4. **Verify locally:** Run without CI_STABLE; should pass
5. **Test in Lane B:** Ensure full suite still passes with CI_STABLE=true
6. **Move to Lane A:** Update ci-cd.yml or note in CI.md as now-passing
7. **Repeat:** Do bootstrap-layering next, then request-context

---

## Reference

- **CI Strategy:** `docs/CI.md`
- **Branch Protection:** `docs/BRANCH_PROTECTION.md`
- **Full Integration Workflow:** `.github/workflows/ci-full-integration.yml`
