#!/bin/bash
set -e

PROJECT_DIR="$HOME/Documents/clean-slate"
cd "$PROJECT_DIR"

export PATH="/opt/homebrew/bin:/opt/homebrew/share/pnpm:/usr/local/bin:$HOME/.local/bin:$PATH"
export HOME="$HOME"

# Snapshot data.json before sync so we can diff project lists afterwards.
BEFORE_SNAPSHOT=$(mktemp -t clean-slate-before)
trap 'rm -f "$BEFORE_SNAPSHOT"' EXIT
if [ -f config/data.json ]; then
  cp config/data.json "$BEFORE_SNAPSHOT"
else
  echo '{}' > "$BEFORE_SNAPSHOT"
fi

pnpm sync
pnpm sync:tools
pnpm sync:toolbox
pnpm sync:reference

# Always log the run (even if nothing changed). The log entry itself flags `changed`.
npx tsx scripts/append-sync-log.ts "$BEFORE_SNAPSHOT" config/data.json

if git diff --quiet config/data.json config/sync-history.jsonl; then
  echo "No changes detected."
  exit 0
fi

git add config/data.json config/sync-history.jsonl
git commit -m "chore: auto-sync project data from ~/Documents/"
git push
echo "Synced and pushed."
