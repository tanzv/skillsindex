# SkillsIndex

SkillsIndex is a separated frontend-backend system for skill management and synchronization.
The backend is a Go API service layer, and the frontend is a standalone Next.js application.
It supports manual creation, archive uploads, repository sync, tagging, search, and account-level sharing.

## Project Structure

- `backend/`: Go backend code (API service, domain services, models, migrations, templates)
- `frontend-next/`: Next.js frontend code
- `docs/`: requirement and documentation artifacts
- `prototypes/`: design prototype artifacts

## Features

- SkillMP-style marketplace pages:
  - `Marketplace` with keyword and AI semantic search
  - `Categories` and category detail pages
  - `Timeline` growth page
  - `Docs`, `API`, and `About` pages
- Account registration and login (registration can be disabled by config)
- Skill ownership with private/public visibility
- Skill creation and sync sources:
  - Manual Markdown input
  - Zip archive upload (`skill.json` + content file)
  - Git repository sync (`git clone` + metadata extraction)
  - SkillMP import by URL or Skill ID
- Rich skill metadata:
  - Category / subcategory
  - Tags
  - Star count
  - Quality score
  - Install command
- Skill social interactions:
  - Favorite / unfavorite
  - 1-5 rating
  - Comment thread
- Account API key management in dashboard:
  - Create scoped keys
  - Rotate keys
  - Revoke keys
  - Last-used and expire status
- Personal dashboard actions:
  - Visibility switch
  - Repository / SkillMP re-sync
  - Skill version history and snapshot restore
  - Skill deletion
- Repository sync run center:
  - Manual and scheduled run records in `Admin -> Records -> Sync jobs`
  - Run-level summary (scope, candidates, synced, failed, errors)
- Integration operations:
  - Connector create/list views in `Admin -> Integrations`
  - Webhook delivery log view in `Admin -> Integrations -> Webhook logs`
- Incident operations:
  - Incident create/list views in `Admin -> Incidents`
  - Incident response console and postmortem editor
- Moderation operations:
  - Skill and comment report endpoints
  - Admin moderation workspace in dashboard (`/admin/moderation`) with status filters
  - Admin moderation queue, resolve, and reject actions
  - Resolve action linkage:
    - `hidden` skill -> set visibility to `private`
    - `deleted` skill -> set visibility to `private` and replace content
    - `hidden` comment -> replace content with moderation placeholder
    - `deleted` comment -> remove comment row
- Account governance operations:
  - Account status update (`active/disabled`)
  - Force account sign-out
  - Admin password reset
- Audit logs for privileged actions (role update, create/import, sync, visibility, delete)
- Public API with API key auth:
  - `/api/v1/skills/search`
  - `/api/v1/skills/ai-search`
  - `/openapi.json` (OpenAPI 3 spec)
  - `/openapi.yaml` (OpenAPI 3 YAML)
  - `/docs/swagger` (interactive API explorer)
- DingTalk OAuth login + personal temporary authorization:
  - `/auth/dingtalk/start`
  - `/auth/dingtalk/callback`
  - `/api/v1/dingtalk/me` (session-based personal profile proxy)

## Tech Stack

- Backend: Go 1.24, PostgreSQL, GORM, Chi router
- Frontend: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- Frontend quality tooling: ESLint 9, Vitest 4, Playwright 1.58

## Quick Start

Recommended local development workflow:

1. Keep runtime configuration in `backend/.env` and `frontend-next/.env`.
2. Use the root `Makefile` as the shortest local-development entrypoint.
3. Let `lcode` profiles manage frontend and backend processes underneath, while `make dev*` reuses existing sessions when possible.

For the Chinese local-development guide and quick-reference commands, see:

- `docs/user-docs/local-development-launch-code.md`
- `docs/user-docs/local-development-quick-reference.md`

### 1. Prepare local environment once

```bash
make env-init
make postgres-up
make bootstrap
```

Or use the one-shot setup target:

```bash
make init-local
```

### 2. Start services

```bash
make dev
```

Or start them individually:

```bash
make dev-backend
make dev-frontend
```

### 3. Check running sessions

```bash
make dev-status
lcode config show --name skillsindex-frontend --json
lcode config show --name skillsindex-backend --json
```

