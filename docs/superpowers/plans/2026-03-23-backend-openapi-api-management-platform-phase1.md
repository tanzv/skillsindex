# Backend OpenAPI API Management Platform Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 1 minimum viable backend OpenAPI management platform: repository-backed spec source, persisted spec metadata, draft validation and publish flow, admin APIs for lifecycle operations, and `/openapi.json` plus `/openapi.yaml` served from the current published snapshot.

**Architecture:** Keep the current Go backend as the only runtime and introduce an internal API management slice across `models`, `services`, `bootstrap`, and `web`. OpenAPI files under `backend/api/openapi/` become the source of truth, while the Phase 1 runtime only consumes the currently published bundled snapshot from storage and database metadata.

**Tech Stack:** Go, Chi, GORM, SQLite test harness, PostgreSQL runtime, kin-openapi, yaml.v3

---

**Spec reference:** `docs/superpowers/specs/2026-03-23-backend-openapi-api-management-platform-design.md`

**Execution guardrails:**
- Respect existing unrelated dirty files. Only touch the files listed in each task.
- Follow @test-driven-development for every behavior change.
- Before claiming success, run @verification-before-completion commands for the changed backend scope.
- Keep all source code and code comments in English only.
- Prefer additive compatibility in Phase 1. Do not delete the legacy hand-built OpenAPI files yet.
- Current session should execute this plan directly without spawning subagents unless the user explicitly authorizes delegation.

## File Map

### Files to create
- `backend/api/openapi/root.yaml` — initial repository-backed OpenAPI root document used by the platform import path.
- `backend/api/openapi/components/schemas/health.yaml` — minimal schema fixture proving multi-file OpenAPI layout works.
- `backend/api/openapi/paths/admin/api_management.yaml` — Phase 1 admin API management path contract source.
- `backend/internal/models/api_spec.go` — persisted API spec asset model and status constants.
- `backend/internal/models/api_publish_event.go` — persisted publish/rollback audit model.
- `backend/internal/services/api_spec_registry_service.go` — draft import, parse, validate, and bundle persistence service.
- `backend/internal/services/api_publish_service.go` — publish and rollback orchestration service.
- `backend/internal/services/api_spec_registry_service_test.go` — focused service tests for import and validation.
- `backend/internal/services/api_publish_service_test.go` — focused service tests for publish/current-version switching.
- `backend/internal/web/app_admin_api_management_inputs.go` — request DTOs for Phase 1 admin APIs.
- `backend/internal/web/app_admin_api_management_handlers.go` — admin endpoints for import, validate, publish, current-version query, and export.
- `backend/internal/web/app_admin_api_management_handlers_test.go` — route-level tests for Phase 1 management endpoints.
- `backend/internal/web/openapi_runtime_source.go` — helper that reads the current published OpenAPI artifact from storage or falls back safely.

### Files to modify
- `backend/go.mod` — add `kin-openapi` dependency required for parsing and validation.
- `backend/internal/db/db.go` — migrate new API management models.
- `backend/internal/bootstrap/runtime.go` — construct Phase 1 services and inject them into the app.
- `backend/internal/web/app.go` — add app dependencies for the new API management services.
- `backend/internal/web/app_constructor.go` — wire API management services into `App`.
- `backend/internal/web/app_routing_dashboard_routes.go` — register Phase 1 admin API management routes.
- `backend/internal/web/app_public_marketplace_docs_handlers.go` — serve `/openapi.json` and `/openapi.yaml` from published snapshots.
- `backend/internal/web/openapi_handlers_test.go` — switch handler expectations from in-memory build to published snapshot loading.
- `backend/internal/web/openapi.go` — keep legacy builder available only as fallback helper during migration.

### Optional compatibility files to modify if needed
- `backend/internal/bootstrap/runtime_test.go` — cover runtime wiring or storage-path defaults if constructor shape changes.
- `backend/internal/services/settings_service.go` — only if a Phase 1 setting is needed for storage defaults; skip unless required.

## Chunk 1: Data model and draft registry foundation

### Task 1: Lock the new schema and import behavior with failing tests

**Files:**
- Create: `backend/internal/services/api_spec_registry_service_test.go`
- Modify: `backend/internal/db/db.go`

- [ ] **Step 1: Add a failing registry import test for multi-file spec ingestion**

