#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PORT="${SKILLSINDEX_SMOKE_BACKEND_PORT:-38151}"
FRONTEND_PORT="${SKILLSINDEX_SMOKE_FRONTEND_PORT:-33951}"
BACKEND_BASE_URL="http://127.0.0.1:${BACKEND_PORT}"
BACKEND_PID=""

cleanup() {
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
    wait "${BACKEND_PID}" 2>/dev/null || true
  fi
}

wait_for_backend() {
  local attempt

  for attempt in $(seq 1 120); do
    if curl -fsS "${BACKEND_BASE_URL}/api/v1/auth/csrf" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Timed out waiting for backend at ${BACKEND_BASE_URL}" >&2
  return 1
}

trap cleanup EXIT

cd "${ROOT_DIR}/backend"
APP_PORT="${BACKEND_PORT}" go run ./cmd/server >/tmp/skillsindex-real-backend-smoke.log 2>&1 &
BACKEND_PID=$!

wait_for_backend

cd "${ROOT_DIR}/frontend-next"
PLAYWRIGHT_BACKEND_BASE_URL="${BACKEND_BASE_URL}" \
PLAYWRIGHT_FRONTEND_PORT="${FRONTEND_PORT}" \
npm run test:e2e:real-backend -- tests/e2e/public-marketplace-real-backend.spec.ts
