#!/usr/bin/env bash
# cyclonedx-npm -- SBOM for JS_V20_VITE_NPM_MONO (Node 20).
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
# shellcheck source=/dev/null
. "$ROOT/Tool Triggering (Synthetic Data)/_skip.sh"

mkdir -p "$ROOT/reports"
cd "$ROOT"

require_binary "cyclonedx-npm" "cyclonedx-npm"

if [ ! -f "$ROOT/package-lock.json" ] && [ ! -f "$ROOT/npm-shrinkwrap.json" ]; then
  echo "STATUS: FAILED"
  echo "  tool  : cyclonedx-npm"
  echo "  reason: package-lock.json required (see trigger.yaml)"
  exit 1
fi

cyclonedx-npm \
  --output-format JSON \
  --output-file "$ROOT/reports/cyclonedx-bom.json" \
  --ignore-npm-errors \
  --no-validate \
  --package-lock-only \
  "$ROOT/package.json"
rc=$?

if [ -s "$ROOT/reports/cyclonedx-bom.json" ]; then
  accept_findings "cyclonedx-npm" "$rc" "reports/cyclonedx-bom.json"
  exit $?
fi
_status "cyclonedx-npm" "FAILED" "empty bom"
exit 1