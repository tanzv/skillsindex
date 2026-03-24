.DEFAULT_GOAL := help

.PHONY: help env-init postgres-up bootstrap init-local verify-frontend-env dev-backend dev-frontend dev dev-status verify-backend verify-frontend verify-frontend-real-backend check-lines

help:
	@printf '%s\n' \
		'SkillsIndex local development commands' \
		'' \
		'  make env-init        Copy missing .env files from examples' \
		'  make postgres-up     Start local PostgreSQL with docker compose' \
		'  make bootstrap       Run backend bootstrap once' \
		'  make init-local      Prepare env, start PostgreSQL, and run bootstrap' \
		'  make verify-frontend-env Verify frontend backend env alignment before startup' \
		'  make dev-backend     Start or reuse backend lcode session' \
		'  make dev-frontend    Start or reuse frontend lcode session' \
		'  make dev             Start or reuse services and show current status' \
		'  make dev-status      Show running lcode sessions in JSON' \
		'  make verify-backend  Run backend tests and vet' \
		'  make verify-frontend Run frontend lint, unit tests, and build' \
		'  make verify-frontend-real-backend Run frontend smoke tests against a real backend (requires a bootstrapped local database)' \
		'  make check-lines     Run repository max-lines check'

env-init:
	@test -f .env || cp .env.example .env
	@test -f backend/.env || cp backend/.env.example backend/.env
	@test -f frontend-next/.env || cp frontend-next/.env.example frontend-next/.env

postgres-up:
	docker compose up -d postgres

bootstrap:
	cd backend && go run ./cmd/bootstrap

init-local: env-init postgres-up bootstrap

verify-frontend-env:
	python3 scripts/dev/check_frontend_backend_env.py

dev-backend:
	python3 scripts/dev/run_lcode_profile.py skillsindex-backend

dev-frontend: verify-frontend-env
	python3 scripts/dev/run_lcode_profile.py skillsindex-frontend

dev: dev-backend dev-frontend dev-status

dev-status:
	lcode running --json

verify-backend:
	cd backend && go test ./... && go vet ./...

verify-frontend:
	cd frontend-next && npm run lint && npm run test:unit && npm run build

verify-frontend-real-backend:
	./scripts/run_frontend_real_backend_smoke.sh

check-lines:
	./scripts/check_max_lines.sh
