# Sync Governance Unification Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前分散的 `sync policy / async job / sync run / skill version / audit` 能力收口为一条统一、可追踪、可验收的同步治理链路。

**Architecture:** 保持现有后端分层不变，在 `models` 中补齐统一治理对象，在 `services` 中把任务、运行记录、版本快照和审计事件串成同一工作流，在 `web` 层收口 admin 与 skill 维度接口，避免继续依赖 alias/复用式实现。整个改造优先采用向后兼容扩展，先补字段和服务边界，再调整路由与测试。

**Tech Stack:** Go, GORM, Chi, existing backend services/tests, Markdown planning docs.

---

## Scope and Assumptions

1. 本计划只覆盖第一阶段最高优先级工作：`sync / job / version / audit` 统一治理链路。
2. 本计划默认保持现有用户角色边界不变，不引入新的角色模型。
3. 本计划默认不一次性重构全部历史命名，优先通过兼容方式把 `sync runs` 从当前 `sync jobs alias` 过渡到独立契约。
4. 本计划默认继续复用现有 `SkillVersionService` 与 `AuditService`，只补它们与 sync run 的关联字段和调用时机。

## File Structure

### Existing files to modify

- `backend/internal/models/sync_job_run.go`
  - 扩展 sync run 模型为真正的运行记录对象
- `backend/internal/models/async_job.go`
  - 增加与 sync run 关联所需字段
- `backend/internal/models/skill_version.go`
  - 增加 run 关联与操作者补充字段
- `backend/internal/services/sync_job_service.go`
  - 从简单记录服务升级为统一 sync run 服务
- `backend/internal/services/async_job_service.go`
  - 与 sync run 建立一致状态和引用关系
- `backend/internal/services/skill_version_service.go`
  - 支持通过 run 维度捕获版本快照
- `backend/internal/services/repository_sync_policy_service.go`
  - 从 repository-only 默认策略向通用策略接口过渡
- `backend/internal/web/app_admin_api_sync_jobs_handlers.go`
  - 收口 admin sync run 查询行为
- `backend/internal/web/app_sync_runs_alias_api.go`
  - 逐步从 alias 转向真实 sync run handler
- `backend/internal/web/app_skill_sync_runs_api.go`
  - 输出 skill 维度真实 run 契约
- `backend/internal/web/openapi_paths_admin_sync_policies.go`
  - 更新 sync policy / sync run 文档契约
- `backend/internal/web/openapi_schemas_sync_policies.go`
  - 更新 schema

### New files to create

- `backend/internal/models/sync_policy.go`
  - 定义通用 sync policy 模型
- `backend/internal/services/sync_policy_service.go`
  - 承接通用 sync policy CRUD 与启停逻辑
- `backend/internal/services/sync_governance_service.go`
  - 统一编排 async job、sync run、skill version、audit
- `backend/internal/services/sync_run_contracts.go`
  - 存放 sync run 输入输出 DTO，避免 service 文件继续膨胀
- `backend/internal/web/app_admin_api_sync_runs_handlers.go`
  - 真正的 admin sync runs handler
- `backend/internal/web/app_admin_api_sync_policies_handlers.go`
  - 真正的 admin sync policies handler
- `backend/internal/services/sync_policy_service_test.go`
- `backend/internal/services/sync_governance_service_test.go`
- `backend/internal/web/app_admin_api_sync_runs_handlers_test.go`
- `backend/internal/web/app_admin_api_sync_policies_handlers_test.go`

### Tests to update

- `backend/internal/services/sync_job_service_test.go`
- `backend/internal/services/skill_version_service_test.go`
- `backend/internal/web/app_sync_runs_alias_api_test.go`
- `backend/internal/web/app_skill_sync_runs_api_test.go`
- `backend/internal/web/openapi_test.go`

---

## Chunk 1: 统一数据模型与服务契约

### Task 1: Define the target sync governance contract

**Files:**
- Create: `backend/internal/models/sync_policy.go`
- Modify: `backend/internal/models/sync_job_run.go`
- Modify: `backend/internal/models/async_job.go`
- Modify: `backend/internal/models/skill_version.go`
- Test: `backend/internal/services/sync_policy_service_test.go`

- [ ] **Step 1: Write the failing model/service tests**

Add tests that assert:

1. `SyncPolicy` supports `policy_name`, `source_type`, `target_scope`, `enabled`, retry fields.
2. `SyncJobRun` supports `policy_id`, `job_id`, `trigger_type`, `attempt`, `error_code`, `error_message`, `source_revision`.
3. `AsyncJob` can reference one sync run.
4. `SkillVersion` can record `run_id`.

Run:

```bash
cd backend && go test ./internal/services -run 'SyncPolicy|SyncJob|SkillVersion' -v
```

Expected:

1. Tests fail because new fields/contracts do not exist yet.

- [ ] **Step 2: Add the missing models and fields**

Implement:

1. `SyncPolicy` model with GORM indexes and repository/skillmp source constraints.
2. Extend `SyncJobRun` from summary-style record to run-level contract.
3. Add `SyncRunID` reference on `AsyncJob`.
4. Add `RunID` reference on `SkillVersion`.

