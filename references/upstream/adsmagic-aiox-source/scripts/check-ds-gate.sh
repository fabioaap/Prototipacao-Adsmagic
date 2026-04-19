#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SCOPE_PATHS=(
  "$ROOT_DIR/front-end/src/views/contacts"
  "$ROOT_DIR/front-end/src/views/sales"
  "$ROOT_DIR/front-end/src/views/settings"
  "$ROOT_DIR/front-end/src/views/projects"
  "$ROOT_DIR/front-end/src/views/integrations"
  "$ROOT_DIR/front-end/src/components/contacts"
  "$ROOT_DIR/front-end/src/components/sales"
  "$ROOT_DIR/front-end/src/components/settings"
  "$ROOT_DIR/front-end/src/components/projects"
  "$ROOT_DIR/front-end/src/components/integrations"
)

echo "Running design-system gate for core domains..."

check_pattern() {
  local label="$1"
  local pattern="$2"
  local failures

  failures="$(rg -n "$pattern" "${SCOPE_PATHS[@]}" || true)"
  if [[ -n "$failures" ]]; then
    echo
    echo "DS Gate failed: $label"
    echo "$failures"
    return 1
  fi
  return 0
}

FAILED=0

check_pattern "Forbidden import from ui/aesthetic" "from ['\"]@/components/ui/aesthetic" || FAILED=1
check_pattern "Forbidden import from ui/radix" "from ['\"]@/components/ui/radix/" || FAILED=1
check_pattern "Forbidden ModalV2 usage" "from ['\"]@/components/ui/ModalV2\\.vue['\"]|<ModalV2\\b" || FAILED=1

if [[ "$FAILED" -ne 0 ]]; then
  echo
  echo "Fix: use canonical components from @/components/ui/* (see src/components/ui/README.md)."
  exit 1
fi

echo "DS Gate passed."
