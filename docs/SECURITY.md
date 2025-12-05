# Security Model

Comprehensive security documentation for Soft Systems Studio.

---

## Table of Contents

- [Authentication](#authentication)
- [Authorization](#authorization)
- [Data Isolation](#data-isolation)
- [API Security](#api-security)
- [Infrastructure Security](#infrastructure-security)
- [Secrets Management](#secrets-management)
- [Audit Logging](#audit-logging)
- [Security Checklist](#security-checklist)

---

## Authentication

### JWT-Based Authentication

The API uses JSON Web Tokens (JWT) for stateless authentication:

```
┌─────────┐    login     ┌─────────┐    verify    ┌─────────┐
│  Client │ ──────────▶  │   API   │ ◀──────────▶ │  Redis  │
│         │ ◀──────────  │         │              │ (tokens)│
└─────────┘  JWT + RT    └─────────┘              └─────────┘
```

**Token Structure:**

```json
{
  "sub": "user_123", // User ID
  "workspaceId": "ws_abc", // Workspace scope
  "role": "admin", // User role
  "iat": 1701691200, // Issued at
  "exp": 1701692100 // Expires (15 min)
}
```

**Token Lifetimes:**

- Access Token: 15 minutes
- Refresh Token: 7 days

### Refresh Token Rotation

Refresh tokens are single-use and rotate on each refresh:

1. Client sends refresh token
2. Server validates and invalidates old token
3. Server issues new access + refresh token pair
4. Old refresh token is revoked (cannot be reused)

This prevents token replay attacks if a refresh token is compromised.

### Password Security

- Passwords hashed with bcrypt (cost factor 10)
- Minimum 8 characters enforced
- Never logged or exposed in responses

---

## Authorization

### Role-Based Access Control (RBAC)

Users are assigned roles within each workspace:

| Role      | Description     | Permissions                            |
| --------- | --------------- | -------------------------------------- |
| `owner`   | Workspace owner | Full access, billing, delete workspace |
| `admin`   | Administrator   | Manage users, settings, all operations |
| `member`  | Regular member  | Chat, view documents                   |
| `agent`   | Service agent   | Ingest, chat, API access               |
| `service` | Service account | API access only                        |
| `user`    | End user        | Chat only                              |

### Middleware Stack

Protected routes use layered middleware:

```typescript
router.post(
  '/ingest',
  requireAuth, // 1. Validate JWT
  requireWorkspace, // 2. Extract & validate workspaceId
  requireRole('admin', 'owner', 'agent'), // 3. Check role
  validateBody(schema), // 4. Validate request body
  asyncHandler(handler), // 5. Handle with error boundary
);
```

### Admin Authentication

Admin endpoints support multiple authentication strategies:

1. **CRON_SECRET** — For automated cron jobs (Vercel Cron, etc.)
2. **Admin JWT** — For manual admin actions with admin/owner role
3. **API Key** — For service-to-service admin calls (`ADMIN_API_KEY`)

All strategies use timing-safe comparison to prevent timing attacks.

---

## Data Isolation

### Workspace Isolation

All data is scoped to workspaces with strict isolation:

```sql
-- Every query includes workspace filter
SELECT * FROM "KbDocument"
WHERE "workspaceId" = $1  -- Always filtered
AND "deletedAt" IS NULL;
```

**Isolation Points:**

- Database queries always filter by `workspaceId`
- Vector search (Qdrant) filtered by workspace metadata
- JWT tokens scoped to single workspace
- API responses never expose cross-workspace data

### Vector Database Isolation

Qdrant queries include workspace filtering:

```typescript
await qdrantClient.search(collection, {
  vector: embedding,
  filter: {
    must: [{ key: 'workspaceId', match: { value: workspaceId } }],
  },
});
```

---

## API Security

### Input Validation

All endpoints use Zod schemas for strict validation:

```typescript
const ingestRequestSchema = z.object({
  documents: z
    .array(
      z
        .object({
          text: z.string().max(20000).optional(),
          content: z.string().max(20000).optional(),
          title: z.string().max(500).optional(),
        })
        .refine((doc) => doc.text || doc.content, {
          message: 'Either text or content is required',
        }),
    )
    .min(1)
    .max(100),
});
```

### Rate Limiting

Multi-layer rate limiting protects against abuse:

| Layer           | Limit    | Scope      |
| --------------- | -------- | ---------- |
| Global          | 1000/min | IP address |
| Auth endpoints  | 10/min   | IP address |
| Agent endpoints | 60/min   | Tenant     |
| Admin endpoints | 5/min    | IP + Auth  |

Implementation uses Redis for distributed rate limiting:

```typescript
const limiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.auth?.workspaceId || req.ip,
});
```

### Error Handling

Errors are sanitized to prevent information leakage:

```typescript
// Bad: Exposes internal details
res.status(500).json({ error: error.stack });

// Good: Generic message, details logged server-side
logger.error({ error, workspaceId }, 'Operation failed');
res.status(500).json({
  error: 'internal_error',
  message: 'An unexpected error occurred',
});
```

---

## Infrastructure Security

### Environment Validation

Startup validation ensures required secrets are present:

```typescript
const envSchema = z.object({
  JWT_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),
  // ... comprehensive validation
});

// App fails fast if env is invalid
const env = envSchema.parse(process.env);
```

### Graceful Shutdown

Clean shutdown prevents data corruption:

```typescript
export function registerQueueShutdownHandlers(): void {
  process.on('SIGTERM', async () => {
    await gracefulShutdown();
    process.exit(0);
  });
}
```

### HTTPS/TLS

- All production traffic over HTTPS
- TLS 1.2+ required
- HSTS headers enabled on frontend

---

## Secrets Management

### Environment Variables

| Secret                  | Usage               | Minimum Requirements   |
| ----------------------- | ------------------- | ---------------------- |
| `JWT_SECRET`            | Token signing       | 32+ characters, random |
| `CRON_SECRET`           | Cron authentication | 32+ characters         |
| `ADMIN_API_KEY`         | Admin API access    | 32+ characters         |
| `STRIPE_WEBHOOK_SECRET` | Stripe verification | From Stripe dashboard  |

### Best Practices

1. **Never commit secrets** — `.env` files are gitignored
2. **Use secret managers** — AWS Secrets Manager, Vault, or platform env vars
3. **Rotate regularly** — Rotate secrets quarterly or after incidents
4. **Least privilege** — OAuth tokens scoped to minimum required permissions
5. **Audit access** — Log all secret usage

### Pre-Commit Hooks

Husky hooks prevent accidental secret commits:

```bash
# .husky/pre-commit
pnpm check-env-committed    # Fails if .env tracked
pnpm scan-placeholders      # Scans for secret patterns
```

---

## Audit Logging

### Admin Action Logging

All admin operations are logged:

```typescript
function auditLog(
  req: AdminRequest,
  action: string,
  source: AdminAuthSource,
  details?: Record<string, unknown>,
): void {
  logger.info(
    {
      action,
      source, // 'cron_secret', 'jwt_admin', 'api_key_admin'
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.adminAuth?.userId,
      path: req.path,
      method: req.method,
      ...details,
    },
    `Admin action: ${action}`,
  );
}
```

### What's Logged

| Event         | Data Captured                          |
| ------------- | -------------------------------------- |
| Auth success  | IP, user agent, auth method, user ID   |
| Auth failure  | IP, user agent, failure reason         |
| Admin actions | All above + operation details          |
| API errors    | Request path, error type, workspace ID |

### Log Storage

Production logs should be:

- Shipped to centralized logging (CloudWatch, Datadog, etc.)
- Retained for compliance period (90+ days)
- Searchable for incident response

---

## Security Checklist

### Before Production

- [ ] All secrets rotated from development values
- [ ] `JWT_SECRET` is 32+ random characters
- [ ] `NODE_ENV=production` set
- [ ] HTTPS enforced (no HTTP fallback)
- [ ] Rate limiting configured
- [ ] Sentry DSN configured for error tracking
- [ ] Database credentials not in code
- [ ] Pre-commit hooks enabled

### Ongoing

- [ ] Review audit logs weekly
- [ ] Rotate secrets quarterly
- [ ] Update dependencies monthly
- [ ] Security scan on PRs (Dependabot/Snyk)
- [ ] Penetration testing annually

### Incident Response

1. **Detect** — Monitor error rates, audit logs, alerts
2. **Contain** — Rotate compromised secrets immediately
3. **Investigate** — Review audit logs for scope
4. **Remediate** — Patch vulnerability, update affected systems
5. **Document** — Post-mortem for future prevention

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Email security@softsystems.studio with details
3. Include steps to reproduce
4. Allow 90 days for fix before disclosure

We appreciate responsible disclosure and will acknowledge contributors.
