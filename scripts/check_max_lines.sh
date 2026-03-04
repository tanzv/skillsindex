#!/usr/bin/env bash

set -euo pipefail

SOFT_MAX="${SOFT_MAX:-400}"
HARD_MAX="${HARD_MAX:-600}"

if ! command -v rg >/dev/null 2>&1; then
  echo "error: rg (ripgrep) is required" >&2
  exit 2
fi

files=()
while IFS= read -r file; do
  files+=("${file}")
done < <(
  rg --files \
    -g '!**/.git/**' \
    -g '!**/node_modules/**' \
    -g '!**/dist/**' \
    -g '!**/build/**' \
    -g '!docs/**' \
    -g '!user-docs/**' \
    -g '*.go' \
    -g '*.py' \
    -g '*.js' \
    -g '*.ts' \
    -g '*.tsx' \
    -g '*.jsx' \
    -g '*.xml' \
    -g '*.css' \
    -g '*.scss' \
    -g '*.sh'
)

if [ "${#files[@]}" -eq 0 ]; then
  echo "No source files found."
  exit 0
fi

hard_failed=0
soft_warned=0

echo "Line limit check (soft <= ${SOFT_MAX}, hard <= ${HARD_MAX})"
for file in "${files[@]}"; do
  line_count="$(wc -l <"${file}")"
  line_count="${line_count//[[:space:]]/}"
  if [ -z "${line_count}" ]; then
    line_count=0
  fi

  if [ "${line_count}" -gt "${HARD_MAX}" ]; then
    printf 'HARD VIOLATION  %5d  %s\n' "${line_count}" "${file}"
    hard_failed=1
    continue
  fi

  if [ "${line_count}" -gt "${SOFT_MAX}" ]; then
    printf 'SOFT WARNING    %5d  %s\n' "${line_count}" "${file}"
    soft_warned=1
  fi
done

if [ "${hard_failed}" -ne 0 ]; then
  echo "Failed: hard max-lines violations detected."
  exit 1
fi

if [ "${soft_warned}" -ne 0 ]; then
  echo "Passed with soft warnings."
else
  echo "Passed."
fi