```go
func TestAPISpecRegistryServiceImportDraftCreatesSpecAndBundle(t *testing.T) {
	db := setupAPISpecRegistryTestDB(t)
	storageDir := t.TempDir()
	service := NewAPISpecRegistryService(db, storageDir)

	result, err := service.ImportDraft(context.Background(), ImportAPISpecDraftInput{
		Name:       "SkillsIndex API",
		Slug:       "skillsindex-api",
		SourcePath: filepath.Join("..", "..", "api", "openapi", "root.yaml"),
		ActorUserID: 7,
	})
	if err != nil {
		t.Fatalf("expected import to succeed, got %v", err)
	}
	if result.Spec.ID == 0 {
		t.Fatalf("expected persisted spec id")
	}
	if result.Spec.Status != models.APISpecStatusDraft {
		t.Fatalf("unexpected spec status: %s", result.Spec.Status)
	}
	if strings.TrimSpace(result.BundlePath) == "" {
		t.Fatalf("expected bundle path")
	}
}
```

- [ ] **Step 2: Add a failing migration coverage test for the new models**

```go
func TestMigrateIncludesAPISpecModels(t *testing.T) {
	db := setupSQLiteDB(t)

	if err := dbpkg.Migrate(db); err != nil {
		t.Fatalf("expected migrate to succeed: %v", err)
	}

	for _, table := range []string{"api_specs", "api_publish_events"} {
		if !db.Migrator().HasTable(table) {
			t.Fatalf("expected table %s to exist", table)
		}
	}
}
```

- [ ] **Step 3: Run focused tests to confirm RED**

Run:
```bash
cd backend && go test ./internal/services ./internal/db -run 'TestAPISpecRegistryServiceImportDraftCreatesSpecAndBundle|TestMigrateIncludesAPISpecModels' -count=1
```

Expected:
- FAIL because the registry service and models do not exist yet.

- [ ] **Step 4: Commit the red test state**

```bash
git add backend/internal/services/api_spec_registry_service_test.go backend/internal/db/db.go
git commit -m "test(api-management): add registry import coverage"
```

### Task 2: Implement persisted API spec assets and the draft registry

**Files:**
- Create: `backend/internal/models/api_spec.go`
- Create: `backend/internal/models/api_publish_event.go`
- Create: `backend/internal/services/api_spec_registry_service.go`
- Create: `backend/api/openapi/root.yaml`
- Create: `backend/api/openapi/components/schemas/health.yaml`
- Create: `backend/api/openapi/paths/admin/api_management.yaml`
- Modify: `backend/go.mod`
- Modify: `backend/internal/db/db.go`
- Test: `backend/internal/services/api_spec_registry_service_test.go`

- [ ] **Step 1: Add the failing schema-backed models**

Create `backend/internal/models/api_spec.go` with:

```go
type APISpecStatus string

const (
	APISpecStatusDraft     APISpecStatus = "draft"
	APISpecStatusValidated APISpecStatus = "validated"
	APISpecStatusPublished APISpecStatus = "published"
	APISpecStatusDeprecated APISpecStatus = "deprecated"
	APISpecStatusArchived  APISpecStatus = "archived"
)

type APISpec struct {
	ID              uint          `gorm:"primaryKey"`
	Name            string        `gorm:"size:120;not null"`
	Slug            string        `gorm:"size:120;not null;uniqueIndex"`
	SourceType      string        `gorm:"size:32;not null"`
	Status          APISpecStatus `gorm:"size:32;not null;index"`
	SemanticVersion string        `gorm:"size:32;not null"`
	IsCurrent       bool          `gorm:"not null;default:false;index"`
	SourcePath      string        `gorm:"size:512;not null"`
	BundlePath      string        `gorm:"size:512;not null"`
	Checksum        string        `gorm:"size:128;not null"`
	CreatedBy       uint          `gorm:"not null"`
	PublishedBy     *uint
	PublishedAt     *time.Time
	CreatedAt       time.Time
	UpdatedAt       time.Time
}
```

Create `backend/internal/models/api_publish_event.go` with:

```go
type APIPublishEvent struct {
	ID          uint      `gorm:"primaryKey"`
	SpecID       uint      `gorm:"not null;index"`
	EventType    string    `gorm:"size:32;not null"`
	FromVersion  string    `gorm:"size:32"`
	ToVersion    string    `gorm:"size:32;not null"`
	DiffSummary  string    `gorm:"type:text"`
	CreatedBy    uint      `gorm:"not null"`
	CreatedAt    time.Time
}
```

