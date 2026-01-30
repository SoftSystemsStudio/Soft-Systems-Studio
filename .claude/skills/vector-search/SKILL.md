---
name: vector-search
description: Use when working with Qdrant vector database operations including document ingestion, similarity search, and embedding workflows. Ensures proper tenant isolation and error handling.
---

# Vector Search Skill

## Overview

This project uses Qdrant for vector storage and similarity search. The service is in `/apps/agent-api/src/services/qdrant.ts`.

## Environment Configuration

From `src/env.ts`:

- `QDRANT_HOST` - Qdrant server host
- `QDRANT_PORT` - Qdrant server port
- `QDRANT_USE_HTTPS` - Whether to use HTTPS
- `QDRANT_API_KEY` - API key for authentication
- `QDRANT_TIMEOUT_MS` - Request timeout
- `QDRANT_RETRY_MAX` - Max retry attempts
- `QDRANT_RETRY_BASE_MS` - Base delay for retries
- `QDRANT_COLLECTION` - Collection name

## Vector Dimensions

**Important:** Vector dimension is **1536** (OpenAI ada-002 embeddings)

## Tenant Isolation

**Always include `workspaceId` in filters** for multi-tenant isolation:

```typescript
const results = await qdrantService.search({
  vector: queryEmbedding,
  filter: {
    must: [{ key: 'workspaceId', match: { value: workspaceId } }],
  },
  limit: 10,
});
```

## Creating Embeddings

Use the embed function from LLM service:

```typescript
import { embed } from '../services/llm';

const embedding = await embed(text);
// Returns: number[] of length 1536
```

## Basic Operations

### Ensure Collection Exists

```typescript
import { ensureCollection } from '../services/qdrant';

await ensureCollection('my-collection', 1536);
```

### Upsert Points

```typescript
await qdrantService.upsert({
  collection: 'documents',
  points: [
    {
      id: documentId,
      vector: embedding,
      payload: {
        workspaceId,
        content: text,
        metadata: { ... }
      }
    }
  ]
});
```

### Similarity Search

```typescript
const results = await qdrantService.search({
  collection: 'documents',
  vector: queryEmbedding,
  filter: {
    must: [{ key: 'workspaceId', match: { value: workspaceId } }],
  },
  limit: 10,
  scoreThreshold: 0.7,
});
```

### Delete Points

```typescript
await qdrantService.delete({
  collection: 'documents',
  filter: {
    must: [{ key: 'documentId', match: { value: documentId } }],
  },
});
```

## Error Handling

Use custom error classes:

```typescript
import {
  QdrantError,
  QdrantTimeout,
  QdrantUnavailable,
  QdrantBadRequest
} from '../errors/qdrant';

try {
  await qdrantService.search(...);
} catch (error) {
  if (error instanceof QdrantTimeout) {
    // Handle timeout - maybe retry with smaller limit
  } else if (error instanceof QdrantUnavailable) {
    // Service is down - graceful degradation
  } else if (error instanceof QdrantBadRequest) {
    // Invalid request - check parameters
  }
  throw error;
}
```

## Retry Pattern

Use `fetchWithRetry` for resilience:

```typescript
import { fetchWithRetry } from '../utils/fetch';

const response = await fetchWithRetry(`${qdrantUrl}/collections/${collection}/points/search`, {
  method: 'POST',
  body: JSON.stringify(searchRequest),
  retries: 3,
  backoff: 1000,
});
```

## Health Check

Include Qdrant in health checks:

```typescript
import { pingQdrant } from '../services/qdrant';

// In health endpoint
const qdrantHealthy = await pingQdrant();
```

## Best Practices

1. **Always filter by workspaceId** - Never expose cross-tenant data
2. **Use score thresholds** - Filter out low-relevance results (0.7+ recommended)
3. **Batch operations** - Upsert in batches of 100-500 points
4. **Handle timeouts gracefully** - Qdrant can be slow on large collections
5. **Log search metrics** - Track latency and result counts

## Related Files

- Qdrant service: `/apps/agent-api/src/services/qdrant.ts`
- LLM/Embeddings: `/apps/agent-api/src/services/llm.ts`
- Environment: `/apps/agent-api/src/env.ts`
- Error classes: `/apps/agent-api/src/errors/`
