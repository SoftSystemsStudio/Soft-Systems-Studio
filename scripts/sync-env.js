#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseEnv(content) {
  const lines = content.split(/\r?\n/);
  const map = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    const value = trimmed.slice(idx + 1);
    map[key] = value;
  }
  return map;
}

function mergeExampleIntoEnv(examplePath, envPath) {
  if (!fs.existsSync(examplePath)) {
    console.warn(`example not found: ${examplePath}`);
    return;
  }
  const example = fs.readFileSync(examplePath, 'utf8');
  const exMap = parseEnv(example);

  let envMap = {};
  let envLines = [];
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envMap = parseEnv(envContent);
    envLines = envContent.split(/\r?\n/);
  }

  const toAppend = [];
  for (const [k, v] of Object.entries(exMap)) {
    if (!(k in envMap)) {
      toAppend.push(`${k}=${v}`);
    }
  }

  if (toAppend.length === 0) {
    console.log(`No changes needed for ${envPath}`);
    return;
  }

  const header = `# Appended from ${path.basename(examplePath)} on ${new Date().toISOString()}`;
  const appended = '\n' + header + '\n' + toAppend.join('\n') + '\n';

  fs.appendFileSync(envPath, appended, 'utf8');
  console.log(`Updated ${envPath} with ${toAppend.length} keys from ${path.basename(examplePath)}`);
}

function run() {
  const pairs = [
    { example: path.resolve(process.cwd(), '.env.example'), env: path.resolve(process.cwd(), '.env') },
    { example: path.resolve(process.cwd(), 'apps/agent-api/.env.example'), env: path.resolve(process.cwd(), 'apps/agent-api/.env') },
  ];

  for (const p of pairs) {
    // ensure env file exists (create empty if not)
    if (!fs.existsSync(p.env)) {
      fs.writeFileSync(p.env, `# Created from ${path.basename(p.example)}\n`, 'utf8');
      console.log(`Created ${p.env}`);
    }
    mergeExampleIntoEnv(p.example, p.env);
  }
}

run();