- [ ] **Step 2: Register the new models in database migration**

Add to `backend/internal/db/db.go`:

```go
&models.APISpec{},
&models.APIPublishEvent{},
```

Keep the migration order stable and additive.

- [ ] **Step 3: Add `kin-openapi` and implement the registry service**

In `backend/internal/services/api_spec_registry_service.go`, implement:

```go
type ImportAPISpecDraftInput struct {
	Name        string
	Slug        string
	SourcePath  string
	ActorUserID uint
}

type ImportAPISpecDraftResult struct {
	Spec       models.APISpec
	BundlePath string
}

type APISpecRegistryService struct {
	db         *gorm.DB
	storageDir string
}

func NewAPISpecRegistryService(db *gorm.DB, storageDir string) *APISpecRegistryService
func (s *APISpecRegistryService) ImportDraft(ctx context.Context, input ImportAPISpecDraftInput) (ImportAPISpecDraftResult, error)
func (s *APISpecRegistryService) ValidateDraft(ctx context.Context, specID uint) (models.APISpec, error)
func (s *APISpecRegistryService) CurrentPublished(ctx context.Context) (models.APISpec, error)
```

Import flow:
- normalize input
- load the root spec with `kin-openapi/openapi3`
- validate the document
- marshal the bundled spec to YAML
- write it under `storage/api-management/specs/<slug>/<timestamp>-draft.yaml`
- compute a stable checksum
- persist `api_specs` row with `status=draft`, `source_type=repository`, `semantic_version=0.1.0-draft`

- [ ] **Step 4: Add the initial repository-backed OpenAPI source files**

Use a minimal but valid multi-file contract:

`backend/api/openapi/root.yaml`
```yaml
openapi: 3.0.3
info:
  title: SkillsIndex OpenAPI
  version: 0.1.0
paths:
  /api/v1/admin/api-management/specs/current:
    $ref: ./paths/admin/api_management.yaml#/paths/~1api~1v1~1admin~1api-management~1specs~1current
components:
  schemas:
    HealthEnvelope:
      $ref: ./components/schemas/health.yaml#/HealthEnvelope
```

`backend/api/openapi/paths/admin/api_management.yaml`
```yaml
paths:
  /api/v1/admin/api-management/specs/current:
    get:
      operationId: getCurrentPublishedSpec
      responses:
        '200':
          description: Current published spec metadata
```

`backend/api/openapi/components/schemas/health.yaml`
```yaml
HealthEnvelope:
  type: object
  properties:
    status:
      type: string
```

- [ ] **Step 5: Run focused tests to confirm GREEN**

Run:
```bash
cd backend && go test ./internal/services ./internal/db -run 'TestAPISpecRegistryServiceImportDraftCreatesSpecAndBundle|TestMigrateIncludesAPISpecModels' -count=1
```

Expected:
- PASS with persisted draft metadata and generated bundle artifact.

- [ ] **Step 6: Commit the foundation**

```bash
git add \
  backend/go.mod \
  backend/internal/models/api_spec.go \
  backend/internal/models/api_publish_event.go \
  backend/internal/services/api_spec_registry_service.go \
  backend/internal/services/api_spec_registry_service_test.go \
  backend/internal/db/db.go \
  backend/api/openapi/root.yaml \
  backend/api/openapi/components/schemas/health.yaml \
  backend/api/openapi/paths/admin/api_management.yaml
git commit -m "feat(api-management): add draft registry foundation"
```

## Chunk 2: Publish service and runtime snapshot source

### Task 3: Lock publish/current-version behavior with failing tests

**Files:**
- Create: `backend/internal/services/api_publish_service_test.go`
- Modify: `backend/internal/web/openapi_handlers_test.go`

- [ ] **Step 1: Add a failing publish service test for current-version switching**

```go
func TestAPIPublishServicePublishMarksOnlyOneCurrentSpec(t *testing.T) {
	db := setupAPISpecRegistryTestDB(t)
	registry := NewAPISpecRegistryService(db, t.TempDir())
	publisher := NewAPIPublishService(db)

	first := seedDraftSpec(t, db, "skillsindex-api-v1")
	second := seedDraftSpec(t, db, "skillsindex-api-v2")

	if _, err := publisher.Publish(context.Background(), PublishAPISpecInput{SpecID: first.ID, ActorUserID: 9}); err != nil {
		t.Fatalf("first publish failed: %v", err)
	}
	current, err := publisher.Publish(context.Background(), PublishAPISpecInput{SpecID: second.ID, ActorUserID: 9})
	if err != nil {
		t.Fatalf("second publish failed: %v", err)
	}
	if !current.IsCurrent {
		t.Fatalf("expected latest spec to be current")
	}
	assertCurrentSpecCount(t, db, 1)
}
```

