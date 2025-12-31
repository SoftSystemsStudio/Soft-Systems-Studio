#!/usr/bin/env node
/**
 * Check session compact count and warn if limit is approaching
 *
 * Per CLAUDE.md governance rules:
 * - Max 3 compacts per session
 * - On attempt #4, must start a new session with summary
 *
 * Usage: pnpm claude:compact-guard
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '.claude', 'session_state.json');
const MAX_COMPACTS = 3;

function readSessionState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Warning: Could not read session state:', error.message);
  }

  // Return default state if file doesn't exist
  return {
    current_mode: 'EXECUTION',
    objective: '',
    compact_count: 0,
    assumptions: [],
    open_questions: [],
    next_actions: [],
  };
}

function checkCompactLimit() {
  const state = readSessionState();
  const count = state.compact_count || 0;

  console.log('═'.repeat(80));
  console.log('COMPACT BUDGET CHECK');
  console.log('═'.repeat(80));
  console.log();

  console.log(`Current compact count: ${count}/${MAX_COMPACTS}`);
  console.log();

  if (count === 0) {
    console.log('✅ Status: GOOD - No compacts used yet in this session');
    console.log();
    console.log('You have plenty of context budget remaining.');
  } else if (count === 1) {
    console.log('✅ Status: GOOD - First compact used');
    console.log();
    console.log(`You have ${MAX_COMPACTS - count} compacts remaining.`);
  } else if (count === 2) {
    console.log('⚠️  Status: WARNING - Second compact used');
    console.log();
    console.log(`You have ${MAX_COMPACTS - count} compact remaining.`);
    console.log('Consider wrapping up this session soon.');
  } else if (count === 3) {
    console.log('🚨 Status: LIMIT REACHED - Third compact used');
    console.log();
    console.log('This is your last compact for this session.');
    console.log();
    console.log('After this compact, you MUST:');
    console.log('1. Complete your current task');
    console.log('2. Prepare a summary of work done');
    console.log('3. Start a NEW session with that summary + next objectives');
  } else {
    console.log('🛑 Status: OVER LIMIT - Too many compacts!');
    console.log();
    console.log('❌ You have exceeded the compact budget for this session.');
    console.log();
    console.log('Required action:');
    console.log('1. Stop current work');
    console.log('2. Create a summary of what you accomplished');
    console.log('3. List remaining objectives');
    console.log('4. START A NEW SESSION and paste the summary');
    console.log();
    console.log('DO NOT continue working in this session.');
    return false;
  }

  console.log();
  console.log('─'.repeat(80));
  console.log('Session state file: .claude/session_state.json');
  console.log('Update compact_count manually when using /clear');
  console.log('─'.repeat(80));
  console.log();

  return count < MAX_COMPACTS;
}

const withinLimit = checkCompactLimit();

// Exit with error code if over limit
process.exit(withinLimit ? 0 : 1);
