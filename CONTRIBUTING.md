# Contributing to Soft Systems Studio

Thank you for your interest in contributing! This guide will help you get started.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Architecture Decisions](#architecture-decisions)

---

## Development Setup

### Prerequisites

- **Node.js 22+** — Required runtime
- **pnpm 8+** — Package manager
- **Docker** — For local Postgres, Redis, Qdrant
- **Git** — Version control

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/SoftSystemsStudio/Soft-Systems-Studio.git
cd Soft-Systems-Studio

# 2. Enable corepack and install dependencies
corepack enable
corepack prepare pnpm@8.11.0 --activate
pnpm install

# 3. Set up environment variables
cp .env.example .env
cp apps/agent-api/.env.example apps/agent-api/.env

# 4. Start local infrastructure
docker compose -f infra/docker-compose.yml up -d

# 5. Initialize database
pnpm --filter apps-agent-api prisma:generate
pnpm --filter apps-agent-api migrate:dev
pnpm --filter apps-agent-api seed

# 6. Start development servers
pnpm dev
```

### Using GitHub Codespaces

The repository includes a devcontainer configuration for instant setup:

1. Click "Code" → "Codespaces" → "Create codespace"
2. Wait for container to build (~2 minutes)
3. Environment is pre-configured with Node 22, pnpm, and extensions

### Environment Variables

Edit `.env` files with your credentials:

```env
# Required for local development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agent_api
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-at-least-32-characters-long
OPENAI_API_KEY=sk-your-key-here
```

Use the sync script to merge example variables:

```bash
pnpm sync-env
```

---

## Project Structure

```
soft-systems-studio/
├── apps/
│   └── agent-api/          # Main API (Express + Prisma)
├── packages/
│   ├── frontend/           # Next.js frontend
│   ├── agency-core/        # Shared types & prompts
│   ├── agent-customer-service/  # Customer service agent
│   ├── core-llm/           # LLM abstraction
│   └── ui-components/      # Shared React components
├── docs/                   # Documentation
├── infra/                  # Docker configs
├── scripts/                # Build utilities
└── types/                  # Global TypeScript types
```

### Key Files

| File                                  | Purpose                |
| ------------------------------------- | ---------------------- |
| `apps/agent-api/src/index.ts`         | API entry point        |
| `apps/agent-api/src/env.ts`           | Environment validation |
| `apps/agent-api/prisma/schema.prisma` | Database schema        |
| `packages/frontend/src/pages/`        | Next.js pages          |
| `jest.config.ts`                      | Test configuration     |
| `tsconfig.json`                       | TypeScript config      |

---

## Development Workflow

### Running Services

```bash
# Start everything in dev mode
pnpm dev

# Start specific packages
pnpm --filter apps-agent-api dev     # API only
pnpm --filter frontend dev           # Frontend only

# Run the worker
pnpm --filter apps-agent-api worker
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter apps-agent-api build
```

### Database Operations

```bash
# Generate Prisma client
pnpm --filter apps-agent-api prisma:generate

# Create migration
pnpm --filter apps-agent-api migrate:dev

# Apply migrations (production)
pnpm --filter apps-agent-api migrate:deploy

# Seed database
pnpm --filter apps-agent-api seed

# Open Prisma Studio
pnpm --filter apps-agent-api prisma studio
```

### Adding Dependencies

```bash
# Add to root (dev dependency)
pnpm add -D -w <package>

# Add to specific package
pnpm --filter apps-agent-api add <package>
pnpm --filter frontend add <package>
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter apps-agent-api test
pnpm --filter agency-core test

# Run with coverage
pnpm test:ci

# Run integration tests (requires database)
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/test \
  pnpm --filter apps-agent-api test:integration
```

### Integration Tests with Docker

```bash
# Start test database
docker run --name ss-test-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=agent_api_test \
  -p 5432:5432 -d postgres:15

# Run integration tests
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/agent_api_test \
  pnpm --filter apps-agent-api test:integration

# Cleanup
docker rm -f ss-test-db
```

### Writing Tests

```typescript
// Unit test example
import { ingestDocuments } from '../services/ingest';

describe('ingestDocuments', () => {
  it('should validate workspaceId', async () => {
    await expect(
      ingestDocuments({
        workspaceId: '',
        documents: [],
      }),
    ).rejects.toThrow('workspaceId is required');
  });
});
```

### Test Coverage

Aim for:

- **Services**: 80%+ coverage
- **Middleware**: 90%+ coverage
- **Critical paths**: 100% coverage

---

## Code Style

### Linting & Formatting

```bash
# Run ESLint
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix

# Format with Prettier
pnpm format

# Check formatting
pnpm format:check

# Type check
pnpm typecheck
```

### Pre-Commit Hooks

Husky runs these checks before each commit:

```bash
# Verify .env not committed
pnpm check-env-committed

# Scan for secret patterns
pnpm scan-placeholders
```

Enable hooks after cloning:

```bash
pnpm install
pnpm prepare
```

### TypeScript Guidelines

```typescript
// ✅ Good: Explicit types for function signatures
export async function createUser(email: string, password: string): Promise<User> {
  // ...
}

// ✅ Good: Use Zod for runtime validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// ✅ Good: Prefer async/await over callbacks
const result = await prisma.user.findUnique({ where: { email } });

// ❌ Bad: Using any
const data: any = req.body;

// ❌ Bad: Ignoring errors
try {
  /* ... */
} catch (e) {}
```

### File Naming

- **Components**: `PascalCase.tsx` (e.g., `ChatWidget.tsx`)
- **Services**: `camelCase.ts` (e.g., `ingest.ts`)
- **Types**: `camelCase.ts` (e.g., `auth.ts`)
- **Tests**: `*.test.ts` (e.g., `mapping.test.ts`)

---

## Pull Request Process

### 1. Create a Branch

```bash
# Feature branch
git checkout -b feature/add-new-agent

# Bug fix
git checkout -b fix/auth-token-refresh

# Documentation
git checkout -b docs/api-reference
```

### 2. Make Changes

- Write code following the style guide
- Add/update tests
- Update documentation if needed

### 3. Commit

Use conventional commits:

```bash
# Format: type(scope): description
git commit -m "feat(agent-api): add document ingestion endpoint"
git commit -m "fix(auth): handle expired refresh tokens"
git commit -m "docs(readme): update quick start guide"
git commit -m "test(ingest): add integration tests"
```

**Types:**

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `test` — Tests
- `refactor` — Code refactoring
- `chore` — Maintenance

### 4. Push & Create PR

```bash
git push origin feature/add-new-agent
```

Then create a Pull Request on GitHub with:

- Clear title describing the change
- Description of what and why
- Link to related issues
- Screenshots for UI changes

### 5. Review Process

- CI must pass (lint, typecheck, tests)
- At least one approval required
- Address review comments
- Squash and merge when approved

---

## Architecture Decisions

### Adding a New Agent

1. Create package in `packages/agent-{name}/`
2. Define schemas in `src/schemas.ts`
3. Implement handler in `src/handlers/`
4. Add routes in `apps/agent-api/src/api/v1/agents/`
5. Export from `packages/agent-{name}/src/index.ts`

### Adding a New API Endpoint

1. Create route file in `apps/agent-api/src/api/v1/`
2. Define Zod schema in `apps/agent-api/src/schemas/`
3. Implement service logic in `apps/agent-api/src/services/`
4. Add middleware stack (auth, validation)
5. Register route in `apps/agent-api/src/index.ts`

### Database Changes

1. Modify `apps/agent-api/prisma/schema.prisma`
2. Run `pnpm --filter apps-agent-api migrate:dev --name describe-change`
3. Update affected services
4. Add tests for new models

### Adding Environment Variables

1. Add to `apps/agent-api/src/env.ts` schema
2. Add to `.env.example` files
3. Document in `docs/ENV.md`
4. Update deployment docs if required

---

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue with reproduction steps
- **Security**: Email security@softsystems.studio (do not open public issues)

---

## License

By contributing, you agree that your contributions will be licensed under the same terms as the project.
