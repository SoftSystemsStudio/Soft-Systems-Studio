#!/usr/bin/env node
/**
 * Generate a compact repo summary for fresh Claude Code sessions
 *
 * This script outputs essential context to quickly onboard Claude after
 * a context clear or when starting a new session.
 *
 * Usage: pnpm claude:briefing
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

async function getStagedFiles() {
  try {
    const { stdout } = await execAsync('git diff --cached --name-only');
    return stdout.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

async function getRecentCommits(count = 5) {
  try {
    const { stdout } = await execAsync(
      `git log -${count} --pretty=format:"%h - %s (%cr)" --no-merges`,
    );
    return stdout.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

async function getCurrentBranch() {
  try {
    const { stdout } = await execAsync('git branch --show-current');
    return stdout.trim() || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

async function getUncommittedChanges() {
  try {
    const { stdout } = await execAsync('git status --short');
    return stdout.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

async function readSessionState() {
  const stateFile = path.join(__dirname, '..', '.claude', 'session_state.json');
  try {
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    }
  } catch (error) {
    // Ignore errors, return default
  }
  return {
    current_mode: 'EXECUTION',
    objective: '',
    compact_count: 0,
    assumptions: [],
    open_questions: [],
    next_actions: [],
  };
}

async function generateBriefing() {
  const branch = await getCurrentBranch();
  const stagedFiles = await getStagedFiles();
  const uncommitted = await getUncommittedChanges();
  const recentCommits = await getRecentCommits();
  const sessionState = await readSessionState();

  console.log('═'.repeat(80));
  console.log('CLAUDE CODE REPO BRIEFING');
  console.log('═'.repeat(80));
  console.log();

  // Repository Overview
  console.log('## Repository Overview');
  console.log();
  console.log('**Name**: Soft Systems Studio');
  console.log('**Type**: TypeScript monorepo (pnpm workspaces)');
  console.log('**Purpose**: Multi-tenant AI agent platform');
  console.log();

  // Tech Stack
  console.log('## Tech Stack');
  console.log();
  console.log('- Runtime: Node.js + TypeScript 5.3+');
  console.log('- API: Express + Prisma (PostgreSQL)');
  console.log('- Frontend: Next.js 16');
  console.log('- Queue: Redis + BullMQ');
  console.log('- Vector DB: Qdrant');
  console.log('- Testing: Jest + supertest');
  console.log('- Linting: ESLint + Prettier');
  console.log('- Package Manager: pnpm@8.11.0');
  console.log();

  // Directory Structure
  console.log('## Key Directories');
  console.log();
  console.log('/apps/');
  console.log('  ├── agent-api/           # Main Express API');
  console.log('  └── voice-receptionist/  # Vapi.ai voice integration');
  console.log('/packages/');
  console.log('  ├── frontend/            # Next.js app');
  console.log('  ├── agent-orchestrator/  # Agent execution engine');
  console.log('  ├── agent-customer-service/ # Customer service agent');
  console.log('  ├── agency-core/         # Shared business logic');
  console.log('  ├── api/                 # Legacy API utilities');
  console.log('  └── core-llm/            # LLM abstractions');
  console.log('/scripts/                  # Automation scripts');
  console.log('/docs/                     # Architecture & deployment docs');
  console.log();

  // Common Commands
  console.log('## Common Commands');
  console.log();
  console.log('pnpm install          # Install dependencies');
  console.log('pnpm dev              # Start agent-api + frontend');
  console.log('pnpm build            # Build all packages');
  console.log('pnpm test             # Run all tests');
  console.log('pnpm lint             # Lint all packages');
  console.log('pnpm typecheck        # TypeScript check');
  console.log('pnpm ci               # Full CI suite locally');
  console.log();
  console.log('pnpm claude:briefing  # This command');
  console.log('pnpm claude:clear     # Context restart template');
  console.log('pnpm claude:compact-guard # Check compact count');
  console.log();

  // Current Git State
  console.log('## Current Git State');
  console.log();
  console.log(`Branch: ${branch}`);
  console.log();

  if (stagedFiles.length > 0) {
    console.log('**Staged files**:');
    stagedFiles.forEach((file) => console.log(`  ✓ ${file}`));
    console.log();
  }

  if (uncommitted.length > 0) {
    console.log('**Uncommitted changes**:');
    uncommitted.slice(0, 10).forEach((line) => console.log(`  ${line}`));
    if (uncommitted.length > 10) {
      console.log(`  ... and ${uncommitted.length - 10} more`);
    }
    console.log();
  }

  if (stagedFiles.length === 0 && uncommitted.length === 0) {
    console.log('Working directory clean');
    console.log();
  }

  // Recent Commits
  if (recentCommits.length > 0) {
    console.log('**Recent commits**:');
    recentCommits.forEach((commit) => console.log(`  ${commit}`));
    console.log();
  }

  // Session State
  console.log('## Session State');
  console.log();
  console.log(`Mode: ${sessionState.current_mode}`);
  console.log(`Compact Count: ${sessionState.compact_count}/3`);
  if (sessionState.objective) {
    console.log(`Objective: ${sessionState.objective}`);
  }
  if (sessionState.open_questions && sessionState.open_questions.length > 0) {
    console.log('Open Questions:');
    sessionState.open_questions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
  }
  if (sessionState.next_actions && sessionState.next_actions.length > 0) {
    console.log('Next Actions:');
    sessionState.next_actions.forEach((a, i) => console.log(`  ${i + 1}. ${a}`));
  }
  console.log();

  // Important Reminders
  console.log('## Important Reminders');
  console.log();
  console.log('- See CLAUDE.md for full operating runbook');
  console.log('- Use PLANNING MODE for features/refactors (write plan to docs/plans/)');
  console.log('- Never commit .env files or edit Prisma migrations manually');
  console.log('- All commits must pass: secretlint, lint, typecheck');
  console.log('- Pre-commit hook auto-updates CLAUDE.md commit context');
  console.log();

  console.log('═'.repeat(80));
  console.log('Ready to continue work!');
  console.log('═'.repeat(80));
}

generateBriefing().catch((error) => {
  console.error('Error generating briefing:', error);
  process.exit(1);
});
