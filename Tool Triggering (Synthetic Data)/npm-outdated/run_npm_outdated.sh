#!/usr/bin/env bash
# npm outdated -- JS_V20_VITE_NPM_MONO (Node 20).
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
# shellcheck source=/dev/null
. "$ROOT/Tool Triggering (Synthetic Data)/_skip.sh"

mkdir -p "$ROOT/reports"
cd "$ROOT"

if [ ! -f "$ROOT/package-lock.json" ]; then
  echo "NOTE: generating package-lock.json for outdated scan"
  npm install --package-lock-only --no-audit --no-fund 2>/dev/null || true
fi

FINDINGS_EXIT=1
FINDINGS_RC_MAX=1
npm outdated --json --long --all > "$ROOT/reports/npm-outdated.json"
rc=$?
accept_findings "npm-outdated" "$rc" "reports/npm-outdated.json"
exit $?