### 4. Open

```text
Frontend: http://localhost:3000
Backend API: http://localhost:8080
```

### 5. Direct commands behind the make targets

```bash
lcode config run --name skillsindex-backend
lcode config run --name skillsindex-frontend
lcode running --json
```

## Verification Commands

### Frontend

```bash
cd frontend-next
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

### Backend

```bash
cd backend
go test ./...
go vet ./...
go run honnef.co/go/tools/cmd/staticcheck@v0.7.0 ./...
```

### Repository-Wide Maintainability Gate

```bash
./scripts/check_max_lines.sh
```

## Environment Variables

- `APP_PORT`: HTTP port, default `8080`
- `APP_ENV`: runtime environment (`development|production`), default `development`
- `DATABASE_URL`: PostgreSQL DSN
- `SESSION_SECRET`: HMAC secret for session cookies
- `API_ONLY`: if `true`, backend only exposes API and OpenAPI endpoints
- `CORS_ALLOWED_ORIGINS`: comma-separated frontend origins for credentialed CORS (example: `http://localhost:3000`)
- `STORAGE_PATH`: path for uploaded archives, default `./storage`
- `ALLOW_REGISTRATION`: bootstrap value for public registration policy on first start
- `ADMIN_USERNAME`: bootstrap admin username (default `admin`)
- `ADMIN_PASSWORD`: bootstrap admin password (default `Admin123456!`)
- `ADMIN_ROLE`: bootstrap admin role (`super_admin|admin|member|viewer`, default `super_admin`)
- `SKILLMP_BASE_URL`: SkillMP base URL used for Skill ID import
- `SKILLMP_TOKEN`: default SkillMP access token (optional)
- `DINGTALK_CLIENT_ID`: DingTalk OAuth client id
- `DINGTALK_CLIENT_SECRET`: DingTalk OAuth client secret
- `DINGTALK_REDIRECT_URL`: OAuth callback URL, default `http://127.0.0.1:8080/auth/dingtalk/callback`
- `DINGTALK_SCOPE`: OAuth scope, default `openid`
- `DINGTALK_AUTH_BASE_URL`: OAuth auth endpoint base, default `https://login.dingtalk.com/oauth2/auth`
- `DINGTALK_API_BASE_URL`: DingTalk API base, default `https://api.dingtalk.com`
- `API_KEYS`: optional comma-separated static API keys for API routes (default empty)
- `REPO_SYNC_ENABLED`: bootstrap value for repository sync policy (`true/false`, default `false`)
- `REPO_SYNC_INTERVAL`: bootstrap policy interval (`time.ParseDuration`, default `30m`)
- `REPO_SYNC_TIMEOUT`: bootstrap policy timeout per run (`time.ParseDuration`, default `10m`)
- `REPO_SYNC_BATCH_SIZE`: bootstrap policy max repository skills processed per run (default `20`)

The bootstrap account is created or updated on every server start to match these `ADMIN_*` values.
The registration policy is stored in database setting `allow_registration` and can be updated in `Admin -> Access`.
Repository sync policy is stored in database settings and can be updated by admin APIs.

## Roles and Permission Model

- `viewer`: read-only marketplace access
- `member`: can access dashboard and manage own skills
- `admin`: can manage all skills
- `super_admin`: full admin permissions plus account governance and role assignment

Dashboard API key policy:

- `member`: manage own API keys
- `admin`: manage own API keys
- `super_admin`: manage all API keys

Super admin dashboard API key management supports:

- Cross-account listing with owner username filter
- Status filters: `all`, `active`, `revoked`, `expired`
- Scope-aware token creation and validation
- Global revoke with permission checks and audit logs
- Token rotation with one-time preview of the replacement key

Supported API key scopes:

- `skills.search.read`
- `skills.ai_search.read`
- `skills.read` (wildcard for skills read endpoints)
- `*` (full access)

## Skill Archive Format

Upload supports a `.zip` package with optional `skill.json`.

Example `skill.json`:

```json
{
  "name": "My Skill",
  "description": "Skill imported from archive",
  "tags": ["automation", "ops"],
  "content_file": "README.md"
}
```

