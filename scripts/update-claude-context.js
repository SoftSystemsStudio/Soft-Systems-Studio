#!/usr/bin/env node
/**
 * Update CLAUDE.md Auto-updated Commit Context section
 *
 * This script is run automatically by the pre-commit hook to keep
 * CLAUDE.md synchronized with recent commit activity.
 *
 * Features:
 * - Appends timestamp and staged files summary
 * - Maintains rolling window of last 10 commit contexts
 * - Preserves all other sections of CLAUDE.md unchanged
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const CLAUDE_MD_PATH = path.join(__dirname, '..', 'CLAUDE.md');
const MAX_COMMIT_HISTORY = 10;

/**
 * Get staged files summary
 */
async function getStagedFiles() {
  try {
    const { stdout } = await execAsync('git diff --cached --name-status');
    return stdout.trim() || 'No files staged';
  } catch (error) {
    return `Error getting staged files: ${error.message}`;
  }
}

/**
 * Get recent commit messages
 */
async function getRecentCommits(count = 5) {
  try {
    const { stdout } = await execAsync(`git log -${count} --pretty=format:"%h - %s (%cr)"`);
    return stdout.trim() || 'No recent commits';
  } catch (error) {
    return 'Not a git repository or no commits yet';
  }
}

/**
 * Generate summary of changes by directory
 */
function summarizeChanges(stagedFiles) {
  if (!stagedFiles || stagedFiles === 'No files staged') {
    return 'No changes';
  }

  const lines = stagedFiles.split('\n');
  const summary = {};

  lines.forEach((line) => {
    const match = line.match(/^([AMD])\s+(.+)$/);
    if (match) {
      const [, status, file] = match;
      const dir = file.includes('/') ? file.split('/')[0] : 'root';

      if (!summary[dir]) {
        summary[dir] = { A: 0, M: 0, D: 0 };
      }
      summary[dir][status] = (summary[dir][status] || 0) + 1;
    }
  });

  const parts = [];
  for (const [dir, counts] of Object.entries(summary)) {
    const changes = [];
    if (counts.A > 0) changes.push(`${counts.A} added`);
    if (counts.M > 0) changes.push(`${counts.M} modified`);
    if (counts.D > 0) changes.push(`${counts.D} deleted`);
    parts.push(`${dir}/: ${changes.join(', ')}`);
  }

  return parts.join('\n  ');
}

/**
 * Parse existing CLAUDE.md and extract commit history
 */
function parseExistingCommitHistory(content) {
  const historyMatch = content.match(/\*\*Recent commits\*\*:[\s\S]*?(?=\n\n---|\n\n##|$)/);
  if (!historyMatch) {
    return [];
  }

  const historySection = historyMatch[0];
  const entries = [];
  const entryRegex = /### Commit (\d+): (.+?)\n\*\*Staged files\*\*:\n```\n([\s\S]*?)\n```/g;

  let match;
  while ((match = entryRegex.exec(historySection)) !== null) {
    entries.push({
      timestamp: match[2],
      stagedFiles: match[3],
    });
  }

  return entries;
}

/**
 * Build new commit context section
 */
async function buildCommitContext() {
  const timestamp = new Date().toISOString();
  const stagedFiles = await getStagedFiles();
  const recentCommits = await getRecentCommits();
  const changeSummary = summarizeChanges(stagedFiles);

  // Read existing CLAUDE.md to get previous commit history
  let existingHistory = [];
  if (fs.existsSync(CLAUDE_MD_PATH)) {
    const existingContent = fs.readFileSync(CLAUDE_MD_PATH, 'utf8');
    existingHistory = parseExistingCommitHistory(existingContent);
  }

  // Add new entry at the beginning
  existingHistory.unshift({
    timestamp,
    stagedFiles,
  });

  // Keep only last MAX_COMMIT_HISTORY entries
  existingHistory = existingHistory.slice(0, MAX_COMMIT_HISTORY);

  // Build the section
  let section = `## Auto-updated Commit Context\n\n`;
  section += `**Managed by pre-commit hook** (\`scripts/update-claude-context.js\`)\n\n`;
  section += `_This section auto-populates with recent commit context to help Claude maintain continuity._\n\n`;
  section += `**Last updated**: ${timestamp}\n\n`;
  section += `**Current staged changes summary**:\n  ${changeSummary}\n\n`;
  section += `**Recent git commits**:\n\`\`\`\n${recentCommits}\n\`\`\`\n\n`;
  section += `**Recent commits**: (rolling window of last ${MAX_COMMIT_HISTORY})\n\n`;

  // Add historical commit entries
  existingHistory.forEach((entry, index) => {
    section += `### Commit ${index + 1}: ${entry.timestamp}\n\n`;
    section += `**Staged files**:\n\`\`\`\n${entry.stagedFiles}\n\`\`\`\n\n`;
  });

  return section;
}

/**
 * Update CLAUDE.md with new commit context
 */
async function updateClaudeMd() {
  if (!fs.existsSync(CLAUDE_MD_PATH)) {
    console.error('Error: CLAUDE.md not found at', CLAUDE_MD_PATH);
    process.exit(1);
  }

  try {
    // Read existing content
    const content = fs.readFileSync(CLAUDE_MD_PATH, 'utf8');

    // Find the Auto-updated Commit Context section
    const sectionStart = content.indexOf('## Auto-updated Commit Context');

    if (sectionStart === -1) {
      console.error('Error: Could not find "## Auto-updated Commit Context" section in CLAUDE.md');
      process.exit(1);
    }

    // Find the next section (starts with ## or end of file)
    const afterSection = content.slice(sectionStart + 1);
    const nextSectionMatch = afterSection.match(/\n## /);
    const sectionEnd = nextSectionMatch
      ? sectionStart + 1 + nextSectionMatch.index
      : content.length;

    // Build new content
    const beforeSection = content.slice(0, sectionStart);
    const afterSectionContent = content.slice(sectionEnd);
    const newCommitContext = await buildCommitContext();

    const newContent = beforeSection + newCommitContext + afterSectionContent;

    // Write back to file
    fs.writeFileSync(CLAUDE_MD_PATH, newContent, 'utf8');

    // Format CLAUDE.md with Prettier before staging
    await execAsync('npx prettier --write CLAUDE.md');

    // Stage the updated CLAUDE.md
    await execAsync('git add CLAUDE.md');

    console.log('✅ CLAUDE.md commit context updated successfully');
  } catch (error) {
    console.error('Error updating CLAUDE.md:', error.message);
    process.exit(1);
  }
}

// Run the update
updateClaudeMd().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
