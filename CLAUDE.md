# CLAUDE.md

## Purpose

This file is the repo's operating runbook for Claude Code: how work is planned, executed, validated, and how context is managed.

---

## Operating Model

### Always-On Requirements

- **Thinking**: ON at all times
- **Verify before asserting**: check files/grep/tests instead of guessing
- **Keep diffs tight**: minimal, reversible changes

### Modes

#### PLANNING MODE (required for new features or refactors)

**Trigger**: adding features, changing behavior, cross-module refactors, architecture changes

**Rules**:

- Ask clarifying questions first
- Provide a written plan before coding

**Planning output checklist**:

- Goal + success criteria
- In scope / out of scope
- Approach options + decision
- Step-by-step implementation plan
- Validation plan (tests, manual checks)
- Risks + mitigations

#### EXECUTION MODE (for scoped tasks)

**Rules**:

- Implement the approved plan (or explicitly stated assumptions)
- Add/adjust tests when behavior changes
- If ambiguity appears → stop and switch to PLANNING MODE

---

## Context Governance

### Clear Protocol (when context is getting saturated)

Run `clear`, then restate:

1. objective
2. constraints
3. current plan
4. open questions
5. next steps

### Compact Budget

- Max compacts per session: 3
- Track `compact_count`
- On attempt #4: start a new session and paste a summary + next objectives

### Session State (maintained during work)

- current_mode: PLANNING | EXECUTION
- objective:
- compact_count: 0/3
- assumptions:
- open_questions:
- next_actions:

---

## Repo Conventions

### Tech Stack

- **Language/runtime**: Node.js + TypeScript 5.3+
- **Frameworks**: Express (API), Next.js 16 (Frontend)
- **Package manager**: pnpm@8.11.0 (monorepo with workspaces)
- **Database**: PostgreSQL with Prisma ORM 5.8
- **Queue**: Redis + BullMQ
- **Vector DB**: Qdrant (document embeddings)
- **Testing**: Jest 30 (unit), supertest (integration), vitest (select packages)
- **Linters/formatters**: ESLint 8 + Prettier 3
- **Git hooks**: Husky 8
- **Security**: secretlint, custom env/placeholder scanners

### Architecture Map

```
/apps/
  agent-api/           # Main Express API (auth, agents, admin, stripe)
  voice-receptionist/  # Vapi.ai voice agent integration

/packages/
  frontend/            # Next.js marketing + dashboard
  agent-orchestrator/  # Agent execution engine (tools, state, observability)
  agent-customer-service/ # Customer service agent implementation
  agency-core/         # Shared business logic (client config mapping)
  api/                 # Legacy/shared API utilities
  core-llm/            # LLM abstractions (embeddings, providers)

/scripts/              # Automation scripts (env sync, security audit, deployment)
/docs/                 # Architecture, deployment, API docs
/ai-automation-agency-os/ # Client-specific configurations and runbooks
```

**Boundaries / "do not touch" zones**:

- `/apps/agent-api/prisma/migrations/` - Never edit manually, use Prisma CLI
- `/ai-automation-agency-os/02-clients/*/03-operations/` - Production client configs (require planning mode)
- `.env*` files - Never commit (guarded by pre-commit)
- `pnpm-lock.yaml` - Only update via `pnpm install`

### Standard Commands

```bash
# Install dependencies
pnpm install

# Lint
pnpm lint              # Check all packages
pnpm lint:fix          # Auto-fix all packages

# Type check
pnpm typecheck         # Run tsc --noEmit across all packages

# Test
pnpm test              # Run all test suites
pnpm test:ci           # CI mode with coverage

# Build
pnpm build             # Build all packages

# Run
pnpm dev               # Start agent-api + frontend in parallel
pnpm start             # Start agent-api in production mode

# Format
pnpm format            # Format all files with Prettier
pnpm format:check      # Check formatting without writing

# Security
pnpm secretlint        # Scan for secrets
pnpm check-env-committed # Ensure no .env files staged
pnpm scan-placeholders # Find placeholder values

# Claude helpers
pnpm claude:briefing   # Generate repo summary for fresh AI session
pnpm claude:clear      # Print context restart template
pnpm claude:compact-guard # Check session compact count
```

### Code Standards

**Naming**:

