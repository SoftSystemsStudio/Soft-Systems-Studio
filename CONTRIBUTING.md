# Contributing to Soft Systems Studio (Website)

Thank you for your interest in contributing! This guide covers the marketing website repo — see `README.md` for what this repo is and its provenance.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)

---

## Development Setup

### Prerequisites

- **Node.js 22+** — Required runtime
- **pnpm 8+** — Package manager
- **Git** — Version control

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/SoftSystemsStudio/sss-website.git
cd sss-website

# 2. Enable corepack and install dependencies
corepack enable
corepack prepare pnpm@8.11.0 --activate
pnpm install

# 3. Set up environment variables
cp packages/frontend/.env.example packages/frontend/.env.local

# 4. Start the dev server
pnpm dev
```

### Using GitHub Codespaces

The repository includes a devcontainer configuration for instant setup:

1. Click "Code" → "Codespaces" → "Create codespace"
2. Wait for container to build (~2 minutes)
3. Environment is pre-configured with Node 22, pnpm, and extensions

### Secrets Policy

- **Never** commit real secrets (API keys, tokens, passwords) to the repository. Only store example values in `.env.example` files.
- The repository enforces secret scanning with `secretlint`. Project-level ignore rules live in `.secretlintignore` — if you believe a pattern should be ignored, open a PR and explain the rationale.
- For deployments, store secrets in Vercel's environment settings.

Quick checks:

```bash
pnpm secretlint
node scripts/scan-placeholders.js
node scripts/check-env-committed.js
```

---

## Project Structure

```
.
├── packages/
│   ├── frontend/           # Next.js marketing site (app router)
│   └── ui-components/      # Shared React components (ChatWidget, etc.)
└── scripts/                # Repo-hygiene scripts
```

### Key Files

| File                                  | Purpose                       |
| -------------------------------------- | ------------------------------ |
| `packages/frontend/src/app/`          | Next.js app router pages/routes |
| `packages/frontend/src/lib/env.ts`    | Typed environment variable access |
| `packages/frontend/src/middleware.ts` | Clerk auth gating + route matcher |
| `vercel.json`                         | Vercel build config            |
| `tsconfig.json`                       | Root TypeScript config (extended by each package) |

---

## Development Workflow

```bash
# Start the dev server
pnpm dev

# Build ui-components then frontend, in dependency order
pnpm build

# Build a single package
pnpm --filter @softsystems/ui-components build
pnpm --filter frontend build
```

### Adding Dependencies

```bash
# Add to root (dev dependency)
pnpm add -D -w <package>

# Add to a specific package
pnpm --filter frontend add <package>
pnpm --filter @softsystems/ui-components add <package>
```

---

## Testing

```bash
pnpm test        # per-package test scripts — frontend's is currently a stub; ui-components has none
pnpm test:ci
```

There's no meaningful automated test coverage here yet. If you're adding non-trivial logic (a new API route, a shared component with real behavior), consider adding a test alongside it rather than treating this as precedent to skip tests.

---

## Code Style

### Linting & Formatting

```bash
pnpm lint         # ESLint
pnpm lint:fix
pnpm format       # Prettier
pnpm format:check
pnpm typecheck    # tsc --noEmit across workspace packages
```

### Pre-Commit Hooks

Husky runs these checks before each commit — a `.env`-pattern guard (added/modified files only, not deletions) and the build/lint checks defined in `.husky/pre-commit`.

Enable hooks after cloning:

```bash
pnpm install
pnpm prepare
```

### TypeScript Guidelines

```typescript
// ✅ Good: Explicit types for function signatures
export async function sendIntake(data: IntakeFormData): Promise<void> {
  // ...
}

// ✅ Good: Use Zod for runtime validation
const schema = z.object({
  email: z.string().email(),
});

// ❌ Bad: Using any
const data: any = req.body;

// ❌ Bad: Direct process.env access outside lib/env.ts
const key = process.env.SOME_KEY; // use the typed env module instead
```

### File Naming

- **Components**: `PascalCase.tsx` (e.g., `ChatWidget.tsx`)
- **Utilities/services**: `camelCase.ts` (e.g., `email.ts`)
- **Tests**: `*.test.ts`

---

## Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/update-pricing-copy
git checkout -b fix/intake-form-validation
```

### 2. Make Changes

- Write code following the style guide
- Update documentation if the change affects setup, deployment, or the repo's structure

### 3. Commit

Use conventional commits:

```bash
git commit -m "feat(frontend): add annual pricing toggle"
git commit -m "fix(intake): validate phone number format"
git commit -m "docs(readme): update deploy instructions"
```

**Types:** `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

### 4. Push & Create PR

```bash
git push origin feature/update-pricing-copy
```

Then open a Pull Request with a clear title, a description of what and why, and screenshots for UI changes.

### 5. Review Process

- CI must pass (see `.github/workflows/ci.yml`)
- Address review comments
- Squash and merge when approved

---

## Getting Help

- **Bugs**: Open a GitHub Issue with reproduction steps
- **Security**: Email security@softsystems.studio (do not open public issues)

---

## License

By contributing, you agree that your contributions will be licensed under the same terms as the project.