If `skill.json` is missing, the system falls back to `README.md` for title/content extraction.

## Repository Sync Behavior

Repository sync expects a repository (and optional branch/subdirectory) that contains `skill.json` and/or `README.md`.

- Sync import creates a new skill entry.
- Re-sync updates name, description, content, tags, and `last_synced_at`.
- Manual batch sync is available in `Admin -> Records`.
- Periodic scheduler sync runs when `REPO_SYNC_ENABLED=true`.

## SkillMP Import Behavior

SkillMP import supports two access modes:

- Direct Skill URL import
- Skill ID import via `SKILLMP_BASE_URL + /api/v1/skills/{id}`

If your SkillMP skill requires authorization, provide token in:

- Dashboard import form (`Access token`)
- or global environment `SKILLMP_TOKEN`

## Public API

OpenAPI artifacts:

- `http://localhost:8080/openapi.json`
- `http://localhost:8080/openapi.yaml`
- `http://localhost:8080/docs/swagger`

Session endpoints (documented in OpenAPI as form-based operations):

- `/skills/{skillID}/favorite`
- `/skills/{skillID}/rating`
- `/skills/{skillID}/comments`
- `/skills/{skillID}/comments/{commentID}/delete`
- `/admin/apikeys/create`
- `/admin/apikeys/{keyID}/revoke`
- `/admin/apikeys/{keyID}/rotate`
- `/admin/access/registration`
- `/admin/accounts/{userID}/status`
- `/admin/accounts/{userID}/force-signout`
- `/admin/accounts/{userID}/password-reset`

Session JSON admin APIs (frontend-oriented):

- `/api/v1/admin/overview`
- `/api/v1/admin/skills`
- `/api/v1/admin/integrations`
- `/api/v1/admin/sync-jobs`
- `/api/v1/admin/sync-jobs/{runID}`
- `/api/v1/admin/sync-policy/repository`
- `/api/v1/admin/apikeys`
- `/api/v1/admin/apikeys/{keyID}/revoke`
- `/api/v1/admin/apikeys/{keyID}/rotate`
- `/api/v1/admin/settings/registration`
- `/api/v1/admin/accounts`
- `/api/v1/admin/accounts/{userID}/status`
- `/api/v1/admin/accounts/{userID}/force-signout`
- `/api/v1/admin/accounts/{userID}/password-reset`
- `/api/v1/admin/organizations`
- `/api/v1/admin/organizations/{orgID}/members`
- `/api/v1/admin/organizations/{orgID}/members/{userID}/role`
- `/api/v1/admin/organizations/{orgID}/members/{userID}/remove`
- `/api/v1/skills/{skillID}/report`
- `/api/v1/skills/{skillID}/comments/{commentID}/report`
- `/api/v1/skills/{skillID}/favorite`
- `/api/v1/skills/{skillID}/rating`
- `/api/v1/skills/{skillID}/comments`
- `/api/v1/skills/{skillID}/comments/{commentID}/delete`
- `/api/v1/skills/{skillID}/versions/{versionID}/rollback`
- `/api/v1/skills/{skillID}/versions/{versionID}/restore`
- `/api/v1/admin/moderation`
- `/api/v1/admin/moderation/{caseID}/resolve`
- `/api/v1/admin/moderation/{caseID}/reject`

### Keyword Search

```bash
curl -H "Authorization: Bearer <API_KEY>" \
  "http://localhost:8080/api/v1/skills/search?q=go&category=development&sort=stars"
```

### AI Semantic Search

```bash
curl -H "Authorization: Bearer <API_KEY>" \
  "http://localhost:8080/api/v1/skills/ai-search?q=incident response runbook"
```

## Tests

```bash
cd frontend-next && npm run lint
cd frontend-next && npm run test:unit
cd frontend-next && npm run build
cd frontend-next && npm run test:e2e
go test ./...
go vet ./...
```

## Notes

- Session cookies are signed and CSRF validation is enabled for non-safe HTTP methods.
- Repository sync uses the local `git` command with non-interactive mode to prevent credential prompt hangs.

## User Documentation

- User manual index: `docs/user-docs/README.md`
- Product/design requirements: `docs/design-requirements/README.md`