- Files: `kebab-case.ts`, `PascalCase.tsx` for React components
- Variables/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Prisma models: `PascalCase` singular

**Error handling**:

- Services: throw descriptive errors
- Controllers: try/catch, return appropriate HTTP status
- Middleware: next(error) for error handling middleware
- Use custom error classes where appropriate

**Logging**:

- Use `pino` logger from `apps/agent-api/src/logger.ts`
- Structured logging with context (userId, workspaceId, requestId)
- Redact sensitive fields automatically
- No `console.log` in production code (except scripts)

**Tests required for**:

- New API endpoints (integration tests)
- Business logic functions (unit tests)
- Middleware (unit tests)
- Bug fixes (regression tests)

**ESLint rules to note**:

- `no-restricted-syntax`: Blocks direct `process.env` access (use typed env modules)
- `security/*`: ESLint plugin security rules enforced
- `@typescript-eslint/no-explicit-any`: Avoid `any`, use `unknown` or proper types

---

## Change Management

### Feature/Refactor Workflow

1. **PLANNING MODE**
   - Write plan to `docs/plans/YYYY-MM-DD-feature-name.md`
   - Get approval/clarification
2. **Implement in small commits**
   - Each commit passes lint + typecheck + tests
   - Commit messages follow conventional commits
3. **Validate** (tests + manual)
   - Update tests for behavior changes
   - Run full CI suite locally: `pnpm ci`
4. **Document any new behavior**
   - Update README, ARCHITECTURE.md, or inline docs as needed

### Bugfix Workflow

1. **Repro steps** - Document how to reproduce
2. **Root cause** - Identify the underlying issue
3. **Patch** - Minimal, focused fix
4. **Regression test** - Add test that would have caught it

---

## Quality Gates (pre-commit / CI)

### Pre-commit Checks (via Husky)

Required checks:

- ✅ CLAUDE.md context update (auto)
- ✅ secretlint (secret scanning)
- ✅ check-env-committed (prevent .env commits)
- ✅ scan-placeholders (find placeholder values)
- ✅ format:check (Prettier)
- ✅ lint (ESLint)
- ✅ typecheck (TypeScript)

**If checks fail**: fix before commit. No bypassing with `--no-verify` except emergencies.

### CI Checks (GitHub Actions / deployment)

- All pre-commit checks
- Full test suite: `pnpm test:ci`
- Build verification: `pnpm build`
- Security audit: `pnpm audit`

---

## Auto-updated Commit Context

**Managed by pre-commit hook** (`scripts/update-claude-context.js`)

_This section auto-populates with recent commit context to help Claude maintain continuity._

**Last updated**: 2026-01-30T20:48:18.415Z

**Current staged changes summary**:
.claude/: 284 added
root/: 3 modified
packages/: 8 added, 16 modified

**Recent git commits**:

```
f927b98 - Update pricing guide, frontend environment config, and add intake API endpoint (9 days ago)
2317a5f - feat(frontend): Final luxury dark mode polish (2 weeks ago)
18f7194 - feat: add agency OS templates, case study, and luxury dark mode redesign (2 weeks ago)
0e15f98 - feat(frontend): Luxury dark mode redesign with glassmorphism (2 weeks ago)
bf04ff7 - feat(frontend): Technical Brutalist V3 patch notes implementation (2 weeks ago)
```

**Recent commits**: (rolling window of last 10)

### Commit 1: 2026-01-30T20:48:18.415Z

**Staged files**:

