#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Patterns that likely indicate real secrets (catch common prefixes)
const secretPatterns = [
  /\bsk-[A-Za-z0-9-_]{8,}\b/, // OpenAI
  /\bSG\.[A-Za-z0-9_-]{8,}\b/, // SendGrid
  /\bAKIA[0-9A-Z]{16}\b/, // AWS Access Key ID
  /\bAIza[0-9A-Za-z-_]{35}\b/, // Google API key
];

// Patterns that indicate placeholder text that shouldn't be present in committed source
const placeholderPatterns = [
  /replace-with[-_\s\w]*/i,
  /your-openai-api-key/i,
  /your-sendgrid-api-key/i,
];

function listTrackedFiles() {
  const out = execSync('git ls-files', { encoding: 'utf8' });
  return out.split(/\r?\n/).filter(Boolean);
}

function isExample(file) {
  return /(^|\/)\.env\.example$/.test(file) || /(^|\/)\.example/.test(file) || file.startsWith('docs/') || file.includes('README');
}

function checkFile(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const matches = [];

    for (const p of secretPatterns) {
      if (p.test(content)) matches.push({ type: 'secret', pattern: p.toString() });
    }
    for (const p of placeholderPatterns) {
      if (p.test(content)) matches.push({ type: 'placeholder', pattern: p.toString() });
    }

    return matches;
  } catch (err) {
    return [];
  }
}

function run() {
  const files = listTrackedFiles();
  const offenders = [];

  for (const f of files) {
    if (isExample(f) || f.startsWith('.github/') || f.endsWith('.md')) continue;
    const m = checkFile(f);
    if (m.length) offenders.push({ file: f, matches: m });
  }

  if (offenders.length) {
    console.error('Detected potential secrets or placeholders in tracked files:');
    for (const o of offenders) {
      console.error(`\nFile: ${o.file}`);
      for (const mm of o.matches) console.error(` - ${mm.type}: ${mm.pattern}`);
    }
    console.error('\nPlease remove secrets from source, move them to .env (ignored), or update the example files instead.');
    process.exit(1);
  }

  console.log('No obvious secrets or disallowed placeholders found in tracked files.');
}

run();
