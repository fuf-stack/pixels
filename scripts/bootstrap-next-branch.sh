#!/bin/bash
set -e

# Bootstrap script for creating/updating the 'next' prerelease branch
# Usage: ./scripts/bootstrap-next-branch.sh

BRANCH_NAME="next"
MANIFEST_FILE=".release-please-manifest.json"
NEXT_MANIFEST_FILE=".release-please-manifest-next.json"
NEXT_CONFIG_FILE="release-please-config-next.json"

echo "🚀 Bootstrapping '$BRANCH_NAME' branch for prereleases..."

# Ensure we're on main and up to date
git checkout main
git pull origin main

# Get current SHA to use as last-release-sha (ignore commits before this point)
BOOTSTRAP_SHA=$(git rev-parse HEAD)
echo "📍 Using bootstrap SHA: $BOOTSTRAP_SHA"

# Create or switch to next branch
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "📌 Branch '$BRANCH_NAME' exists, switching to it..."
  git checkout "$BRANCH_NAME"
  git merge main --no-edit
else
  echo "🌱 Creating new branch '$BRANCH_NAME' from main..."
  git checkout -b "$BRANCH_NAME"
fi

# Generate next manifest based on main versions + prerelease suffix.
# Example: 0.13.1 -> 0.13.1-next.0
#
# Re-run this script whenever main versions change; it will refresh the base
# version and reset the prerelease counter to .0 for affected packages.
echo "📦 Generating $NEXT_MANIFEST_FILE from $MANIFEST_FILE (keeping base version)..."
jq 'to_entries
  | map(.value |= (
      # Extract plain x.y.z from possible semver strings and append prerelease.
      # We intentionally reset the prerelease counter when the base changes.
      (capture("^(?<major>[0-9]+)\\.(?<minor>[0-9]+)\\.(?<patch>[0-9]+)")
        | "\(.major).\(.minor).\(.patch)-next.0")
    ))
  | from_entries' "$MANIFEST_FILE" > "$NEXT_MANIFEST_FILE"

echo "Generated manifest:"
cat "$NEXT_MANIFEST_FILE"

# Update config with last-release-sha to ignore commits before branch point
echo "📝 Updating $NEXT_CONFIG_FILE with last-release-sha..."
jq --arg sha "$BOOTSTRAP_SHA" '. + {"last-release-sha": $sha}' "$NEXT_CONFIG_FILE" > "${NEXT_CONFIG_FILE}.tmp"
mv "${NEXT_CONFIG_FILE}.tmp" "$NEXT_CONFIG_FILE"

echo "Updated config:"
cat "$NEXT_CONFIG_FILE"

# Commit changes
git add "$NEXT_MANIFEST_FILE" "$NEXT_CONFIG_FILE"
if ! git diff --cached --quiet; then
  git commit \
    -m "chore: bootstrap next branch for prereleases" \
    -m "Set last-release-sha to $BOOTSTRAP_SHA." \
    -m "This ignores already-released commits."
  echo "✅ Committed changes"
else
  echo "ℹ️  No changes to commit"
fi

echo ""
echo "🎉 Done! Next steps:"
echo "   1. Review the changes: git diff main"
echo "   2. Push the branch: git push -u origin $BRANCH_NAME --force"
echo "   3. Make NEW changes and push to trigger prerelease workflow"
