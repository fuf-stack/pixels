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

# Generate next manifest with major version bumps + prerelease suffix
echo "📦 Generating $NEXT_MANIFEST_FILE with major version bumps..."
jq 'to_entries | map(.value |= (
  split(".") |
  .[0] = (.[0] | tonumber + 1 | tostring) |
  .[1] = "0" |
  .[2] = "0-next.0" |
  join(".")
)) | from_entries' "$MANIFEST_FILE" > "$NEXT_MANIFEST_FILE"

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
  git commit -m "chore: bootstrap next branch for prereleases

Sets last-release-sha to $BOOTSTRAP_SHA to ignore already-released commits."
  echo "✅ Committed changes"
else
  echo "ℹ️  No changes to commit"
fi

echo ""
echo "🎉 Done! Next steps:"
echo "   1. Review the changes: git diff main"
echo "   2. Push the branch: git push -u origin $BRANCH_NAME --force"
echo "   3. Make NEW changes and push to trigger prerelease workflow"
