#!/usr/bin/env bash
# license-checker -- JS_V20_VITE_NPM_MONO (Node 20).
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
# shellcheck source=/dev/null
. "$ROOT/Tool Triggering (Synthetic Data)/_skip.sh"

mkdir -p "$ROOT/reports"
cd "$ROOT"

require_binary "license-checker" "license-checker"

if [ ! -d "$ROOT/node_modules" ]; then
  echo "NOTE: installing dependencies for license-checker (offline when lockfile present)"
  npm ci --no-audit --no-fund --ignore-scripts 2>/dev/null || npm install --no-audit --no-fund --ignore-scripts
fi

license-checker --json --excludePrivatePackages --out "$ROOT/reports/licenses.json"
rc=$?

if [ -s "$ROOT/reports/licenses.json" ] && [ "$(cat "$ROOT/reports/licenses.json")" != "{}" ]; then
  accept_findings "license-checker" "$rc" "reports/licenses.json"
  exit $?
fi
_status "license-checker" "FAILED" "empty licenses.json"
exit 1