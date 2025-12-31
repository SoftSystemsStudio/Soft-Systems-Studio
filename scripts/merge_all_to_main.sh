#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
MERGE_BRANCH="merge/all-to-main-${TIMESTAMP}"
echo "Using merge branch: $MERGE_BRANCH"

git fetch --all --prune

# Ensure local main exists and is up-to-date
if git show-ref --verify --quiet refs/heads/main; then
  git checkout main
  git pull origin main
else
  git checkout -b main origin/main
fi

# Create merge branch from main
git checkout -b "$MERGE_BRANCH"

failed=()

# Build list of remote branches (strip origin/), excluding main, HEAD and stray "origin" entry
branches=$(git for-each-ref --format='%(refname:short)' refs/remotes/origin | sed 's@^origin/@@' | grep -vE '^(HEAD$|main$|origin$)')

for b in $branches; do
  echo "\n--- Merging origin/$b into $MERGE_BRANCH ---"
  # First try: normal merge but disable GPG signing for the merge commit
  if git -c commit.gpgSign=false merge --no-edit "origin/$b"; then
    echo "Merged origin/$b"
  else
    echo "Initial merge failed for origin/$b; aborting and retrying with -X theirs"
    git merge --abort || true
    # Second try: favor 'theirs' for conflicting files to accept upstream changes
    if git -c commit.gpgSign=false merge -s recursive -X theirs --no-edit "origin/$b"; then
      echo "Merged origin/$b using -X theirs"
    else
      echo "Conflict when merging origin/$b even with -X theirs; aborting and recording failure"
      git merge --abort || true
      failed+=("$b")
    fi
  fi
done

# Summary
if [ ${#failed[@]} -eq 0 ]; then
  echo "\nAll branches merged successfully into $MERGE_BRANCH"
else
  echo "\nMerges completed with failures. Failed branches: ${failed[*]}"
fi

# Push the merge branch
git push --set-upstream origin "$MERGE_BRANCH"

echo "Merge branch pushed: $MERGE_BRANCH"
if [ ${#failed[@]} -ne 0 ]; then
  echo "Please resolve conflicts for the failed branches locally or in separate PRs."
fi
