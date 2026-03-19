# Frontend Backend Separation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Reorganize the project into a separated architecture with an independent React frontend and a backend API-first server.

**Architecture:** Keep existing domain/services layers in Go, expose session-based JSON APIs under `/api/v1`, and introduce a dedicated API runtime mode with CORS support. Add a standalone React (Vite + TypeScript) frontend that consumes backend APIs via an API client layer.

**Tech Stack:** Go (Chi, GORM), React 18, TypeScript, Vite

---

### Task 1: Backend API Runtime Separation

**Files:**
- Modify: `internal/config/config.go`
- Modify: `cmd/server/main.go`
- Create: `cmd/api/main.go`
- Modify: `.env.example`

**Step 1: Write the failing test**
- Add config tests for `API_ONLY` and `CORS_ALLOWED_ORIGINS` parsing.

**Step 2: Run test to verify it fails**
- Run: `go test ./internal/config -count=1`

**Step 3: Write minimal implementation**
- Add `APIOnly` and `CORSAllowedOrigins` to config.
- Add `cmd/api/main.go` to start backend in API-only mode.

**Step 4: Run test to verify it passes**
- Run: `go test ./internal/config -count=1`

### Task 2: API Service Layer Completion for Frontend

**Files:**
- Modify: `internal/web/app.go`
- Create: `internal/web/app_interaction_api.go`
- Create: `internal/web/app_skill_versions_api.go`
- Modify: `internal/web/app_auth_api.go`
- Modify: `internal/web/openapi.go`
- Modify: `internal/web/openapi_test.go`
- Create: `internal/web/app_interaction_api_test.go`
- Modify: `internal/web/app_skill_versions_test.go`

**Step 1: Write the failing test**
- Add tests for API interaction endpoints and API rollback endpoint.

**Step 2: Run test to verify it fails**
- Run: `go test ./internal/web -run "Interaction|Rollback|OpenAPI" -count=1`

**Step 3: Write minimal implementation**
- Add `/api/v1/auth/csrf`.
- Add JSON endpoints:
  - `POST /api/v1/skills/{skillID}/favorite`
  - `POST /api/v1/skills/{skillID}/rating`
  - `POST /api/v1/skills/{skillID}/comments`
  - `POST /api/v1/skills/{skillID}/comments/{commentID}/delete`
  - `POST /api/v1/skills/{skillID}/versions/{versionID}/rollback`
- Add CORS middleware for API routes and preflight.
- Register endpoints in OpenAPI.

**Step 4: Run test to verify it passes**
- Run: `go test ./internal/web -count=1`

### Task 3: Standalone Frontend Separation (Historical)

> Historical note (2026-03-18): this task created the previous React/Vite frontend during an earlier migration phase. The active frontend workspace now lives in `frontend-next/`.

**Files:**
- Create the then-active standalone frontend workspace files and API client layer.

**Step 1: Write the failing test**
- Add minimal type-check/build guard by running the frontend build.

**Step 2: Run build to verify it fails before files exist**
- Run the build command in the standalone frontend workspace used during that phase.

**Step 3: Write minimal implementation**
- Build a standalone frontend app with basic route switching and an API fetch layer.
- Use the frontend base URL variable from the active workspace configuration for that phase.

**Step 4: Run build to verify it passes**
- Run install + build in the standalone frontend workspace used during that phase.

### Task 4: End-to-End Verification

**Files:**
- Modify: `README.md`

**Step 1: Validate backend tests**
- Run: `go test ./... -count=1`

**Step 2: Validate frontend build**
- Run: `cd frontend-next && npm run build`

**Step 3: Verify startup commands**
- Backend API: `go run ./cmd/api`
- Frontend Dev: `cd frontend-next && npm run dev`