- [ ] **Step 3: Add normalization and compatibility helpers**

Implement helpers that:

1. Normalize trigger type to `manual|scheduled|retry`.
2. Keep compatibility with existing repository default policy behavior during migration.
3. Prevent zero-value invalid records from being persisted.

- [ ] **Step 4: Run focused tests**

Run:

```bash
cd backend && go test ./internal/services -run 'SyncPolicy|SyncJob|SkillVersion' -v
```

Expected:

1. Tests pass for new model/service contracts.

- [ ] **Step 5: Commit**

```bash
git add backend/internal/models backend/internal/services
git commit -m "feat: define unified sync governance models"
```

### Task 2: Split policy and run responsibilities into dedicated services

**Files:**
- Create: `backend/internal/services/sync_policy_service.go`
- Create: `backend/internal/services/sync_run_contracts.go`
- Modify: `backend/internal/services/repository_sync_policy_service.go`
- Modify: `backend/internal/services/sync_job_service.go`
- Test: `backend/internal/services/sync_policy_service_test.go`
- Test: `backend/internal/services/sync_job_service_test.go`

- [ ] **Step 1: Write failing service tests for unified policy/run behavior**

Cover:

1. Generic policy CRUD.
2. Listing runs by policy, skill, owner, status, trigger type.
3. Rejecting invalid transitions or missing required references.

Run:

```bash
cd backend && go test ./internal/services -run 'SyncPolicyService|SyncJobService' -v
```

Expected:

1. Tests fail because generic policy/run service behavior is incomplete.

- [ ] **Step 2: Implement generic sync policy service**

Implement service methods for:

1. Create
2. Update
3. Toggle
4. Delete or soft-disable
5. List
6. Get by ID

Keep `RepositorySyncPolicyService` as a compatibility adapter that delegates to the new service.

- [ ] **Step 3: Upgrade sync job service into a true sync run service**

Refactor `sync_job_service.go` so it can:

1. Create pending/running/succeeded/failed/canceled runs.
2. Update lifecycle state explicitly.
3. Query by admin and skill scopes with stable filters.
4. Return structured run records instead of batch summary-only records.

- [ ] **Step 4: Run focused tests**

Run:

```bash
cd backend && go test ./internal/services -run 'SyncPolicyService|SyncJobService' -v
```

Expected:

1. Tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/internal/services
git commit -m "feat: add unified sync policy and run services"
```

---

## Chunk 2: 串起 async job、sync run、skill version、audit

### Task 3: Introduce one orchestration service for the sync governance chain

**Files:**
- Create: `backend/internal/services/sync_governance_service.go`
- Modify: `backend/internal/services/async_job_service.go`
- Modify: `backend/internal/services/skill_version_service.go`
- Modify: `backend/internal/services/audit_service.go`
- Test: `backend/internal/services/sync_governance_service_test.go`

- [ ] **Step 1: Write failing orchestration tests**

Cover:

1. Manual sync creates async job and sync run together.
2. Scheduled sync creates async job and sync run with `trigger_type=scheduled`.
3. Retry reuses logical lineage but creates a new run attempt.
4. Successful sync captures one `SkillVersion` with `run_id`.
5. Failed sync records run failure and audit entry without creating a new version.

Run:

```bash
cd backend && go test ./internal/services -run 'SyncGovernanceService' -v
```

Expected:

1. Tests fail because no unified orchestration service exists.

- [ ] **Step 2: Implement orchestration service**

Implement one service that:

1. Creates async job and sync run in one transaction.
2. Drives state transitions consistently.
3. Calls `SkillVersionService` only on successful sync completion.
4. Emits audit actions for create/retry/cancel/success/failure/rollback.

- [ ] **Step 3: Extend version capture API to accept run context**

Update `SkillVersionService` to accept optional:

1. `run_id`
2. `actor_user_id`
3. `trigger`

Ensure rollback still creates a new version and can write auditable run linkage when applicable.

- [ ] **Step 4: Run focused tests**

Run:

```bash
cd backend && go test ./internal/services -run 'SyncGovernanceService|SkillVersionService' -v
```

Expected:

1. Tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/internal/services
git commit -m "feat: unify sync job run version and audit orchestration"
```

### Task 4: Align async job transitions with sync run lifecycle

**Files:**
- Modify: `backend/internal/services/async_job_service.go`
- Modify: `backend/internal/services/sync_job_service.go`
- Test: `backend/internal/services/async_job_service_test.go`
- Test: `backend/internal/services/sync_job_service_test.go`

- [ ] **Step 1: Write failing transition tests**

Cover:

1. `pending -> running -> succeeded|failed|canceled`
2. Retry only from failed state
3. Cancel only from pending/running
4. Sync run status must stay coherent with async job status

Run:

```bash
cd backend && go test ./internal/services -run 'AsyncJobService|SyncJobService' -v
```

Expected:

1. Tests fail where current transitions are loose or not cross-validated.

