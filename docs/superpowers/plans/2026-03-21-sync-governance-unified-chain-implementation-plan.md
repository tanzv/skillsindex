# Sync Governance Unified Chain Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified backend execution chain that links async jobs, sync runs, skill versions, and audit records for manual and scheduled sync flows.

**Architecture:** Keep the current backend layering and preserve route compatibility, but promote sync runs from summary-style records into first-class execution records that can be linked to async jobs and version capture. Scheduled sync, manual remote sync, and retry flows should all emit stable run records, and version capture should carry run metadata instead of behaving like an isolated side effect.

**Tech Stack:** Go, GORM, Chi, OpenAPI, repository-owned tests under `backend/internal/services` and `backend/internal/web`

---

## Scope

This plan covers only the first-stage governance chain:

1. `async job`
2. `sync run`
3. `skill version`
4. `audit`

This plan does not cover:

1. organization governance
2. moderation governance
3. API key scope expansion
4. enterprise SSO
5. frontend redesign

## Assumptions

1. Backward compatibility is required for existing `/api/v1/admin/sync-runs*` and alias-based sync policy routes.
2. Repository sync remains the only scheduled sync flow in the current runtime.
3. Existing GORM-driven schema evolution is still the repository pattern for these models.
4. `SkillVersion` remains the immutable snapshot source of truth for version history.

## Extension Points

1. The unified sync run contract should support future `skillmp` scheduled sync without redesign.
2. Run records should be able to reference more than one trigger source, including `manual`, `scheduled`, and `retry`.
3. Version capture metadata should be able to carry `run_id`, `trigger`, and future `source_revision`.
4. Audit payloads should be shaped so later ops/export automation can consume them without another schema rewrite.

## File Structure

### Core model and service files

- Modify: `backend/internal/models/sync_job_run.go`
- Modify: `backend/internal/models/skill_version.go`
- Modify: `backend/internal/models/async_job.go`
- Modify: `backend/internal/services/sync_job_service.go`
- Modify: `backend/internal/services/skill_version_service.go`
- Modify: `backend/internal/services/skill_service_mutations.go`
- Modify: `backend/internal/services/repository_sync_scheduler.go`
- Create: `backend/internal/services/sync_execution_service.go`
- Create: `backend/internal/services/sync_execution_service_test.go`

### Transport and OpenAPI files

- Modify: `backend/internal/web/app_admin_api_sync_jobs_handlers.go`
- Modify: `backend/internal/web/app_sync_runs_alias_api.go`
- Modify: `backend/internal/web/app_skill_sync_runs_api.go`
- Modify: `backend/internal/web/app_admin_content_handlers.go`
- Modify: `backend/internal/web/openapi_paths_admin_sync_policies.go`
- Modify: `backend/internal/web/openapi_paths_moderation_interaction.go`
- Modify: `backend/internal/web/openapi_schemas_sync_policies.go`
- Create: `backend/internal/web/app_sync_execution_api_test.go`

### Existing tests to extend

- Modify: `backend/internal/services/sync_job_service_test.go`
- Modify: `backend/internal/services/async_job_service_test.go`
- Modify: `backend/internal/services/skill_version_service_persistence_test.go`
- Modify: `backend/internal/web/app_skill_sync_runs_api_test.go`
- Modify: `backend/internal/web/app_sync_runs_alias_api_test.go`
- Modify: `backend/internal/web/app_admin_content_remote_sync_test.go`

## Chunk 1: Domain Contract

### Task 1: Promote sync runs to stable execution records

**Files:**
- Modify: `backend/internal/models/sync_job_run.go`
- Modify: `backend/internal/services/sync_job_service.go`
- Test: `backend/internal/services/sync_job_service_test.go`
- Test: `backend/internal/services/sync_execution_service_test.go`

- [ ] **Step 1: Write the failing tests for the new sync run contract**

Add tests that assert:

```go
func TestSyncJobServiceCreateRunStartsPendingAndCarriesLinkage(t *testing.T) {
    run, err := svc.CreateRun(ctx, CreateSyncRunInput{
        TriggerType:   "manual",
        SourceType:    "repository",
        AsyncJobID:    &job.ID,
        TargetSkillID: &skill.ID,
        OwnerUserID:   &owner.ID,
        ActorUserID:   &actor.ID,
        Attempt:       1,
    })
    require.NoError(t, err)
    require.Equal(t, "pending", run.Status)
    require.Equal(t, job.ID, *run.AsyncJobID)
}
```