- [ ] **Step 2: Add a failing handler test that expects published artifacts to be served**

```go
func TestHandleOpenAPIReadsCurrentPublishedSnapshot(t *testing.T) {
	app := setupOpenAPIRuntimeApp(t, "openapi: 3.0.3\ninfo:\n  title: Runtime Snapshot\n  version: 1.2.3\n")
	req := httptest.NewRequest(http.MethodGet, "http://example.com/openapi.json", nil)
	recorder := httptest.NewRecorder()

	app.handleOpenAPI(recorder, req)

	if !strings.Contains(recorder.Body.String(), "Runtime Snapshot") {
		t.Fatalf("expected published snapshot body")
	}
}
```

- [ ] **Step 3: Run focused tests to confirm RED**

Run:
```bash
cd backend && go test ./internal/services ./internal/web -run 'TestAPIPublishServicePublishMarksOnlyOneCurrentSpec|TestHandleOpenAPIReadsCurrentPublishedSnapshot' -count=1
```

Expected:
- FAIL because publish orchestration and runtime snapshot reader do not exist yet.

- [ ] **Step 4: Commit the red test state**

```bash
git add backend/internal/services/api_publish_service_test.go backend/internal/web/openapi_handlers_test.go
git commit -m "test(api-management): cover publish snapshot runtime"
```

### Task 4: Implement publish orchestration and snapshot-backed `/openapi.*`

**Files:**
- Create: `backend/internal/services/api_publish_service.go`
- Create: `backend/internal/web/openapi_runtime_source.go`
- Modify: `backend/internal/web/app_public_marketplace_docs_handlers.go`
- Modify: `backend/internal/web/openapi_handlers_test.go`
- Test: `backend/internal/services/api_publish_service_test.go`

- [ ] **Step 1: Implement the publish service**

Create `backend/internal/services/api_publish_service.go` with:

```go
type PublishAPISpecInput struct {
	SpecID       uint
	ActorUserID  uint
}

type APIPublishService struct {
	db *gorm.DB
}

func NewAPIPublishService(db *gorm.DB) *APIPublishService
func (s *APIPublishService) Publish(ctx context.Context, input PublishAPISpecInput) (models.APISpec, error)
```

Publish behavior:
- load target spec
- require `status` to be `draft` or `validated`
- inside one transaction:
  - clear `is_current` for all specs
  - set target `status=published`
  - set `is_current=true`
  - set `published_by` and `published_at`
  - insert `api_publish_events` row

- [ ] **Step 2: Add a runtime reader that resolves the current published artifact**

Create `backend/internal/web/openapi_runtime_source.go`:

```go
type openAPIRuntimeSource struct {
	registry  *services.APISpecRegistryService
	publisher *services.APIPublishService
}

func loadCurrentOpenAPISpec(ctx context.Context, registry *services.APISpecRegistryService) (map[string]any, []byte, error)
```

Behavior:
- load current published metadata from the registry
- read the YAML artifact from `BundlePath`
- unmarshal YAML into `map[string]any`
- return both structured spec and raw YAML
- if no published spec exists, fall back to `buildOpenAPISpec(...)`

- [ ] **Step 3: Switch `/openapi.json` and `/openapi.yaml` handlers to the runtime source**

In `backend/internal/web/app_public_marketplace_docs_handlers.go`:
- `handleOpenAPI` should use `loadCurrentOpenAPISpec(...)`
- `handleOpenAPIYAML` should return the stored raw YAML
- only use `buildOpenAPISpec(resolveServerURL(r))` as a compatibility fallback when no published artifact exists

- [ ] **Step 4: Run focused tests to confirm GREEN**

Run:
```bash
cd backend && go test ./internal/services ./internal/web -run 'TestAPIPublishServicePublishMarksOnlyOneCurrentSpec|TestHandleOpenAPIReadsCurrentPublishedSnapshot|TestHandleOpenAPIYAML' -count=1
```

Expected:
- PASS with one current published spec and handler responses loaded from storage.

