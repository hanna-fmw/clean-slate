#!/bin/bash
set -e

PROJECT_DIR="$HOME/Documents/clean-slate"
cd "$PROJECT_DIR"

export PATH="/opt/homebrew/bin:/opt/homebrew/share/pnpm:/usr/local/bin:$HOME/.local/bin:$PATH"
export HOME="$HOME"

pnpm sync
pnpm sync:tools
pnpm sync:toolbox

if git diff --quiet config/data.json; then
  echo "No changes detected."
  exit 0
fi

git add config/data.json
git commit -m "chore: auto-sync project data from ~/Documents/"
git push
echo "Synced and pushed."