- [ ] **Step 2: Run the focused service tests to confirm failure**

Run:

```bash
cd backend && go test ./internal/services -run 'TestSyncJobService|TestSyncExecutionService' -v
```

Expected:

1. compile failure or missing method failures for the new run contract

- [ ] **Step 3: Implement the new sync run model and service API**

Required model changes:

1. replace summary-style status derivation with explicit lifecycle status
2. add `async_job_id`
3. add `trigger_type`
4. add `source_type`
5. add `attempt`
6. split `error_summary` into `error_code` and `error_message`
7. keep old fields only when needed for compatibility response shaping

Required service changes:

1. add `CreateRun`
2. add `StartRun`
3. add `CompleteRun`
4. add `FailRun`
5. keep `ListRuns` and `GetRunByID`
6. keep old `RecordRun` only as a compatibility wrapper until all callers move

- [ ] **Step 4: Re-run focused service tests**

Run:

```bash
cd backend && go test ./internal/services -run 'TestSyncJobService|TestSyncExecutionService' -v
```

Expected:

1. new run lifecycle tests pass
2. existing list/get tests still pass after fixture updates

- [ ] **Step 5: Commit the domain contract changes**

```bash
git add backend/internal/models/sync_job_run.go \
  backend/internal/services/sync_job_service.go \
  backend/internal/services/sync_job_service_test.go \
  backend/internal/services/sync_execution_service_test.go
git commit -m "feat: promote sync runs to stable execution records"
```

### Task 2: Carry run metadata into skill version capture

**Files:**
- Modify: `backend/internal/models/skill_version.go`
- Modify: `backend/internal/services/skill_version_service.go`
- Modify: `backend/internal/services/skill_service_mutations.go`
- Test: `backend/internal/services/skill_version_service_persistence_test.go`

- [ ] **Step 1: Write failing tests for version-to-run linkage**

Add tests that assert:

```go
func TestSkillVersionCaptureStoresRunContext(t *testing.T) {
    err := versionSvc.CaptureWithTx(ctx, tx, skill.ID, CaptureSkillVersionInput{
        Trigger:     "sync",
        ActorUserID: &actor.ID,
        SyncRunID:   &run.ID,
    })
    require.NoError(t, err)
    require.Equal(t, run.ID, stored.SyncRunID)
}
```

- [ ] **Step 2: Run the failing persistence tests**

Run:

```bash
cd backend && go test ./internal/services -run 'TestSkillVersion.*Run|TestSkillVersionPersistence' -v
```

Expected:

1. compile failure for missing version metadata fields or capture input

- [ ] **Step 3: Replace loose trigger-only capture with explicit input**

Implementation rules:

1. introduce `CaptureSkillVersionInput`
2. include `Trigger`, `ActorUserID`, `SyncRunID`
3. keep `Capture` and `CaptureWithTx` as wrappers for compatibility
4. update create / visibility / delete / sync callers to pass explicit input
5. add `sync_run_id` to `SkillVersion`

- [ ] **Step 4: Re-run version persistence tests**

Run:

```bash
cd backend && go test ./internal/services -run 'TestSkillVersion.*Run|TestSkillVersionPersistence' -v
```

Expected:

1. version snapshots store linkage correctly
2. historical compare and retention tests remain green

- [ ] **Step 5: Commit the version linkage changes**

```bash
git add backend/internal/models/skill_version.go \
  backend/internal/services/skill_version_service.go \
  backend/internal/services/skill_service_mutations.go \
  backend/internal/services/skill_version_service_persistence_test.go
git commit -m "feat: link skill versions to sync runs"
```

## Chunk 2: Orchestration

### Task 3: Introduce one sync execution coordinator

**Files:**
- Create: `backend/internal/services/sync_execution_service.go`
- Modify: `backend/internal/services/repository_sync_scheduler.go`
- Modify: `backend/internal/web/app_admin_content_handlers.go`
- Test: `backend/internal/services/sync_execution_service_test.go`
- Test: `backend/internal/web/app_admin_content_remote_sync_test.go`

- [ ] **Step 1: Write failing tests for manual and scheduled sync orchestration**

Cover these scenarios:

1. manual repository sync creates async job, starts run, updates skill, completes run, writes audit
2. scheduled repository sync creates async job, starts run, records failure when batch fails
3. partial sync failure marks run failed with structured error fields

Example test shape:

