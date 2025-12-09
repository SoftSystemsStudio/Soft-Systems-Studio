# Agent API — Architecture & Security Review

Date: 2025-12-09

## Section 1 — Executive Summary

- **[Security]** Customer-service `/run` endpoint accepts untyped payloads with no schema validation or input sanitization, making the API vulnerable to malformed/hostile input and inconsistent behavior across tenants.

- **[Reliability/Resiliency]** Core chat handling in `index.ts` directly invokes the external `handleChat` implementation without timeouts, circuit-breaking, or retry/backoff, so upstream LLM or network stalls can hang requests and degrade availability under load.

- **[Observability/Operations]** API composition, auth, worker lifecycle, and queue metrics are all wired directly in `index.ts` with limited per-route instrumentation; lack of correlation IDs/structured fields across middlewares makes production incident triage harder.

- **[Architecture/Maintainability]** Express entrypoint mixes HTTP concerns, queue setup, and chat persistence logic in a single module, creating tight coupling that complicates testing, scaling server roles independently, and enforcing consistent middleware (e.g., rate limits) per route.

- **[Access Control]** Critical chat endpoints lack consistent rate limiting and abuse protections despite existing middleware implementations, exposing the service to brute-force/resource-exhaustion risks.

## Section 2 — Architecture & Design Review

### Architecture Findings

#### Boundaries & layering

- `apps/agent-api/src/index.ts`: Entry file intermixes route wiring, security headers, queue lifecycle, and chat persistence, violating separation of concerns and making it hard to deploy API vs worker roles independently; risk: hinders testability and scaling different roles.

- `apps/agent-api/src/api/v1/agents/customer_service.ts`: Endpoint-specific logic contains business workflow (queue enqueue, chat execution) instead of delegating to services, limiting reuse and mocking; risk: hard to evolve domain logic without touching routing layer.

#### Coupling & cohesion

- `apps/agent-api/src/index.ts`: Direct `require('@softsystems/agent-customer-service')` call couples API surface to a specific package without abstraction or failure isolation; risk: difficult to swap providers or inject mocks, and failure propagates to request threads.

- `apps/agent-api/src/index.ts`: Logging and persistence are embedded inside route handler rather than encapsulated in a service function; risk: duplicated patterns and harder to enforce cross-cutting behaviors (timeouts, audit fields).

#### Cross-cutting concerns

- `apps/agent-api/src/api/v1/agents/customer_service.ts`: `/run` route bypasses validation middleware (`validateBody`) unlike `/ingest`, leading to unvalidated input and inconsistent error handling; risk: invalid data persisted or unexpected failures.

- `apps/agent-api/src/index.ts`: No rate limiting, request-level timeouts, or correlation IDs added at middleware layer, despite error handler expecting request IDs; risk: abuse susceptibility and low observability for incident response.

### Design Refactor Proposals

#### Modularize API composition vs domain services

**Target:** Move chat persistence and external LLM invocation into `services/chat` with clear interfaces; keep `index.ts` focused on middleware and route registration.

**Steps:**

1. Create `apps/agent-api/src/routes/chat.ts` to host chat routes only.
2. Extract persistence + reply logic from `index.ts` into `services/chatController.ts` that calls `handleChat` and `persistChatExchange`.
3. Update `index.ts` to import and mount `chatRouter`; remove inline handler.
4. Add unit tests for `chatController` to verify error paths and workspace scoping.

#### Introduce validation + rate limiting middleware consistently

**Target:** All mutating/read-heavy endpoints use schema validation and rate limiting.

**Steps:**

1. Add a schema (e.g., Zod) for `/run` payload in `schemas/chat.ts`.
2. Wrap `/run` handler with `validateBody` and `rateLimit` middleware.
3. Ensure shared rate middleware is configurable per route via options.
4. Add integration tests covering invalid payloads and rate-limit responses.

#### Isolate external AI provider calls with resiliency

**Target:** Encapsulate `handleChat` behind a provider with timeouts, retries, and circuit-breaking.

**Steps:**

1. Create `services/llmProvider.ts` that wraps `handleChat` with configurable timeout and retries.
2. Replace direct `handleChat` usage in chat controller with provider call.
3. Add metrics/logging for provider latency and error rates.
4. Write unit tests simulating slow/failing provider responses.

#### Standardize observability

**Target:** Uniform request IDs, structured logging, and error envelopes.

**Steps:**

1. Add middleware to generate/propagate a `requestId` and attach to `req`.
2. Ensure logger includes `requestId`, `workspaceId`, and `userId` fields in all logs.
3. Update `errorHandler` to always include a stable code and optional `requestId` in responses.
4. Add tests asserting error responses include code and omit stack traces in production mode.

## Section 8 — Initial Prioritized Action Plan (Draft)

1. Add schema validation and rate limiting to `/run` chat endpoint

- Severity: High | Area: Security/Reliability

What: Validate and throttle chat requests to prevent malformed input and abuse.

How:

- Define a Zod schema for chat run payload in `schemas/chat.ts`.
- Apply `validateBody` and `rate` middleware to `/run` in `api/v1/agents/customer_service.ts`.
- Return structured 400 errors on invalid input; add tests for invalid payloads and rate hits.

2. Refactor chat route to dedicated router and service layer

- Severity: High | Area: Architecture/Maintainability

What: Remove monolithic handler from `index.ts`; isolate business logic.

How:

- Move chat route into `routes/chat.ts`; import in `index.ts`.
- Create `services/chatController.ts` handling `handleChat` invocation and persistence.
- Update tests to cover controller success/failure paths.

3. Add resiliency around external LLM provider calls

- Severity: High | Area: Reliability

What: Prevent stalled or failing AI calls from hanging requests.

How:

- Wrap `handleChat` in a provider with configurable timeout and limited retries.
- Surface circuit-breaker state via metrics/logs.
- Add tests simulating slow responses to ensure timeouts return `504/500` gracefully.

4. Standardize request correlation and error envelope

- Severity: Medium | Area: Observability

What: Ensure every log and error response includes request/workspace/user context.

How:

- Add `requestId` middleware and propagate to logger context.
- Update `errorHandler` to include `requestId` in responses while keeping stack traces only in non-prod.
- Add middleware tests verifying headers and response bodies carry the IDs.

5. Enforce consistent middleware ordering and configuration

- Severity: Medium | Area: Operations

What: Codify middleware stack to avoid regressions when adding new routes.

How:

- Create a middleware registry/config map for security (`helmet`), logging, auth, rate limits, and parsers.
- Apply the registry in `index.ts` to reduce per-route duplication.
- Document required middleware per route type and add a smoke test ensuring protected routes reject unauthenticated requests.

6. Document operational modes and server roles

- Severity: Low | Area: DX/Deployment

What: Clarify how `SERVER_ROLE` influences queue metrics/startup.

How:

- Expand README or `/docs` to specify API vs worker vs all mode expectations.
- Add a startup log line summarizing enabled subsystems (queues, metrics, Sentry).

---

This document captures the security, reliability, observability, and architecture findings and proposes an initial set of prioritized changes. If you want, I can:

- Implement the schema + validation + rate-limit changes for `/run` as a next step (I recommend Zod + centralized rate middleware).
- Create `services/chatController.ts` and refactor the existing handler into it, with unit tests.
- Implement `services/llmProvider.ts` with timeouts and retries and add tests simulating slow responses.

Tell me which action you want me to take next and I'll create a focused TODO plan and start implementing it.
