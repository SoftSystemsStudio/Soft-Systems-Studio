#!/usr/bin/env node
const { spawnSync } = require('child_process');

function checkGitLfs() {
  try {
    const res = spawnSync('git', ['lfs', 'version'], { stdio: 'ignore' });
    if (res.status === 0) {
      console.log('git-lfs is installed and available.');
      return 0;
    }
  } catch (e) {
    // fallthrough
  }

  console.error('\n⚠️  git-lfs not found on this machine.');
  console.error(
    'If you plan to push from this environment (devcontainer or host), install git-lfs and run `git lfs install --system`.',
  );
  console.error('\nInstallation examples:');
  console.error('  Debian/Ubuntu (host or container):');
  console.error(
    '    curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash',
  );
  console.error('    sudo apt-get install -y git-lfs');
  console.error('    git lfs install --system');
  console.error('\n  macOS (Homebrew):');
  console.error('    brew install git-lfs');
  console.error('    git lfs install --system');
  console.error(
    '\nAfter installation, re-run your git push (you may need to re-open your shell).\n',
  );
  return 1;
}

process.exitCode = checkGitLfs();
