#!/usr/bin/env bash
# install-hooks.sh
#
# Installs the SOCELLE-WEB git hooks into .git/hooks/.
# Run once after cloning or whenever hooks are updated:
#
#   bash scripts/install-hooks.sh
#
# Hooks installed:
#   pre-push — runs npx tsc --noEmit + npm run build before every push

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_SRC="$REPO_ROOT/scripts/hooks"
HOOKS_DST="$REPO_ROOT/.git/hooks"

if [ ! -d "$HOOKS_SRC" ]; then
  echo "✖ No scripts/hooks directory found. Nothing to install."
  exit 1
fi

for hook in "$HOOKS_SRC"/*; do
  name="$(basename "$hook")"
  dest="$HOOKS_DST/$name"
  cp "$hook" "$dest"
  chmod +x "$dest"
  echo "✔ Installed .git/hooks/$name"
done

echo ""
echo "Git hooks installed. They will run automatically on the next push."
