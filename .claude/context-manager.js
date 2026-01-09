#!/usr/bin/env node
/**
 * Elite Context Manager
 * Captures rich context snapshots for seamless session continuity
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONTEXT_DIR = path.join(__dirname, 'contexts');
const MAX_CONTEXTS = 20;

function captureContext(label) {
  if (!fs.existsSync(CONTEXT_DIR)) {
    fs.mkdirSync(CONTEXT_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const contextId = `${timestamp.split('T')[0]}-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const context = {
    id: contextId,
    label,
    timestamp,
    git: {
      branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
      commit: execSync('git rev-parse HEAD').toString().trim(),
      status: execSync('git status --short').toString(),
      recentCommits: execSync('git log -5 --oneline').toString(),
    },
    files: {
      modified: execSync('git diff --name-only').toString().split('\n').filter(Boolean),
      staged: execSync('git diff --cached --name-only').toString().split('\n').filter(Boolean),
    },
    tests: {
      lastRun: new Date().toISOString(),
      // Add test results here
    },
    notes: '',
  };

  const filename = path.join(CONTEXT_DIR, `${contextId}.json`);
  fs.writeFileSync(filename, JSON.stringify(context, null, 2));

  // Cleanup old contexts
  const contexts = fs
    .readdirSync(CONTEXT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(CONTEXT_DIR, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  contexts.slice(MAX_CONTEXTS).forEach((c) => {
    fs.unlinkSync(path.join(CONTEXT_DIR, c.name));
  });

  console.log(`✅ Context saved: ${contextId}`);
  return contextId;
}

function loadContext(contextId) {
  const filename = path.join(CONTEXT_DIR, `${contextId}.json`);
  if (!fs.existsSync(filename)) {
    console.error(`❌ Context not found: ${contextId}`);
    process.exit(1);
  }

  const context = JSON.parse(fs.readFileSync(filename, 'utf8'));

  console.log('\n📋 CONTEXT LOADED');
  console.log('─'.repeat(60));
  console.log(`Label: ${context.label}`);
  console.log(`Time: ${context.timestamp}`);
  console.log(`Branch: ${context.git.branch}`);
  console.log(`Commit: ${context.git.commit.slice(0, 8)}`);
  console.log('\nModified files:');
  context.files.modified.forEach((f) => console.log(`  - ${f}`));
  console.log('\nStaged files:');
  context.files.staged.forEach((f) => console.log(`  - ${f}`));
  console.log('─'.repeat(60));

  return context;
}

function listContexts() {
  if (!fs.existsSync(CONTEXT_DIR)) {
    console.log('No contexts saved yet.');
    return;
  }

  const contexts = fs
    .readdirSync(CONTEXT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const ctx = JSON.parse(fs.readFileSync(path.join(CONTEXT_DIR, f), 'utf8'));
      return ctx;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  console.log('\n📚 SAVED CONTEXTS');
  console.log('─'.repeat(60));
  contexts.forEach((ctx) => {
    console.log(`${ctx.id}`);
    console.log(`  Label: ${ctx.label}`);
    console.log(`  Time: ${ctx.timestamp}`);
    console.log(`  Branch: ${ctx.git.branch}`);
    console.log('');
  });
  console.log('─'.repeat(60));
}

// CLI interface
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'save':
    captureContext(arg || 'checkpoint');
    break;
  case 'load':
    if (!arg) {
      console.error('Usage: context-manager.js load <context-id>');
      process.exit(1);
    }
    loadContext(arg);
    break;
  case 'list':
    listContexts();
    break;
  default:
    console.log('Usage:');
    console.log('  context-manager.js save [label]     - Save current context');
    console.log('  context-manager.js load <id>        - Load saved context');
    console.log('  context-manager.js list             - List all contexts');
}
