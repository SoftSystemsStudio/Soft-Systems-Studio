#!/usr/bin/env node
/**
 * Update CLAUDE.md Auto-updated Commit Context section
 *
 * This script is run automatically by the pre-commit hook to keep
 * CLAUDE.md synchronized with recent commit activity.
 *
 * Features:
 * - Updates timestamp and brief change summary
 * - Shows last 5 commit messages (one-liners)
 * - Keeps the section concise to avoid context bloat
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const CLAUDE_MD_PATH = path.join(__dirname, '..', 'CLAUDE.md');

/**
 * Get staged files and generate a prose summary
 */
async function getStagedFilesSummary() {
  try {
    const { stdout } = await execAsync('git diff --cached --name-status');
    if (!stdout.trim()) {
      return 'No files staged';
    }

    const lines = stdout.trim().split('\n');
    const stats = { added: 0, modified: 0, deleted: 0 };
    const areas = new Set();

    lines.forEach((line) => {
      const match = line.match(/^([AMD])\s+(.+)$/);
      if (match) {
        const [, status, file] = match;
        if (status === 'A') stats.added++;
        if (status === 'M') stats.modified++;
        if (status === 'D') stats.deleted++;

        // Identify area of change
        if (file.startsWith('apps/agent-api')) areas.add('agent-api');
        else if (file.startsWith('apps/voice-receptionist')) areas.add('voice-receptionist');
        else if (file.startsWith('packages/frontend')) areas.add('frontend');
        else if (file.startsWith('packages/')) areas.add('packages');
        else if (file.startsWith('scripts/')) areas.add('scripts');
        else if (file.startsWith('docs/')) areas.add('docs');
        else if (file.startsWith('.claude/')) areas.add('claude-config');
        else areas.add('root');
      }
    });

    // Build prose summary
    const parts = [];
    if (stats.added > 0) parts.push(`${stats.added} added`);
    if (stats.modified > 0) parts.push(`${stats.modified} modified`);
    if (stats.deleted > 0) parts.push(`${stats.deleted} deleted`);

    const fileCount = parts.join(', ');
    const areaList = Array.from(areas).join(', ');

    return `${lines.length} files (${fileCount}) in: ${areaList}`;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

/**
 * Get recent commit messages (one-liners)
 */
async function getRecentCommits(count = 5) {
  try {
    const { stdout } = await execAsync(`git log -${count} --pretty=format:"%h %s (%cr)"`);
    return stdout.trim() || 'No recent commits';
  } catch (error) {
    return 'Not a git repository or no commits yet';
  }
}

/**
 * Build new commit context section
 */
async function buildCommitContext() {
  const timestamp = new Date().toISOString();
  const stagedSummary = await getStagedFilesSummary();
  const recentCommits = await getRecentCommits();

  let section = `## Auto-updated Commit Context\n\n`;
  section += `**Managed by pre-commit hook** (\`scripts/update-claude-context.js\`)\n\n`;
  section += `_This section auto-populates with recent activity to help Claude maintain continuity._\n\n`;
  section += `**Last updated**: ${timestamp}\n\n`;
  section += `**Staged changes**: ${stagedSummary}\n\n`;
  section += `**Recent commits**:\n\n`;
  section += `\`\`\`text\n${recentCommits}\n\`\`\`\n`;

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