```
A	.claude/skills/algorithmic-art/LICENSE.txt
A	.claude/skills/algorithmic-art/SKILL.md
A	.claude/skills/algorithmic-art/templates/generator_template.js
A	.claude/skills/algorithmic-art/templates/viewer.html
A	.claude/skills/api-endpoint/SKILL.md
A	.claude/skills/brand-guidelines/LICENSE.txt
A	.claude/skills/brand-guidelines/SKILL.md
A	.claude/skills/canvas-design/LICENSE.txt
A	.claude/skills/canvas-design/SKILL.md
A	.claude/skills/canvas-design/canvas-fonts/ArsenalSC-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/ArsenalSC-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/BigShoulders-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/BigShoulders-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/BigShoulders-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/Boldonse-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/Boldonse-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/BricolageGrotesque-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/BricolageGrotesque-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/BricolageGrotesque-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/CrimsonPro-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/CrimsonPro-Italic.ttf
A	.claude/skills/canvas-design/canvas-fonts/CrimsonPro-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/CrimsonPro-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/DMMono-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/DMMono-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/EricaOne-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/EricaOne-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/GeistMono-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/GeistMono-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/GeistMono-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/Gloock-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/Gloock-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/IBMPlexMono-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/IBMPlexMono-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/IBMPlexMono-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/IBMPlexSerif-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/IBMPlexSerif-BoldItalic.ttf
A	.claude/skills/canvas-design/canvas-fonts/IBMPlexSerif-Italic.ttf
A	.claude/skills/canvas-design/canvas-fonts/IBMPlexSerif-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/InstrumentSans-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/InstrumentSans-BoldItalic.ttf
A	.claude/skills/canvas-design/canvas-fonts/InstrumentSans-Italic.ttf
A	.claude/skills/canvas-design/canvas-fonts/InstrumentSans-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/InstrumentSans-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/InstrumentSerif-Italic.ttf
A	.claude/skills/canvas-design/canvas-fonts/InstrumentSerif-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/Italiana-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/Italiana-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/JetBrainsMono-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/JetBrainsMono-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/JetBrainsMono-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/Jura-Light.ttf
A	.claude/skills/canvas-design/canvas-fonts/Jura-Medium.ttf
A	.claude/skills/canvas-design/canvas-fonts/Jura-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/LibreBaskerville-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/LibreBaskerville-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/Lora-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/Lora-BoldItalic.ttf
A	.claude/skills/canvas-design/canvas-fonts/Lora-Italic.ttf
A	.claude/skills/canvas-design/canvas-fonts/Lora-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/Lora-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/NationalPark-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/NationalPark-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/NationalPark-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/NothingYouCouldDo-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/NothingYouCouldDo-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/Outfit-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/Outfit-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/Outfit-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/PixelifySans-Medium.ttf
A	.claude/skills/canvas-design/canvas-fonts/PixelifySans-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/PoiretOne-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/PoiretOne-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/RedHatMono-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/RedHatMono-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/RedHatMono-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/Silkscreen-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/Silkscreen-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/SmoochSans-Medium.ttf
A	.claude/skills/canvas-design/canvas-fonts/SmoochSans-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/Tektur-Medium.ttf
A	.claude/skills/canvas-design/canvas-fonts/Tektur-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/Tektur-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/WorkSans-Bold.ttf
A	.claude/skills/canvas-design/canvas-fonts/WorkSans-BoldItalic.ttf
A	.claude/skills/canvas-design/canvas-fonts/WorkSans-Italic.ttf
A	.claude/skills/canvas-design/canvas-fonts/WorkSans-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/WorkSans-Regular.ttf
A	.claude/skills/canvas-design/canvas-fonts/YoungSerif-OFL.txt
A	.claude/skills/canvas-design/canvas-fonts/YoungSerif-Regular.ttf
A	.claude/skills/context-session/SKILL.md
A	.claude/skills/deploy-railway/SKILL.md
A	.claude/skills/doc-coauthoring/SKILL.md
A	.claude/skills/docx/LICENSE.txt
A	.claude/skills/docx/SKILL.md
A	.claude/skills/docx/docx-js.md
A	.claude/skills/docx/ooxml.md
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/dml-chart.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/dml-chartDrawing.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/dml-diagram.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/dml-lockedCanvas.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/dml-main.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/dml-picture.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/dml-spreadsheetDrawing.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/dml-wordprocessingDrawing.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/pml.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/shared-additionalCharacteristics.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/shared-bibliography.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/shared-commonSimpleTypes.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/shared-customXmlDataProperties.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/shared-customXmlSchemaProperties.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesCustom.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesVariantTypes.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/shared-math.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/shared-relationshipReference.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/sml.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/vml-main.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/vml-officeDrawing.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/vml-presentationDrawing.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/vml-spreadsheetDrawing.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/vml-wordprocessingDrawing.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/wml.xsd
A	.claude/skills/docx/ooxml/schemas/ISO-IEC29500-4_2016/xml.xsd
A	.claude/skills/docx/ooxml/schemas/ecma/fouth-edition/opc-contentTypes.xsd
A	.claude/skills/docx/ooxml/schemas/ecma/fouth-edition/opc-coreProperties.xsd
A	.claude/skills/docx/ooxml/schemas/ecma/fouth-edition/opc-digSig.xsd
A	.claude/skills/docx/ooxml/schemas/ecma/fouth-edition/opc-relationships.xsd
A	.claude/skills/docx/ooxml/schemas/mce/mc.xsd
A	.claude/skills/docx/ooxml/schemas/microsoft/wml-2010.xsd
A	.claude/skills/docx/ooxml/schemas/microsoft/wml-2012.xsd
A	.claude/skills/docx/ooxml/schemas/microsoft/wml-2018.xsd
A	.claude/skills/docx/ooxml/schemas/microsoft/wml-cex-2018.xsd
A	.claude/skills/docx/ooxml/schemas/microsoft/wml-cid-2016.xsd
A	.claude/skills/docx/ooxml/schemas/microsoft/wml-sdtdatahash-2020.xsd
A	.claude/skills/docx/ooxml/schemas/microsoft/wml-symex-2015.xsd
A	.claude/skills/docx/ooxml/scripts/pack.py
A	.claude/skills/docx/ooxml/scripts/unpack.py
A	.claude/skills/docx/ooxml/scripts/validate.py
A	.claude/skills/docx/ooxml/scripts/validation/__init__.py
A	.claude/skills/docx/ooxml/scripts/validation/base.py
A	.claude/skills/docx/ooxml/scripts/validation/docx.py
A	.claude/skills/docx/ooxml/scripts/validation/pptx.py
A	.claude/skills/docx/ooxml/scripts/validation/redlining.py
A	.claude/skills/docx/scripts/__init__.py
A	.claude/skills/docx/scripts/document.py
A	.claude/skills/docx/scripts/templates/comments.xml
A	.claude/skills/docx/scripts/templates/commentsExtended.xml
A	.claude/skills/docx/scripts/templates/commentsExtensible.xml
A	.claude/skills/docx/scripts/templates/commentsIds.xml
A	.claude/skills/docx/scripts/templates/people.xml
A	.claude/skills/docx/scripts/utilities.py
A	.claude/skills/frontend-component/SKILL.md
A	.claude/skills/frontend-design/LICENSE.txt
A	.claude/skills/frontend-design/SKILL.md
A	.claude/skills/internal-comms/LICENSE.txt
A	.claude/skills/internal-comms/SKILL.md
A	.claude/skills/internal-comms/examples/3p-updates.md
A	.claude/skills/internal-comms/examples/company-newsletter.md
A	.claude/skills/internal-comms/examples/faq-answers.md
A	.claude/skills/internal-comms/examples/general-comms.md
A	.claude/skills/mcp-builder/LICENSE.txt
A	.claude/skills/mcp-builder/SKILL.md
A	.claude/skills/mcp-builder/reference/evaluation.md
A	.claude/skills/mcp-builder/reference/mcp_best_practices.md
A	.claude/skills/mcp-builder/reference/node_mcp_server.md
A	.claude/skills/mcp-builder/reference/python_mcp_server.md
A	.claude/skills/mcp-builder/scripts/connections.py
A	.claude/skills/mcp-builder/scripts/evaluation.py
A	.claude/skills/mcp-builder/scripts/example_evaluation.xml
A	.claude/skills/mcp-builder/scripts/requirements.txt
A	.claude/skills/pdf/LICENSE.txt
A	.claude/skills/pdf/SKILL.md
A	.claude/skills/pdf/forms.md
A	.claude/skills/pdf/reference.md
A	.claude/skills/pdf/scripts/check_bounding_boxes.py
A	.claude/skills/pdf/scripts/check_bounding_boxes_test.py
A	.claude/skills/pdf/scripts/check_fillable_fields.py
A	.claude/skills/pdf/scripts/convert_pdf_to_images.py
A	.claude/skills/pdf/scripts/create_validation_image.py
A	.claude/skills/pdf/scripts/extract_form_field_info.py
A	.claude/skills/pdf/scripts/fill_fillable_fields.py
A	.claude/skills/pdf/scripts/fill_pdf_form_with_annotations.py
A	.claude/skills/pptx/LICENSE.txt
A	.claude/skills/pptx/SKILL.md
A	.claude/skills/pptx/html2pptx.md
A	.claude/skills/pptx/ooxml.md
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/dml-chart.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/dml-chartDrawing.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/dml-diagram.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/dml-lockedCanvas.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/dml-main.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/dml-picture.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/dml-spreadsheetDrawing.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/dml-wordprocessingDrawing.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/pml.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/shared-additionalCharacteristics.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/shared-bibliography.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/shared-commonSimpleTypes.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/shared-customXmlDataProperties.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/shared-customXmlSchemaProperties.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesCustom.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesVariantTypes.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/shared-math.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/shared-relationshipReference.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/sml.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/vml-main.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/vml-officeDrawing.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/vml-presentationDrawing.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/vml-spreadsheetDrawing.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/vml-wordprocessingDrawing.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/wml.xsd
A	.claude/skills/pptx/ooxml/schemas/ISO-IEC29500-4_2016/xml.xsd
A	.claude/skills/pptx/ooxml/schemas/ecma/fouth-edition/opc-contentTypes.xsd
A	.claude/skills/pptx/ooxml/schemas/ecma/fouth-edition/opc-coreProperties.xsd
A	.claude/skills/pptx/ooxml/schemas/ecma/fouth-edition/opc-digSig.xsd
A	.claude/skills/pptx/ooxml/schemas/ecma/fouth-edition/opc-relationships.xsd
A	.claude/skills/pptx/ooxml/schemas/mce/mc.xsd
A	.claude/skills/pptx/ooxml/schemas/microsoft/wml-2010.xsd
A	.claude/skills/pptx/ooxml/schemas/microsoft/wml-2012.xsd
A	.claude/skills/pptx/ooxml/schemas/microsoft/wml-2018.xsd
A	.claude/skills/pptx/ooxml/schemas/microsoft/wml-cex-2018.xsd
A	.claude/skills/pptx/ooxml/schemas/microsoft/wml-cid-2016.xsd
A	.claude/skills/pptx/ooxml/schemas/microsoft/wml-sdtdatahash-2020.xsd
A	.claude/skills/pptx/ooxml/schemas/microsoft/wml-symex-2015.xsd
A	.claude/skills/pptx/ooxml/scripts/pack.py
A	.claude/skills/pptx/ooxml/scripts/unpack.py
A	.claude/skills/pptx/ooxml/scripts/validate.py
A	.claude/skills/pptx/ooxml/scripts/validation/__init__.py
A	.claude/skills/pptx/ooxml/scripts/validation/base.py
A	.claude/skills/pptx/ooxml/scripts/validation/docx.py
A	.claude/skills/pptx/ooxml/scripts/validation/pptx.py
A	.claude/skills/pptx/ooxml/scripts/validation/redlining.py
A	.claude/skills/pptx/scripts/html2pptx.js
A	.claude/skills/pptx/scripts/inventory.py
A	.claude/skills/pptx/scripts/rearrange.py
A	.claude/skills/pptx/scripts/replace.py
A	.claude/skills/pptx/scripts/thumbnail.py
A	.claude/skills/prisma-migrate/SKILL.md
A	.claude/skills/queue-job/SKILL.md
A	.claude/skills/skill-creator/LICENSE.txt
A	.claude/skills/skill-creator/SKILL.md
A	.claude/skills/skill-creator/references/output-patterns.md
A	.claude/skills/skill-creator/references/workflows.md
A	.claude/skills/skill-creator/scripts/init_skill.py
A	.claude/skills/skill-creator/scripts/package_skill.py
A	.claude/skills/skill-creator/scripts/quick_validate.py
A	.claude/skills/slack-gif-creator/LICENSE.txt
A	.claude/skills/slack-gif-creator/SKILL.md
A	.claude/skills/slack-gif-creator/core/easing.py
A	.claude/skills/slack-gif-creator/core/frame_composer.py
A	.claude/skills/slack-gif-creator/core/gif_builder.py
A	.claude/skills/slack-gif-creator/core/validators.py
A	.claude/skills/slack-gif-creator/requirements.txt
A	.claude/skills/test-suite/SKILL.md
A	.claude/skills/theme-factory/LICENSE.txt
A	.claude/skills/theme-factory/SKILL.md
A	.claude/skills/theme-factory/theme-showcase.pdf
A	.claude/skills/theme-factory/themes/arctic-frost.md
A	.claude/skills/theme-factory/themes/botanical-garden.md
A	.claude/skills/theme-factory/themes/desert-rose.md
A	.claude/skills/theme-factory/themes/forest-canopy.md
A	.claude/skills/theme-factory/themes/golden-hour.md
A	.claude/skills/theme-factory/themes/midnight-galaxy.md
A	.claude/skills/theme-factory/themes/modern-minimalist.md
A	.claude/skills/theme-factory/themes/ocean-depths.md
A	.claude/skills/theme-factory/themes/sunset-boulevard.md
A	.claude/skills/theme-factory/themes/tech-innovation.md
A	.claude/skills/vector-search/SKILL.md
A	.claude/skills/web-artifacts-builder/LICENSE.txt
A	.claude/skills/web-artifacts-builder/SKILL.md
A	.claude/skills/web-artifacts-builder/scripts/bundle-artifact.sh
A	.claude/skills/web-artifacts-builder/scripts/init-artifact.sh
A	.claude/skills/web-artifacts-builder/scripts/shadcn-components.tar.gz
A	.claude/skills/webapp-testing/LICENSE.txt
A	.claude/skills/webapp-testing/SKILL.md
A	.claude/skills/webapp-testing/examples/console_logging.py
A	.claude/skills/webapp-testing/examples/element_discovery.py
A	.claude/skills/webapp-testing/examples/static_html_automation.py
A	.claude/skills/webapp-testing/scripts/with_server.py
A	.claude/skills/xlsx/LICENSE.txt
A	.claude/skills/xlsx/SKILL.md
A	.claude/skills/xlsx/recalc.py
M	CLAUDE.md
M	packages/frontend/.gitignore
M	packages/frontend/package.json
A	packages/frontend/public/images/soft-systems-logo-128.png
A	packages/frontend/public/images/soft-systems-logo-256.png
A	packages/frontend/public/images/soft-systems-logo-512.png
A	packages/frontend/public/images/soft-systems-logo-optimized.png
A	packages/frontend/public/images/soft-systems-logo-original.png
M	packages/frontend/public/images/soft-systems-logo.png
M	packages/frontend/src/components/sentient/hero/SystemStatus.tsx
A	packages/frontend/src/components/sentient/pricing/ROICalculator.tsx
M	packages/frontend/src/components/ui/HoloCard.tsx
M	packages/frontend/src/lib/env.ts
M	packages/frontend/src/middleware.ts
A	packages/frontend/src/pages/about.tsx
M	packages/frontend/src/pages/api/intake.ts
A	packages/frontend/src/pages/api/og.tsx
M	packages/frontend/src/pages/hologram-test.tsx
M	packages/frontend/src/pages/index.tsx
M	packages/frontend/src/pages/intake.tsx
M	packages/frontend/src/pages/terminal.tsx
M	packages/frontend/src/styles/globals.css
M	packages/frontend/tailwind.config.cjs
M	packages/frontend/tsconfig.tsbuildinfo
M	packages/frontend/vercel.json
M	pnpm-lock.yaml
M	vercel.json
```

## Session Checkpoints

**Current session state**: See `.claude/session_state.json` (gitignored)

**To reload context after `clear`**:

```bash
pnpm claude:briefing
```

**To get a restart template**:

```bash
pnpm claude:clear
```

**To check compact budget**:

```bash
pnpm claude:compact-guard
```

---

## Quick Reference

### When to use PLANNING MODE

- Adding new features
- Changing existing behavior
- Refactoring across multiple files
- Touching "do not touch" zones
- Architecture changes
- Database schema changes

### When EXECUTION MODE is fine

- Bug fixes (scoped, clear root cause)
- Documentation updates
- Adding tests to existing code
- Formatting/linting fixes
- Configuration tweaks with clear requirements

### Emergency Procedures

**If pre-commit hook fails**:

1. Read the error message
2. Fix the issue
3. Re-stage: `git add .`
4. Try commit again

**If CI fails**:

1. Pull CI logs
2. Reproduce locally: `pnpm ci`
3. Fix and push again

**If you suspect context drift**:

1. Run `pnpm claude:briefing`
2. Review `.claude/session_state.json`
3. Consider starting fresh session with summary

---

_This CLAUDE.md is a living document. Update it as the project evolves._
