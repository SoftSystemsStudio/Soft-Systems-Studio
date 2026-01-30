---
name: test-suite
description: Use when writing tests for the codebase. Covers Jest/Vitest patterns, mock setup, integration test harnesses, and test organization following project conventions.
---

# Test Suite Skill

## Test Framework

- **Jest** for `apps/` and most `packages/`
- **Vitest** for select packages
- **supertest** for HTTP integration tests

## Test File Organization

| Type              | Location                   | Naming      |
| ----------------- | -------------------------- | ----------- |
| Unit tests        | Co-located in `__tests__/` | `*.test.ts` |
| Integration tests | `tests/integration/`       | `*.test.ts` |

## Critical: Mock Setup Order

**Mock BEFORE importing the module being tested:**

```typescript
// 1. Mocks first
jest.mock('../../src/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
  },
}));

jest.mock('../../src/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('../../src/env', () => ({
  getEnv: () => ({
    DATABASE_URL: 'postgresql://test',
    REDIS_URL: 'redis://localhost',
  }),
}));

// 2. Then import the module
import { myService } from '../../src/services/myService';
```

## Unit Test Pattern

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mocks first
jest.mock('../../src/db');

// Then imports
import { userService } from '../../src/services/user';
import { prisma } from '../../src/db';

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
```

## Integration Test Pattern

Use the harness pattern from `tests/integration/fixtures/`:

```typescript
import request from 'supertest';
import { createTestApp, createTestUser, getTestToken } from '../fixtures/testHarness';

describe('POST /api/v1/agents', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const user = await createTestUser();
    authToken = getTestToken(user);
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('should create agent with valid input', async () => {
    const response = await request(app)
      .post('/api/v1/agents')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Agent',
        description: 'A test agent',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: 'Test Agent',
      description: 'A test agent',
    });
  });

  it('should return 401 without auth', async () => {
    const response = await request(app).post('/api/v1/agents').send({ name: 'Test' });

    expect(response.status).toBe(401);
  });

  it('should return 400 with invalid input', async () => {
    const response = await request(app)
      .post('/api/v1/agents')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '' }); // Invalid: empty name

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
```

## Mocking Middleware

```typescript
jest.mock('../../src/middleware/auth-combined', () => ({
  requireAuth: (req, res, next) => {
    req.auth = { userId: 'test-user', workspaceId: 'test-workspace' };
    next();
  },
}));
```

## Test Requirements

Tests are **required** for:

- New API endpoints (integration tests)
- Business logic functions (unit tests)
- Middleware (unit tests)
- Bug fixes (regression tests)

## Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:ci

# Run specific test file
pnpm test -- path/to/test.test.ts

# Run tests in watch mode
pnpm test -- --watch
```

## Best Practices

1. **Test behavior, not implementation** - Focus on inputs/outputs
2. **One assertion concept per test** - Keep tests focused
3. **Use descriptive test names** - `should return 404 when user not found`
4. **Clean up after tests** - Use `afterEach`/`afterAll` hooks
5. **Avoid test interdependence** - Each test should be isolated

## Related Files

- Test harness: `/apps/agent-api/tests/integration/fixtures/`
- Jest config: `/apps/agent-api/jest.config.js`
- Example tests: `/apps/agent-api/tests/integration/chat-route.test.ts`
