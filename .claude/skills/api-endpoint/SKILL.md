---
name: api-endpoint
description: Use when creating new Express API endpoints in apps/agent-api. Ensures endpoints follow project patterns for authentication, validation, rate limiting, error handling, and logging.
---

# API Endpoint Skill

## Endpoint Location

Create endpoints in `/apps/agent-api/src/api/v1/` following existing structure.

## Required Middleware Stack

Apply middleware in this order:

```typescript
import { asyncHandler } from '../../middleware/errorHandler';
import { requireAuth, requireApiKey } from '../../middleware/auth-combined';
import { validateBody } from '../../middleware/validation';
import { rateLimitChat } from '../../middleware/rateLimitChat';
```

### Authentication Options

```typescript
// For user authentication (JWT)
router.post('/endpoint', requireAuth, asyncHandler(handler));

// For API key authentication
router.post('/endpoint', requireApiKey, asyncHandler(handler));

// For tenant-isolated routes
router.post('/endpoint', requireAuth, tenantMiddleware, asyncHandler(handler));
```

## Request Validation

Create Zod schemas in `/apps/agent-api/src/schemas/`:

```typescript
// schemas/myEndpoint.ts
import { z } from 'zod';

export const myEndpointSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

export type MyEndpointInput = z.infer<typeof myEndpointSchema>;
```

Use in route:

```typescript
router.post('/endpoint', requireAuth, validateBody(myEndpointSchema), asyncHandler(handler));
```

## Handler Pattern

```typescript
import { Request, Response } from 'express';
import { logger } from '../../logger';

export const myHandler = async (req: Request, res: Response) => {
  const { userId, workspaceId } = req.auth; // From auth middleware

  logger.info(
    {
      requestId: req.requestId,
      userId,
      workspaceId,
      action: 'my_action',
    },
    'Processing request',
  );

  try {
    // Business logic here
    const result = await myService.doSomething(req.body);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      {
        requestId: req.requestId,
        userId,
        error,
      },
      'Request failed',
    );
    throw error; // Let error middleware handle it
  }
};
```

## HTTP Status Codes

| Code | Use Case                     |
| ---- | ---------------------------- |
| 200  | Success (GET, PUT, PATCH)    |
| 201  | Resource created (POST)      |
| 204  | Success, no content (DELETE) |
| 400  | Validation error             |
| 401  | Authentication required      |
| 403  | Permission denied            |
| 404  | Resource not found           |
| 429  | Rate limited                 |
| 500  | Server error                 |

## Logging

Use pino logger with structured context:

```typescript
import { logger } from '../../logger';

// Good - structured logging
logger.info({ userId, workspaceId, requestId, agentId }, 'Agent created');

// Bad - string interpolation
logger.info(`User ${userId} created agent ${agentId}`); // Don't do this
```

**Required context fields:**

- `requestId` - From request
- `userId` - From auth
- `workspaceId` - From auth/tenant

## Integration Tests

Create tests in `tests/integration/`:

```typescript
import request from 'supertest';
import { createTestApp } from '../fixtures/testHarness';

describe('POST /api/v1/myendpoint', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createTestApp();
  });

  it('should create resource', async () => {
    const response = await request(app)
      .post('/api/v1/myendpoint')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Test' });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Test');
  });
});
```

## Related Files

- Routes: `/apps/agent-api/src/api/v1/`
- Middleware: `/apps/agent-api/src/middleware/`
- Schemas: `/apps/agent-api/src/schemas/`
- Logger: `/apps/agent-api/src/logger.ts`
- Tests: `/apps/agent-api/tests/integration/`
