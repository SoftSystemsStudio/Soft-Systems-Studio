# Architecture Overview

Deep dive into the Soft Systems Studio system architecture.

---

## Table of Contents

- [System Overview](#system-overview)
- [Package Architecture](#package-architecture)
- [Data Flow](#data-flow)
- [Service Layer](#service-layer)
- [Authentication Flow](#authentication-flow)
- [Agent Architecture](#agent-architecture)
- [Queue System](#queue-system)
- [Database Schema](#database-schema)
- [External Integrations](#external-integrations)

---

## System Overview

Soft Systems Studio is a multi-tenant AI agent platform built as a TypeScript monorepo. The architecture follows a layered approach with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                             │
├─────────────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)          │  REST API (Express)                      │
│  • Marketing pages           │  • /api/v1/auth/*                        │
│  • Dashboard UI              │  • /api/v1/agents/*                      │
│  • Admin console             │  • /api/v1/admin/*                       │
│  • Intake forms              │  • /api/v1/stripe/*                      │
└─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           MIDDLEWARE LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│  • requireAuth        → JWT validation, token refresh                   │
│  • requireWorkspace   → Tenant isolation, workspace scoping             │
│  • requireRole        → RBAC enforcement                                │
│  • validateBody       → Zod schema validation                           │
│  • rateLimit          → Per-tenant/IP rate limiting                     │
│  • adminAuth          → Multi-strategy admin authentication             │
└─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  chat.ts       │  ingest.ts     │  token.ts      │  qdrant.ts          │
│  • RAG flow    │  • Doc prep    │  • JWT mgmt    │  • Vector ops       │
│  • LLM calls   │  • Embedding   │  • Refresh     │  • Similarity       │
│  • Memory      │  • Persistence │  • Rotation    │  • Upsert           │
└─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             DATA LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Prisma)  │  Redis (BullMQ)    │  Qdrant (Vectors)         │
│  • Users              │  • Job queues      │  • Document embeddings    │
│  • Workspaces         │  • Rate limits     │  • Similarity search      │
│  • Conversations      │  • Session cache   │  • Workspace isolation    │
│  • KB Documents       │  • Metrics buffer  │                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Package Architecture

### Monorepo Structure

```
soft-systems-studio/
├── apps/
│   └── agent-api/                 # Main API application
│       ├── src/
│       │   ├── api/v1/            # Versioned REST endpoints
│       │   │   ├── auth/          # Authentication routes
│       │   │   ├── agents/        # Agent routes
│       │   │   ├── admin/         # Admin/cron routes
│       │   │   └── stripe.ts      # Billing routes
│       │   ├── middleware/        # Express middleware
│       │   ├── services/          # Business logic
│       │   ├── schemas/           # Zod validation schemas
│       │   ├── lib/               # Utilities
│       │   ├── types/             # TypeScript types
│       │   └── worker/            # BullMQ workers
│       └── prisma/                # Database schema
│
├── packages/
│   ├── frontend/                  # Next.js application
│   │   ├── src/
│   │   │   ├── pages/             # Next.js pages
│   │   │   ├── components/        # React components
│   │   │   └── lib/               # Frontend utilities
│   │   └── public/                # Static assets
│   │
│   ├── agency-core/               # Shared business types
│   │   └── src/
│   │       ├── configTypes.ts     # ClientConfig, Subsystem types
│   │       ├── mapping.ts         # Intake → config mapping
│   │       └── prompts.ts         # LLM prompt templates
│   │
│   ├── agent-customer-service/    # Customer service agent
│   │   └── src/
│   │       ├── handlers/          # Chat handlers
│   │       ├── prompts/           # Agent-specific prompts
│   │       └── schemas.ts         # Agent schemas
│   │
│   ├── core-llm/                  # LLM abstraction
│   │   └── src/
│   │       └── index.ts           # OpenAI wrapper
│   │
│   └── ui-components/             # Shared React components
│       └── src/
│           └── ChatWidget.tsx     # Embeddable chat widget
│
├── infra/                         # Infrastructure configs
│   └── docker-compose.yml         # Local dev stack
│
├── scripts/                       # Build & utility scripts
│   ├── sync-env.js                # Environment sync
│   ├── check-env-committed.js     # Pre-commit check
│   └── scan-placeholders.js       # Secret scanner
│
└── docs/                          # Documentation
```

### Package Dependencies

```
                    ┌─────────────────┐
                    │   agent-api     │
                    │   (Express)     │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ agent-customer-  │ │    core-llm      │ │   agency-core    │
│    service       │ │  (LLM wrapper)   │ │  (shared types)  │
└────────┬─────────┘ └──────────────────┘ └──────────────────┘
         │
         ▼
┌──────────────────┐
│    core-llm      │
└──────────────────┘
```

---

## Data Flow

### Chat Request Flow

```
Client                  API                    Services              Data
  │                      │                        │                    │
  │  POST /run           │                        │                    │
  │  {message}           │                        │                    │
  │─────────────────────▶│                        │                    │
  │                      │ requireAuth            │                    │
  │                      │ requireWorkspace       │                    │
  │                      │ requireRole            │                    │
  │                      │ validateBody           │                    │
  │                      │─────────────────────▶  │                    │
  │                      │                        │ searchVectors()    │
  │                      │                        │───────────────────▶│
  │                      │                        │◀───────────────────│
  │                      │                        │ context docs       │
  │                      │                        │                    │
  │                      │                        │ callLLM()          │
  │                      │                        │───────────────────▶│
  │                      │                        │◀───────────────────│
  │                      │                        │ response           │
  │                      │                        │                    │
  │                      │                        │ persistChat()      │
  │                      │                        │───────────────────▶│
  │                      │                        │◀───────────────────│
  │                      │◀─────────────────────  │                    │
  │◀─────────────────────│                        │                    │
  │  {reply, convId}     │                        │                    │
```

### Ingestion Flow

```
Client                  API                 Queue                Worker
  │                      │                    │                      │
  │  POST /ingest        │                    │                      │
  │  {documents}         │                    │                      │
  │─────────────────────▶│                    │                      │
  │                      │ validate           │                      │
  │                      │ generate ingestionId                      │
  │                      │ enqueue job        │                      │
  │                      │───────────────────▶│                      │
  │◀─────────────────────│                    │                      │
  │  {ok, ingestionId}   │                    │                      │
  │                      │                    │ dequeue              │
  │                      │                    │─────────────────────▶│
  │                      │                    │                      │ verify workspace
  │                      │                    │                      │ prepare docs
  │                      │                    │                      │ Postgres.createMany
  │                      │                    │                      │ Qdrant.upsert
  │                      │                    │◀─────────────────────│
  │                      │                    │ complete             │
```

---

## Service Layer

### Service Responsibilities

| Service | File | Responsibility |
|---------|------|----------------|
| **Chat** | `services/chat.ts` | RAG retrieval, LLM orchestration, conversation persistence |
| **Ingest** | `services/ingest.ts` | Document preparation, transactional persistence, vector upsert |
| **Qdrant** | `services/qdrant.ts` | Vector database operations, embedding generation |
| **Token** | `services/token.ts` | JWT generation, refresh token management |
| **LLM** | `services/llm.ts` | OpenAI API wrapper, streaming support |

### Transaction Pattern

Services use Prisma transactions for atomic operations:

```typescript
export async function ingestDocuments(input: IngestInput): Promise<IngestResult> {
  const { workspaceId, documents, ingestionId } = input;

  // Transaction ensures atomicity
  const result = await prisma.$transaction(async (tx) => {
    // 1. Persist to Postgres
    const created = await tx.kbDocument.createMany({
      data: rows,
      skipDuplicates: true,  // Idempotent on retry
    });

    return { count: created.count, ids };
  });

  // 2. Upsert to Qdrant (after Postgres succeeds)
  await upsertDocuments(workspaceId, preparedDocs);

  return result;
}
```

---

## Authentication Flow

### Login Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │   API    │     │   DB     │     │  Redis   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │  login         │                │                │
     │───────────────▶│                │                │
     │                │  find user     │                │
     │                │───────────────▶│                │
     │                │◀───────────────│                │
     │                │  verify password               │
     │                │                │                │
     │                │  generate tokens               │
     │                │                │                │
     │                │  store refresh token           │
     │                │───────────────────────────────▶│
     │                │                │                │
     │◀───────────────│                │                │
     │  {accessToken, refreshToken}    │                │
```

### Token Refresh Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │   API    │     │   DB     │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │  POST /token   │                │
     │  {refreshToken}│                │
     │───────────────▶│                │
     │                │  validate token│
     │                │───────────────▶│
     │                │◀───────────────│
     │                │  revoke old    │
     │                │───────────────▶│
     │                │  create new    │
     │                │───────────────▶│
     │◀───────────────│                │
     │  {new tokens}  │                │
```

---

## Agent Architecture

### Customer Service Agent

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Service Agent                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Input     │    │  Retrieval  │    │   Output    │     │
│  │  Handler    │───▶│   (RAG)     │───▶│  Generator  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Validate   │    │   Qdrant    │    │   OpenAI    │     │
│  │  & Parse    │    │   Search    │    │    LLM      │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Agent Prompt Structure

```typescript
const systemPrompt = `
You are a helpful customer service agent for ${companyName}.

CONTEXT FROM KNOWLEDGE BASE:
${retrievedDocuments.map(d => d.content).join('\n---\n')}

INSTRUCTIONS:
1. Answer based on the knowledge base context
2. Be concise and helpful
3. If unsure, say so and offer to escalate

CONVERSATION HISTORY:
${conversationHistory}
`;
```

---

## Queue System

### BullMQ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Queue System                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐         ┌─────────────┐                    │
│  │   ingest    │         │    email    │                    │
│  │   Queue     │         │   Queue     │                    │
│  └──────┬──────┘         └──────┬──────┘                    │
│         │                       │                            │
│         ▼                       ▼                            │
│  ┌─────────────┐         ┌─────────────┐                    │
│  │   Redis     │◀────────│   Redis     │                    │
│  │   Jobs      │         │   Jobs      │                    │
│  └──────┬──────┘         └──────┬──────┘                    │
│         │                       │                            │
│         ▼                       ▼                            │
│  ┌─────────────┐         ┌─────────────┐                    │
│  │   Ingest    │         │   Email     │                    │
│  │   Worker    │         │   Worker    │                    │
│  └─────────────┘         └─────────────┘                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Job Configuration

```typescript
// Ingest queue with retry strategy
export const ingestQueue = new Queue<IngestJobData>('ingest', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│      User        │       │    Workspace     │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ email            │       │ name             │
│ password (hash)  │       │ slug             │
│ name             │       │ createdAt        │
│ createdAt        │       │ updatedAt        │
│ deletedAt        │       │ deletedAt        │
└────────┬─────────┘       └────────┬─────────┘
         │                          │
         │    ┌─────────────────────┤
         │    │                     │
         ▼    ▼                     ▼
┌──────────────────┐       ┌──────────────────┐
│ WorkspaceMember  │       │  Conversation    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ workspaceId (FK) │       │ workspaceId (FK) │
│ userId (FK)      │       │ title            │
│ role             │       │ createdAt        │
│ createdAt        │       │ deletedAt        │
└──────────────────┘       └────────┬─────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │     Message      │
                           ├──────────────────┤
                           │ id (PK)          │
                           │ conversationId   │
                           │ role             │
                           │ content          │
                           │ createdAt        │
                           └──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│   KbDocument     │       │  RefreshToken    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ workspaceId (FK) │       │ token            │
│ title            │       │ userId (FK)      │
│ content          │       │ workspaceId (FK) │
│ metadata (JSON)  │       │ expiresAt        │
│ createdAt        │       │ revokedAt        │
│ createdBy        │       │ replacedBy       │
└──────────────────┘       └──────────────────┘
```

---

## External Integrations

### Integration Points

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **OpenAI** | LLM inference, embeddings | `OPENAI_API_KEY` |
| **Qdrant** | Vector similarity search | `QDRANT_HOST`, `QDRANT_API_KEY` |
| **Stripe** | Payment processing | `STRIPE_SECRET_KEY`, webhook |
| **Clerk** | Frontend authentication | `CLERK_SECRET_KEY` |
| **Sentry** | Error tracking | `SENTRY_DSN` |
| **Upstash** | Serverless Redis/QStash | `UPSTASH_*` vars |

### Integration Patterns

**OpenAI Integration:**
```typescript
// core-llm package abstracts the OpenAI client
const response = await callOpenAI({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ],
  temperature: 0.7,
});
```

**Qdrant Integration:**
```typescript
// Vector search with workspace isolation
const results = await qdrantClient.search(collection, {
  vector: await getEmbedding(query),
  filter: {
    must: [{ key: 'workspaceId', match: { value: workspaceId } }]
  },
  limit: 5,
});
```

**Stripe Integration:**
```typescript
// Webhook signature verification
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  env.STRIPE_WEBHOOK_SECRET
);
```
