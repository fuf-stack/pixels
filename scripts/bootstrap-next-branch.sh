#!/bin/bash
set -e

# Bootstrap script for creating/updating the 'next' prerelease branch
# Usage: ./scripts/bootstrap-next-branch.sh

BRANCH_NAME="next"
MANIFEST_FILE=".release-please-manifest.json"
NEXT_MANIFEST_FILE=".release-please-manifest-next.json"

echo "🚀 Bootstrapping '$BRANCH_NAME' branch for prereleases..."

# Ensure we're on main and up to date
git checkout main
git pull origin main

# Create or switch to next branch
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "📌 Branch '$BRANCH_NAME' exists, switching to it..."
  git checkout "$BRANCH_NAME"
  git merge main --no-edit
else
  echo "🌱 Creating new branch '$BRANCH_NAME' from main..."
  git checkout -b "$BRANCH_NAME"
fi

# Generate next manifest with major version bumps
echo "📦 Generating $NEXT_MANIFEST_FILE with major version bumps..."
jq 'to_entries | map(.value |= (
  split(".") |
  .[0] = (.[0] | tonumber + 1 | tostring) |
  .[1] = "0" |
  .[2] = "0" |
  join(".")
)) | from_entries' "$MANIFEST_FILE" > "$NEXT_MANIFEST_FILE"

echo "Generated manifest:"
cat "$NEXT_MANIFEST_FILE"

# Commit if there are changes
if ! git diff --quiet "$NEXT_MANIFEST_FILE" 2>/dev/null || [ ! -f "$NEXT_MANIFEST_FILE" ]; then
  git add "$NEXT_MANIFEST_FILE"
  git commit -m "chore: bootstrap next branch manifest with major version bumps"
  echo "✅ Committed $NEXT_MANIFEST_FILE"
else
  echo "ℹ️  No changes to commit"
fi

echo ""
echo "🎉 Done! Next steps:"
echo "   1. Review the changes: git diff main"
echo "   2. Push the branch: git push -u origin $BRANCH_NAME"
echo "   3. Make changes and push to trigger prerelease workflow"
