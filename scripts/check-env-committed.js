#!/usr/bin/env node
const { execSync } = require('child_process');

function check(path) {
  try {
    execSync(`git ls-files --error-unmatch ${path}`, { stdio: 'ignore' });
    console.error(
      `ERROR: ${path} is tracked in git. Remove it from the repository and ensure it's listed in .gitignore.`,
    );
    process.exitCode = 1;
  } catch (err) {
    // not tracked — OK
  }
}

check('.env');

if (process.exitCode === 1) {
  console.error('\nCommit aborted: tracked environment files detected.');
  process.exit(1);
}

console.log('No tracked .env files detected.');