```go
func TestSyncExecutionServiceManualRepositorySyncCreatesUnifiedChain(t *testing.T) {
    result, err := svc.RunManualRepositorySync(ctx, input)
    require.NoError(t, err)
    require.NotNil(t, result.AsyncJob)
    require.NotNil(t, result.SyncRun)
    require.NotZero(t, result.SyncRun.ID)
}
```

- [ ] **Step 2: Run focused orchestration tests to verify failure**

Run:

```bash
cd backend && go test ./internal/services ./internal/web -run 'TestSyncExecutionService|TestHandleRemoteSync' -v
```

Expected:

1. missing coordinator methods or missing linkage assertions

- [ ] **Step 3: Implement a dedicated sync execution service**

Responsibilities:

1. create or reuse async job when required
2. create pending sync run
3. transition run and job to running
4. invoke repository or SkillMP sync workflow
5. pass run metadata into version capture
6. mark run and job success or failure consistently
7. return one structured result object for handler and scheduler use

Rules:

1. manual remote sync and scheduler must both call the same service
2. audit should be emitted by the caller after service result is known
3. scheduler logging may remain in scheduler, but persistence ownership moves to the coordinator

- [ ] **Step 4: Re-run focused orchestration tests**

Run:

```bash
cd backend && go test ./internal/services ./internal/web -run 'TestSyncExecutionService|TestHandleRemoteSync' -v
```

Expected:

1. manual and scheduled sync flows produce the same linkage pattern
2. remote sync tests verify run creation and failure handling

- [ ] **Step 5: Commit the orchestration changes**

```bash
git add backend/internal/services/sync_execution_service.go \
  backend/internal/services/repository_sync_scheduler.go \
  backend/internal/web/app_admin_content_handlers.go \
  backend/internal/services/sync_execution_service_test.go \
  backend/internal/web/app_admin_content_remote_sync_test.go
git commit -m "feat: unify sync execution orchestration"
```

### Task 4: Align async jobs with the unified sync contract

**Files:**
- Modify: `backend/internal/models/async_job.go`
- Modify: `backend/internal/services/async_job_service.go`
- Modify: `backend/internal/services/async_job_service_test.go`
- Modify: `backend/internal/web/app_admin_ingestion_jobs.go`

- [ ] **Step 1: Write failing tests for retry and run linkage behavior**

Add tests that assert:

1. retrying a failed sync job increments attempt and creates or reuses a new run record correctly
2. payload dedupe does not merge unrelated source types
3. canceled sync jobs cannot leave dangling running runs

- [ ] **Step 2: Run the async job tests**

Run:

```bash
cd backend && go test ./internal/services -run 'TestAsyncJobService' -v
```

Expected:

1. failures around retry semantics or missing sync linkage coordination

- [ ] **Step 3: Tighten async job behavior for sync governance**

Implementation rules:

1. keep import job behavior stable
2. ensure retry semantics are explicit for sync jobs
3. ensure cancel clears or updates associated run state through the orchestration layer
4. keep payload digest sanitization and dedupe behavior deterministic

- [ ] **Step 4: Re-run async job tests**

Run:

```bash
cd backend && go test ./internal/services -run 'TestAsyncJobService' -v
```

Expected:

1. retry and cancel behavior is deterministic
2. no regression in ingestion job tests

- [ ] **Step 5: Commit the async job alignment**

```bash
git add backend/internal/models/async_job.go \
  backend/internal/services/async_job_service.go \
  backend/internal/services/async_job_service_test.go \
  backend/internal/web/app_admin_ingestion_jobs.go
git commit -m "feat: align async jobs with sync governance"
```

## Chunk 3: Transport, OpenAPI, and Verification

### Task 5: Replace alias-style sync run transport behavior with dedicated contracts

**Files:**
- Modify: `backend/internal/web/app_admin_api_sync_jobs_handlers.go`
- Modify: `backend/internal/web/app_sync_runs_alias_api.go`
- Modify: `backend/internal/web/app_skill_sync_runs_api.go`
- Modify: `backend/internal/web/openapi_paths_admin_sync_policies.go`
- Modify: `backend/internal/web/openapi_paths_moderation_interaction.go`
- Modify: `backend/internal/web/openapi_schemas_sync_policies.go`
- Test: `backend/internal/web/app_sync_runs_alias_api_test.go`
- Test: `backend/internal/web/app_skill_sync_runs_api_test.go`
- Create: `backend/internal/web/app_sync_execution_api_test.go`

- [ ] **Step 1: Write failing API tests for the new sync run payloads**

