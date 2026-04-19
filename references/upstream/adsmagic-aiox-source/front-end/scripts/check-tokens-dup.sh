#!/usr/bin/env bash
set -euo pipefail

MAIN="front-end/src/assets/styles/main.css"
TOKENS="front-end/src/assets/styles/tokens.css"

if [[ ! -f "$MAIN" ]]; then
  echo "Error: $MAIN not found"
  exit 1
fi

if [[ ! -f "$TOKENS" ]]; then
  echo "Error: $TOKENS not found"
  exit 1
fi

echo "Checking duplicated CSS variables between semantic and product layers..."

vars_main=$(grep -oE "--[a-zA-Z0-9-]+:" "$MAIN" | sed 's/:$//')
vars_tokens=$(grep -oE "--[a-zA-Z0-9-]+:" "$TOKENS" | sed 's/:$//')

dups=$(comm -12 <(echo "$vars_main" | sort) <(echo "$vars_tokens" | sort) || true)

if [[ -n "$dups" ]]; then
  echo "Found duplicated variables:"
  echo "$dups"
  exit 1
fi

echo "No duplicates found."