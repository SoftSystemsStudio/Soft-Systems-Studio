---
name: prisma-migrate
description: Use when working with database schema changes, creating migrations, or troubleshooting Prisma-related issues. Ensures proper migration workflows and prevents direct editing of migration files.
---

# Prisma Migration Skill

## Critical Rules

1. **NEVER edit files in `/apps/agent-api/prisma/migrations/` directly** - This is a "do not touch" zone per CLAUDE.md
2. Always use Prisma CLI commands for migrations
3. Run typecheck after migrations to ensure Prisma client types are updated

## Before Any Schema Change

1. Check the current schema at `/apps/agent-api/prisma/schema.prisma`
2. Review existing models and relationships
3. Plan changes carefully - migrations are permanent

## Migration Workflow

### Development Migration

```bash
# Generate migration and apply to dev database
pnpm --filter apps-agent-api prisma migrate dev --name <descriptive-name>

# Regenerate Prisma client after schema changes
pnpm --filter apps-agent-api prisma generate
```

### Production Migration

```bash
# Apply pending migrations to production
pnpm --filter apps-agent-api prisma migrate deploy
```

### After Migration

```bash
# Verify types are correct
pnpm typecheck
```

## Naming Conventions

| Entity | Convention          | Example                           |
| ------ | ------------------- | --------------------------------- |
| Models | PascalCase singular | `User`, `Workspace`, `Agent`      |
| Fields | camelCase           | `createdAt`, `workspaceId`        |
| Enums  | PascalCase          | `AgentStatus`, `SubscriptionTier` |

## Best Practices

### Indexes

Always include `@@index` for frequently queried fields:

```prisma
model Agent {
  id          String @id @default(cuid())
  workspaceId String
  name        String

  @@index([workspaceId])
}
```

### Soft Delete Pattern

Use for user-facing entities:

```prisma
model User {
  id        String    @id @default(cuid())
  deletedAt DateTime?
}
```

### Cascade Delete

Configure appropriately:

```prisma
model Agent {
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}
```

## Troubleshooting

| Issue                       | Solution                                           |
| --------------------------- | -------------------------------------------------- |
| Migration drift             | Run `prisma migrate dev` to reconcile              |
| Shadow database error       | Check `DATABASE_URL` environment variable          |
| Type errors after migration | Run `pnpm --filter apps-agent-api prisma generate` |

## Related Files

- Schema: `/apps/agent-api/prisma/schema.prisma`
- Migrations: `/apps/agent-api/prisma/migrations/` (read-only)
- Seed: `/apps/agent-api/prisma/seed.ts`