- [ ] **Step 2: Tighten transition rules**

Implement:

1. One mapping table between async job status and sync run status.
2. Validation that prevents job/run divergence.
3. Consistent retry attempt increment logic.

- [ ] **Step 3: Run focused tests**

Run:

```bash
cd backend && go test ./internal/services -run 'AsyncJobService|SyncJobService' -v
```

Expected:

1. Tests pass.

- [ ] **Step 4: Commit**

```bash
git add backend/internal/services
git commit -m "fix: align async job and sync run transitions"
```

---

## Chunk 3: 收口 web 接口、OpenAPI 与验收

### Task 5: Replace alias-style sync run handlers with real run handlers

**Files:**
- Create: `backend/internal/web/app_admin_api_sync_runs_handlers.go`
- Create: `backend/internal/web/app_admin_api_sync_policies_handlers.go`
- Modify: `backend/internal/web/app_sync_runs_alias_api.go`
- Modify: `backend/internal/web/app_sync_policies_alias_api.go`
- Modify: `backend/internal/web/app_skill_sync_runs_api.go`
- Test: `backend/internal/web/app_admin_api_sync_runs_handlers_test.go`
- Test: `backend/internal/web/app_admin_api_sync_policies_handlers_test.go`
- Test: `backend/internal/web/app_sync_runs_alias_api_test.go`
- Test: `backend/internal/web/app_skill_sync_runs_api_test.go`

- [ ] **Step 1: Write failing handler tests**

Cover:

1. Admin list/detail returns real sync run fields.
2. Skill list/detail filters by `skill_id`.
3. Policy CRUD supports real policy objects.
4. Old alias routes remain callable during migration.

Run:

```bash
cd backend && go test ./internal/web -run 'SyncRuns|SyncPolicies' -v
```

Expected:

1. Tests fail because handlers still rely on alias or summary behavior.

- [ ] **Step 2: Implement real handlers**

Implement:

1. Dedicated admin sync run list/detail handlers.
2. Dedicated admin sync policy CRUD handlers.
3. Alias handlers as temporary wrappers only where compatibility is still needed.
4. Real filter parsing for status, trigger type, owner, policy, skill.

- [ ] **Step 3: Run focused tests**

Run:

```bash
cd backend && go test ./internal/web -run 'SyncRuns|SyncPolicies' -v
```

Expected:

1. Tests pass.

- [ ] **Step 4: Commit**

```bash
git add backend/internal/web
git commit -m "feat: add real sync run and sync policy api handlers"
```

### Task 6: Update OpenAPI, acceptance docs, and regression coverage

**Files:**
- Modify: `backend/internal/web/openapi_paths_admin_sync_policies.go`
- Modify: `backend/internal/web/openapi_schemas_sync_policies.go`
- Modify: `backend/internal/web/openapi_test.go`
- Modify: `docs/design-requirements/ingestion-sync/async-sync-job-orchestration.md`
- Modify: `docs/design-requirements/ingestion-sync/scheduled-sync-version-history.md`
- Modify: `docs/design-requirements/test-acceptance/test-acceptance.md`

- [ ] **Step 1: Write or update failing OpenAPI/contract tests**

Run:

```bash
cd backend && go test ./internal/web -run 'OpenAPI|SyncRuns|SyncPolicies' -v
```

Expected:

1. Tests fail because schemas and paths do not match the new run/policy contracts.

- [ ] **Step 2: Update API documentation and acceptance language**

Update:

1. OpenAPI path descriptions
2. Schema fields
3. Acceptance matrix wording so it matches the new job/run/version/audit contract

- [ ] **Step 3: Run backend quality gates**

Run:

```bash
cd backend && go test ./...
cd backend && go vet ./...
```

Expected:

1. All backend tests pass.
2. `go vet` passes without new issues.

- [ ] **Step 4: Commit**

```bash
git add backend/internal/web docs/design-requirements
git commit -m "docs: align sync governance api and acceptance contracts"
```

---

## Final Verification

- [ ] Run:

```bash
cd backend && go test ./...
```

Expected:

1. Full backend test suite passes.

- [ ] Run:

```bash
cd backend && go vet ./...
```

Expected:

1. Vet passes.

- [ ] Run:

```bash
./scripts/check_max_lines.sh
```

Expected:

1. No new file exceeds repository file-size limits.

---

## Risks to Watch

1. Alias route migration may silently preserve old weak semantics if wrappers are not reduced quickly.
2. `AsyncJob` and `SyncJobRun` may drift again if transition rules are duplicated in multiple services.
3. `SkillVersion` backfill or nullable `run_id` handling may break old version queries if not covered by tests.
4. OpenAPI may lag behind real handlers if schema updates are deferred to the end.

## Done Definition

This plan is complete only when:

1. `sync policy` is a real managed object rather than only a repository default alias.
2. `sync run` is a first-class contract instead of a sync job summary alias.
3. async job, sync run, skill version, and audit can be traced end-to-end.
4. admin and skill-level endpoints return stable, documented contracts.
5. acceptance docs and backend tests reflect the new unified governance model.