- [ ] **Step 5: Commit the publish/runtime slice**

```bash
git add \
  backend/internal/services/api_publish_service.go \
  backend/internal/services/api_publish_service_test.go \
  backend/internal/web/openapi_runtime_source.go \
  backend/internal/web/app_public_marketplace_docs_handlers.go \
  backend/internal/web/openapi_handlers_test.go
git commit -m "feat(api-management): publish and serve current openapi snapshot"
```

## Chunk 3: Admin APIs and runtime wiring

### Task 5: Lock the management API contract with failing handler tests

**Files:**
- Create: `backend/internal/web/app_admin_api_management_handlers_test.go`
- Modify: `backend/internal/web/app_routing_dashboard_routes.go`

- [ ] **Step 1: Add a failing admin API test for current spec lookup**

```go
func TestHandleAPIAdminCurrentSpecReturnsPublishedMetadata(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	seedPublishedSpec(t, app, "skillsindex-api", "1.0.0")

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/specs/current", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCurrentSpec(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"semantic_version":"1.0.0"`) {
		t.Fatalf("expected semantic version in payload")
	}
}
```

- [ ] **Step 2: Add a failing admin API test for import -> validate -> publish**

```go
func TestHandleAPIAdminPublishFlow(t *testing.T) {
	app := setupAPIManagementTestApp(t)

	importReq := httptest.NewRequest(http.MethodPost, "/api/v1/admin/api-management/specs/import", strings.NewReader(`{"name":"SkillsIndex API","slug":"skillsindex-api","source_path":"backend/api/openapi/root.yaml"}`))
	importReq.Header.Set("Content-Type", "application/json")
	importReq = withCurrentUser(importReq, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	importRecorder := httptest.NewRecorder()
	app.handleAPIAdminImportSpec(importRecorder, importReq)

	if importRecorder.Code != http.StatusCreated {
		t.Fatalf("unexpected import status: %d", importRecorder.Code)
	}
}
```

- [ ] **Step 3: Register the routes and run focused tests to confirm RED**

Run:
```bash
cd backend && go test ./internal/web -run 'TestHandleAPIAdminCurrentSpecReturnsPublishedMetadata|TestHandleAPIAdminPublishFlow' -count=1
```

Expected:
- FAIL because the handlers and routes do not exist yet.

- [ ] **Step 4: Commit the red test state**

```bash
git add backend/internal/web/app_admin_api_management_handlers_test.go backend/internal/web/app_routing_dashboard_routes.go
git commit -m "test(api-management): cover phase1 admin endpoints"
```

### Task 6: Implement the Phase 1 admin management API and bootstrap wiring

**Files:**
- Create: `backend/internal/web/app_admin_api_management_inputs.go`
- Create: `backend/internal/web/app_admin_api_management_handlers.go`
- Modify: `backend/internal/web/app.go`
- Modify: `backend/internal/web/app_constructor.go`
- Modify: `backend/internal/bootstrap/runtime.go`
- Modify: `backend/internal/web/app_routing_dashboard_routes.go`
- Modify: `backend/internal/bootstrap/runtime_test.go`
- Test: `backend/internal/web/app_admin_api_management_handlers_test.go`

- [ ] **Step 1: Add request DTOs for Phase 1 endpoints**

Create `backend/internal/web/app_admin_api_management_inputs.go`:

```go
type apiAdminImportSpecInput struct {
	Name       string `json:"name"`
	Slug       string `json:"slug"`
	SourcePath string `json:"source_path"`
}

type apiAdminPublishSpecInput struct {
	SpecID uint `json:"spec_id"`
}
```

- [ ] **Step 2: Add app dependencies for the new services**

In `backend/internal/web/app.go` and `backend/internal/web/app_constructor.go`, add:

```go
apiSpecRegistrySvc *services.APISpecRegistryService
apiPublishSvc      *services.APIPublishService
```

and the matching fields in `AppDependencies`.

- [ ] **Step 3: Construct the services in bootstrap runtime**

In `backend/internal/bootstrap/runtime.go`:
- compute a storage root under `filepath.Join(runtimeConfig.StoragePath, "api-management")`
- create:

```go
apiSpecRegistryService := services.NewAPISpecRegistryService(database, filepath.Join(runtimeConfig.StoragePath, "api-management"))
apiPublishService := services.NewAPIPublishService(database)
```

- pass them into `web.NewApp(...)`

- [ ] **Step 4: Implement the handlers and route registration**

In `backend/internal/web/app_admin_api_management_handlers.go`, implement:

```go
func (a *App) handleAPIAdminCurrentSpec(w http.ResponseWriter, r *http.Request)
func (a *App) handleAPIAdminImportSpec(w http.ResponseWriter, r *http.Request)
func (a *App) handleAPIAdminValidateSpec(w http.ResponseWriter, r *http.Request)
func (a *App) handleAPIAdminPublishSpec(w http.ResponseWriter, r *http.Request)
func (a *App) handleAPIAdminExportSpecJSON(w http.ResponseWriter, r *http.Request)
func (a *App) handleAPIAdminExportSpecYAML(w http.ResponseWriter, r *http.Request)
```

In `backend/internal/web/app_routing_dashboard_routes.go`, add:

```go
r.Get("/api/v1/admin/api-management/specs/current", a.handleAPIAdminCurrentSpec)
r.Post("/api/v1/admin/api-management/specs/import", a.handleAPIAdminImportSpec)
r.Post("/api/v1/admin/api-management/specs/{specID}/validate", a.handleAPIAdminValidateSpec)
r.Post("/api/v1/admin/api-management/specs/{specID}/publish", a.handleAPIAdminPublishSpec)
r.Get("/api/v1/admin/api-management/specs/current/export.json", a.handleAPIAdminExportSpecJSON)
r.Get("/api/v1/admin/api-management/specs/current/export.yaml", a.handleAPIAdminExportSpecYAML)
```

- [ ] **Step 5: Run focused tests to confirm GREEN**

Run:
```bash
cd backend && go test ./internal/web ./internal/bootstrap -run 'TestHandleAPIAdminCurrentSpecReturnsPublishedMetadata|TestHandleAPIAdminPublishFlow|TestHandleOpenAPI|TestHandleOpenAPIYAML|TestNormalizeRuntimeConfig' -count=1
```

Expected:
- PASS with wired services, routes, and published OpenAPI export endpoints.

- [ ] **Step 6: Commit the admin API slice**

```bash
git add \
  backend/internal/web/app_admin_api_management_inputs.go \
  backend/internal/web/app_admin_api_management_handlers.go \
  backend/internal/web/app_admin_api_management_handlers_test.go \
  backend/internal/web/app.go \
  backend/internal/web/app_constructor.go \
  backend/internal/web/app_routing_dashboard_routes.go \
  backend/internal/bootstrap/runtime.go \
  backend/internal/bootstrap/runtime_test.go
git commit -m "feat(api-management): add phase1 admin management api"
```

## Chunk 4: Full verification and compatibility pass

### Task 7: Run the required backend verification gates

**Files:**
- Modify: `docs/superpowers/plans/2026-03-23-backend-openapi-api-management-platform-phase1.md`

- [ ] **Step 1: Run focused Phase 1 service and web tests**

Run:
```bash
cd backend && go test ./internal/services ./internal/web ./internal/bootstrap -count=1
```

Expected:
- PASS for the touched scope.

- [ ] **Step 2: Run the backend-wide minimum quality gates**

Run:
```bash
cd backend && go test ./... && go vet ./...
```

Expected:
- PASS with zero failing packages and no vet errors.

- [ ] **Step 3: Run the repository max-lines check required by policy**

Run:
```bash
./scripts/check_max_lines.sh
```

Expected:
- PASS with no newly oversized source files.

- [ ] **Step 4: Update the checklist state in this plan if anything was skipped**

If a command fails or cannot run:
- record the exact blocker in this plan before reporting status

- [ ] **Step 5: Commit the final verified Phase 1 implementation**

```bash
git add backend docs/superpowers/plans/2026-03-23-backend-openapi-api-management-platform-phase1.md
git commit -m "feat(api-management): deliver phase1 openapi platform"
```

## Notes For Execution

1. Keep the legacy `buildOpenAPISpec(...)` path only as a fallback until later phases remove it.
2. Do not implement operation-level policy storage, mock profiles, or external subset export in Phase 1.
3. Do not add a frontend UI in this plan.
4. If `kin-openapi` bundle handling requires a helper package split, create a narrowly scoped helper under `backend/internal/services/` rather than expanding the handler layer.

Plan complete and saved to `docs/superpowers/plans/2026-03-23-backend-openapi-api-management-platform-phase1.md`. Ready to execute?
