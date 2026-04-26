#!/bin/bash
set -e

PROJECT_DIR="$HOME/Documents/clean-slate"
cd "$PROJECT_DIR"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

pnpm sync

if git diff --quiet config/data.json; then
  echo "No changes detected."
  exit 0
fi

git add config/data.json
git commit -m "chore: auto-sync project data from ~/Documents/"
git push
echo "Synced and pushed."
