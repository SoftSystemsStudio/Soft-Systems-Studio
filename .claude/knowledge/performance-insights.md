# Performance Insights & Optimizations

Document performance learnings, optimizations, and benchmarks here. Every performance issue is a learning opportunity.

---

## Insight 1: Prisma Connection Pooling (Date: 2026-01-09)

**Issue:** Database connection exhaustion under load causing 500 errors.

**Root Cause:** Default Prisma connection pool too small (10 connections) for production workload.

**Solution:**

```typescript
// DATABASE_URL with connection pooling via PgBouncer
postgresql://user:pass@host:port/db?connection_limit=100&pool_timeout=10
```

**Results:**

- Before: 500 errors at 50 concurrent requests
- After: Stable at 200+ concurrent requests
- Latency: p95 reduced from 800ms → 150ms

**Recommendations:**

- Set `connection_limit` based on expected concurrency
- Monitor connection pool usage via Prisma metrics
- Use PgBouncer in transaction mode for serverless deployments

---

## Insight 2: Redis Caching Strategy (Date: TBD)

**Context:** [Describe the performance problem]

**Investigation:**

- Baseline metrics: [Before numbers]
- Profiling method: [How you measured]
- Bottleneck identified: [What was slow]

**Optimization:**

```typescript
// Code example of optimization
```

**Results:**

- Latency: [Before → After]
- Throughput: [Before → After]
- Resource usage: [CPU/Memory impact]

**Tradeoffs:**

- [What did we sacrifice? Complexity? Consistency?]

**Monitoring:**

- [How do we ensure this stays fast?]

---

## Insight 3: Frontend Bundle Size Optimization (Date: TBD)

**Issue:** Initial page load too slow (> 5 seconds on 3G).

**Analysis:**

```bash
# Use webpack-bundle-analyzer
pnpm build && npx webpack-bundle-analyzer dist/stats.json
```

**Optimizations:**

1. Code splitting by route
2. Lazy load heavy components (charts, editors)
3. Remove unused dependencies
4. Use dynamic imports for conditionally-used code

**Results:**

- Bundle size: [Before KB → After KB]
- Initial load: [Before ms → After ms]
- TTI (Time to Interactive): [Before ms → After ms]

---

## Performance Budgets

Track these metrics continuously:

### API Performance

- **p50 latency:** < 100ms ✅
- **p95 latency:** < 500ms ⚠️ (Currently: TBD)
- **p99 latency:** < 1000ms ❌ (Currently: TBD)
- **Error rate:** < 0.1% ✅

### Frontend Performance

- **Initial load:** < 2s on 4G
- **Time to Interactive:** < 3.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Bundle size (main):** < 300 KB gzipped

### Database Performance

- **Query time (p95):** < 50ms
- **Connection pool utilization:** < 80%
- **Transaction time (p95):** < 100ms

### Infrastructure

- **CPU usage:** < 70% average
- **Memory usage:** < 80% average
- **Disk I/O wait:** < 10%

---

## Common Performance Anti-Patterns

### ❌ Anti-Pattern 1: N+1 Queries

**Bad:**

```typescript
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { userId: user.id } });
}
// Results in N+1 queries (1 + N)
```

**Good:**

```typescript
const users = await prisma.user.findMany({
  include: { posts: true },
});
// Single query with JOIN
```

### ❌ Anti-Pattern 2: Missing Indexes

**Symptom:** Slow queries on large tables

**Fix:**

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  userId    Int
  status    String
  createdAt DateTime @default(now())

  @@index([userId, status]) // Composite index for common query
  @@index([createdAt])      // Index for sorting
}
```

### ❌ Anti-Pattern 3: Large Response Payloads

**Bad:**

```typescript
// Returns entire user object (including sensitive fields)
return user;
```

**Good:**

```typescript
// Return only what the client needs
return {
  id: user.id,
  name: user.name,
  email: user.email,
};
```

### ❌ Anti-Pattern 4: Synchronous Heavy Operations

**Bad:**

```typescript
app.post('/process', async (req, res) => {
  await heavyProcessing(); // Blocks for 30 seconds
  res.json({ status: 'done' });
});
```

**Good:**

```typescript
app.post('/process', async (req, res) => {
  const job = await queue.add('heavy-processing', req.body);
  res.json({ jobId: job.id, status: 'queued' });
});
```

---

## Performance Testing Checklist

Before deploying to production:

- [ ] Load test critical endpoints (use k6, Artillery, or similar)
- [ ] Profile database queries (use `EXPLAIN ANALYZE`)
- [ ] Check bundle size (use webpack-bundle-analyzer)
- [ ] Test on slow network (Chrome DevTools throttling)
- [ ] Monitor memory leaks (use Chrome Memory Profiler)
- [ ] Check for blocking operations (use `clinic.js`)
- [ ] Verify caching works (check cache hit rates)
- [ ] Test with production-like data volume

---

## Tools & Resources

**Profiling:**

- [clinic.js](https://clinicjs.org/) - Node.js performance profiling
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Frontend performance
- [k6](https://k6.io/) - Load testing

**Monitoring:**

- [Prometheus](https://prometheus.io/) - Metrics collection
- [Grafana](https://grafana.com/) - Visualization
- [Sentry](https://sentry.io/) - Error tracking with performance

**Analysis:**

- [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL query analysis
- Chrome DevTools Performance tab

---

## Performance Optimization Workflow

1. **Measure** - Get baseline metrics (don't optimize without data)
2. **Identify** - Find the actual bottleneck (profile, don't guess)
3. **Optimize** - Make targeted improvements
4. **Verify** - Measure again to confirm improvement
5. **Monitor** - Set up alerts to catch regressions

**Remember:** Premature optimization is the root of all evil. Only optimize what matters (bottlenecks in hot paths).

---

## Next Steps

- [ ] Set up automated performance testing in CI
- [ ] Create Grafana dashboards for key metrics
- [ ] Implement performance budgets in build pipeline
- [ ] Document more optimization patterns as we discover them
