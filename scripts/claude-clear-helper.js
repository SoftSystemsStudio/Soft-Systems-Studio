#!/usr/bin/env node
/**
 * Generate a structured "restart packet" template after context clear
 *
 * This script outputs a template to help resume work after running 'clear'
 * in a Claude Code session, following the CLAUDE.md Clear Protocol.
 *
 * Usage: pnpm claude:clear
 */

const fs = require('fs');
const path = require('path');

function readSessionState() {
  const stateFile = path.join(__dirname, '..', '.claude', 'session_state.json');
  try {
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    }
  } catch (error) {
    // Return default if file doesn't exist or can't be read
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

function generateClearTemplate() {
  const state = readSessionState();

  console.log('═'.repeat(80));
  console.log('CLAUDE CODE CONTEXT RESTART TEMPLATE');
  console.log('═'.repeat(80));
  console.log();
  console.log('Copy and paste the filled-out template below to resume your session:');
  console.log();
  console.log('─'.repeat(80));
  console.log();

  console.log('## Context Restart');
  console.log();

  console.log('### 1. Objective');
  console.log();
  if (state.objective) {
    console.log(`**Current objective**: ${state.objective}`);
  } else {
    console.log('**Current objective**: [Fill in: What are you trying to accomplish?]');
  }
  console.log();

  console.log('### 2. Constraints');
  console.log();
  console.log('**Technical constraints**:');
  console.log('- Must pass: lint, typecheck, tests, secretlint');
  console.log('- No direct process.env access (use typed env modules)');
  console.log('- Follow existing patterns in codebase');
  console.log();
  console.log('**Business constraints**:');
  console.log('- [Add any business rules, deadlines, or requirements]');
  console.log();

  console.log('### 3. Current Plan');
  console.log();
  console.log('**Approach**:');
  console.log('[Describe the chosen implementation approach]');
  console.log();
  console.log('**Steps**:');
  if (state.next_actions && state.next_actions.length > 0) {
    state.next_actions.forEach((action, i) => {
      console.log(`${i + 1}. ${action}`);
    });
  } else {
    console.log('1. [First step]');
    console.log('2. [Second step]');
    console.log('3. [etc.]');
  }
  console.log();

  console.log('**Progress so far**:');
  console.log('[List completed items or current state]');
  console.log();

  console.log('### 4. Open Questions');
  console.log();
  if (state.open_questions && state.open_questions.length > 0) {
    state.open_questions.forEach((q, i) => {
      console.log(`${i + 1}. ${q}`);
    });
  } else {
    console.log('[Any uncertainties or decisions that need clarification?]');
  }
  console.log();

  console.log('### 5. Next Steps');
  console.log();
  console.log('**Immediate next action**:');
  if (state.next_actions && state.next_actions.length > 0) {
    console.log(`- ${state.next_actions[0]}`);
  } else {
    console.log('- [What should be done right now?]');
  }
  console.log();
  console.log('**After that**:');
  console.log('- [Following steps]');
  console.log();

  console.log('### 6. Session Metadata');
  console.log();
  console.log(`**Mode**: ${state.current_mode}`);
  console.log(`**Compact count**: ${state.compact_count}/3`);
  if (state.assumptions && state.assumptions.length > 0) {
    console.log('**Assumptions**:');
    state.assumptions.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a}`);
    });
  }
  console.log();

  console.log('─'.repeat(80));
  console.log();
  console.log('**Tips**:');
  console.log('- Fill in the [bracketed] sections with your specific details');
  console.log('- Update .claude/session_state.json to track your progress');
  console.log('- Run `pnpm claude:briefing` for a quick repo overview');
  console.log('- See CLAUDE.md for the full operating runbook');
  console.log();
  console.log('═'.repeat(80));
}

generateClearTemplate();