Verify:

1. admin sync run list returns dedicated run fields
2. skill sync run list returns run linkage fields
3. alias endpoints still behave correctly
4. error responses remain backward-compatible where required

Example assertion:

```go
func TestAPIAdminSyncRunsIncludesAsyncJobAndAttempt(t *testing.T) {
    require.Contains(t, body, `"async_job_id"`)
    require.Contains(t, body, `"attempt"`)
}
```

- [ ] **Step 2: Run focused web tests**

Run:

```bash
cd backend && go test ./internal/web -run 'TestAPIAdminSyncRuns|TestAPISkillSyncRuns|TestSyncRunsAlias' -v
```

Expected:

1. payload mismatch failures
2. missing OpenAPI schema field failures

- [ ] **Step 3: Update handlers and OpenAPI schemas**

Implementation rules:

1. `sync-runs` becomes the primary vocabulary
2. `sync-jobs` may remain as compatibility alias if still needed by UI
3. response shaping must expose stable fields:
   - `run_id`
   - `status`
   - `trigger_type`
   - `source_type`
   - `async_job_id`
   - `attempt`
   - `target_skill_id`
   - `started_at`
   - `finished_at`
   - `duration_ms`
   - `error_code`
   - `error_message`
4. skill-scoped detail routes must enforce ownership or admin visibility exactly as before

- [ ] **Step 4: Re-run focused web tests**

Run:

```bash
cd backend && go test ./internal/web -run 'TestAPIAdminSyncRuns|TestAPISkillSyncRuns|TestSyncRunsAlias' -v
```

Expected:

1. handler and OpenAPI tests pass
2. compatibility routes still work

- [ ] **Step 5: Commit the transport and OpenAPI changes**

```bash
git add backend/internal/web/app_admin_api_sync_jobs_handlers.go \
  backend/internal/web/app_sync_runs_alias_api.go \
  backend/internal/web/app_skill_sync_runs_api.go \
  backend/internal/web/openapi_paths_admin_sync_policies.go \
  backend/internal/web/openapi_paths_moderation_interaction.go \
  backend/internal/web/openapi_schemas_sync_policies.go \
  backend/internal/web/app_sync_runs_alias_api_test.go \
  backend/internal/web/app_skill_sync_runs_api_test.go \
  backend/internal/web/app_sync_execution_api_test.go
git commit -m "feat: expose dedicated sync run contracts"
```

### Task 6: End-to-end verification and documentation

**Files:**
- Modify: `docs/plans/2026-03-21-skill-management-backend-gap-closure-checklist.md`
- Modify: `docs/plans/2026-03-21-skill-management-backend-requirement-review.md`
- Modify: `docs/design-requirements/test-acceptance/test-acceptance.md`

- [ ] **Step 1: Update the docs after implementation**

Document:

1. which gaps were closed
2. which compatibility behavior remains
3. what still stays out of scope for the next phase

- [ ] **Step 2: Run the backend verification suite**

Run:

```bash
cd backend && go test ./...
cd backend && go vet ./...
```

Expected:

1. all backend tests pass
2. no vet regressions

- [ ] **Step 3: Record verification evidence in the docs**

Add:

1. commands executed
2. changed behavior summary
3. residual risk list

- [ ] **Step 4: Commit the verification and documentation updates**

```bash
git add docs/plans/2026-03-21-skill-management-backend-gap-closure-checklist.md \
  docs/plans/2026-03-21-skill-management-backend-requirement-review.md \
  docs/design-requirements/test-acceptance/test-acceptance.md
git commit -m "docs: update sync governance closure evidence"
```

## Risks To Watch During Execution

1. `sync run` and `async job` can easily become duplicate state machines if ownership is not explicit.
2. `SkillVersion` linkage must not break existing compare, rollback, or retention logic.
3. Scheduler changes must not introduce hidden startup-time mutations outside explicit sync execution.
4. Alias endpoints must remain compatible until the frontend stops depending on them.

## Completion Criteria

The first-stage governance chain is complete when:

1. manual sync and scheduled sync both create stable sync run records
2. sync runs can be linked to async jobs and skill versions
3. failures are stored as structured run errors instead of summary-only text
4. admin and skill-scoped APIs expose dedicated sync run payloads
5. audit, version, run, and job records can be correlated without relying on logs alone

Plan complete and saved to `docs/superpowers/plans/2026-03-21-sync-governance-unified-chain-implementation-plan.md`. Ready to execute?
