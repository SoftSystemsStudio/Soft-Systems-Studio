# API Reference

Complete REST API documentation for Soft Systems Studio Agent API.

**Base URL:** `https://your-domain.com` or `http://localhost:5000` (development)

**Content-Type:** `application/json`

---

## Table of Contents

- [Authentication](#authentication)
- [Agents](#agents)
- [Admin](#admin)
- [Billing (Stripe)](#billing-stripe)
- [Health & Metrics](#health--metrics)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are workspace-scoped. Each token contains:

- `sub` — User ID
- `workspaceId` — Workspace ID
- `role` — User role (admin, owner, member, agent, service)
- `exp` — Expiration timestamp

---

### POST /api/v1/auth/onboarding

Create a new workspace and user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "workspaceName": "My Company"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "clxyz123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "workspace": {
    "id": "ws_abc123",
    "name": "My Company",
    "slug": "my-company"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "rt_xyz..."
}
```

**Errors:**

- `400` — Invalid payload or email already exists
- `500` — Server error

---

### POST /api/v1/auth/login

Authenticate with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "workspaceId": "ws_abc123"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "rt_xyz...",
  "expiresIn": 900,
  "user": {
    "id": "clxyz123",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

**Errors:**

- `400` — Missing required fields
- `401` — Invalid credentials
- `403` — User not a member of workspace

---

### POST /api/v1/auth/token

Refresh an expired access token.

**Request Body:**

```json
{
  "refreshToken": "rt_xyz..."
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "rt_new...",
  "expiresIn": 900
}
```

**Errors:**

- `400` — Missing refresh token
- `401` — Invalid or expired refresh token

---

## Agents

### POST /api/v1/agents/customer-service/run

Chat with the customer service agent. Uses RAG retrieval from the workspace's knowledge base.

**Authentication:** Required (roles: user, agent, admin, service, member)

**Request Body:**

```json
{
  "message": "How do I reset my password?",
  "conversationId": "conv_123" // Optional, omit to start new conversation
}
```

**Response (200):**

```json
{
  "reply": "To reset your password, go to Settings > Security > Reset Password...",
  "conversationId": "conv_123"
}
```

**Errors:**

- `400` — Invalid payload (missing message)
- `401` — Unauthorized
- `500` — Chat processing failed

---

### POST /api/v1/agents/customer-service/ingest

Ingest documents into the workspace's knowledge base. Documents are processed asynchronously via a queue worker.

**Authentication:** Required (roles: admin, owner, agent, service)

**Request Body:**

```json
{
  "documents": [
    {
      "text": "Password reset instructions: Go to Settings...",
      "title": "Password Reset Guide"
    },
    {
      "content": "Alternative content field also accepted",
      "title": "Another Document"
    }
  ]
}
```

**Validation:**

- 1-100 documents per request
- Each document max 20,000 characters
- Either `text` or `content` required

**Response (200):**

```json
{
  "ok": true,
  "enqueued": 2,
  "ingestionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

The `ingestionId` can be used to track the ingestion job. Documents are stored in PostgreSQL and indexed in Qdrant for vector search.

**Errors:**

- `400` — Invalid payload (validation failed)
- `401` — Unauthorized
- `403` — Insufficient role

---

## Admin

### POST /api/v1/admin/cleanup

Trigger data cleanup operations. Intended for cron jobs.

**Authentication:** Admin auth required via one of:

- `Authorization: Bearer <CRON_SECRET>`
- JWT with admin/owner role
- `X-API-Key: <ADMIN_API_KEY>`

**Request Body:**

```json
{
  "operation": "expired_tokens",
  "dryRun": false
}
```

**Response (200):**

```json
{
  "ok": true,
  "operation": "expired_tokens",
  "deletedCount": 42,
  "dryRun": false
}
```

**Errors:**

- `401` — Unauthorized (invalid or missing admin credentials)
- `429` — Rate limited

---

## Billing (Stripe)

### POST /api/v1/stripe/webhook

Handle Stripe webhook events. This endpoint receives events from Stripe for subscription management, payment processing, etc.

**Authentication:** Stripe signature verification via `stripe-signature` header

**Headers:**

```
stripe-signature: t=1234567890,v1=abc123...
Content-Type: application/json
```

**Supported Events:**

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

**Response (200):**

```json
{
  "received": true
}
```

**Errors:**

- `400` — Invalid signature or payload

---

## Health & Metrics

### GET /health

Basic health check endpoint.

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2025-12-04T12:00:00.000Z"
}
```

---

### GET /status

Detailed system status including database and service connectivity.

**Response (200):**

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "uptime": 3600,
  "services": {
    "database": "connected",
    "redis": "connected",
    "qdrant": "connected"
  }
}
```

---

### GET /metrics

Prometheus metrics endpoint for observability.

**Response (200):** Prometheus text format

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="POST",route="/api/v1/agents/customer-service/run",status="200"} 1234

# HELP queue_waiting_jobs Number of waiting jobs in queue
# TYPE queue_waiting_jobs gauge
queue_waiting_jobs{queue="ingest"} 5
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "error_code",
  "message": "Human-readable description",
  "code": "SPECIFIC_ERROR_CODE"
}
```

### Common Error Codes

| HTTP Status | Error Code        | Description                       |
| ----------- | ----------------- | --------------------------------- |
| 400         | `invalid_payload` | Request body validation failed    |
| 401         | `unauthorized`    | Missing or invalid authentication |
| 403         | `forbidden`       | Insufficient permissions          |
| 404         | `not_found`       | Resource not found                |
| 429         | `rate_limited`    | Too many requests                 |
| 500         | `internal_error`  | Server error                      |

### Validation Errors

For Zod validation failures, the response includes field-level details:

```json
{
  "error": "validation_failed",
  "message": "Request validation failed",
  "issues": [
    {
      "path": ["documents", 0, "text"],
      "message": "Required"
    }
  ]
}
```

---

## Rate Limiting

Rate limits are applied per IP and per tenant:

| Endpoint Pattern   | Limit       | Window   |
| ------------------ | ----------- | -------- |
| `/api/v1/auth/*`   | 10 requests | 1 minute |
| `/api/v1/agents/*` | 60 requests | 1 minute |
| `/api/v1/admin/*`  | 5 requests  | 1 minute |

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1701691200
```

When rate limited, you'll receive:

```json
{
  "error": "rate_limited",
  "message": "Too many requests, please try again later",
  "retryAfter": 30
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
const API_BASE = 'https://api.softsystems.studio';

// Login
const loginResponse = await fetch(`${API_BASE}/api/v1/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
    workspaceId: 'ws_abc123',
  }),
});
const { accessToken } = await loginResponse.json();

// Chat with agent
const chatResponse = await fetch(`${API_BASE}/api/v1/agents/customer-service/run`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    message: 'How do I reset my password?',
  }),
});
const { reply, conversationId } = await chatResponse.json();
```

### cURL

```bash
# Login
curl -X POST https://api.softsystems.studio/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","workspaceId":"ws_abc123"}'

# Chat with agent
curl -X POST https://api.softsystems.studio/api/v1/agents/customer-service/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbG..." \
  -d '{"message":"How do I reset my password?"}'

# Ingest documents
curl -X POST https://api.softsystems.studio/api/v1/agents/customer-service/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbG..." \
  -d '{"documents":[{"text":"Document content...","title":"My Doc"}]}'
```

---

## Webhooks (Outgoing)

_Coming soon:_ Webhook delivery for agent events, ingestion completion, and billing changes.
