# SkillsIndex Development Plan Refresh

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Refresh the development plan based on the current implementation state, the active worktree changes, and the latest requirement baseline, then define the next delivery phases.

**Architecture:** Treat the codebase as three coordinated tracks: product capability delivery, platform contract hardening, and release-quality verification. Short-term work should first stabilize the active frontend workspace/governance refactor, then synchronize requirement status with real implementation, and only then open the next wave of gap-closure development.

**Tech Stack:** Go backend (Chi, GORM), React 18 frontend (TypeScript, Vite, Ant Design), Playwright E2E, visual regression, Markdown planning docs.

---

## 1. Current Execution Snapshot

### 1.1 Recently completed execution

1. `ralph/progress.txt` shows `pages-directory-maintainability-refactor` completed on `2026-03-06`.
2. Verification evidence already exists for the completed refactor:
   - `cd frontend && npm run test:unit`
   - `cd frontend && npm run test:e2e`
   - `cd frontend && npm run test:visual`
   - `cd frontend && npm run build`
   - `./scripts/check_max_lines.sh`
3. This means the recent frontend maintainability pass can be treated as the new baseline rather than ongoing feature risk.

### 1.2 Current active worktree focus

The current working tree indicates an in-progress frontend information architecture consolidation rather than a brand-new feature stream. Main signals:

1. Workspace/governance navigation and shell composition are being refactored:
   - `frontend/src/App.tsx`
   - `frontend/src/components/BackendWorkbenchShell.tsx`
   - `frontend/src/pages/WorkspaceCenterPage.tsx`
   - `frontend/src/pages/WorkspaceDashboardPageContent.tsx`
   - `frontend/src/pages/WorkspaceCenterPage.navigation.ts`
2. Prototype routing and catalog alignment are being simplified:
   - `frontend/src/lib/prototypeCatalog.ts`
   - `frontend/src/lib/prototypeRouteResolver.ts`
   - `frontend/src/pages/PrototypeRouteRenderer.tsx`
3. One legacy page is being removed:
   - `frontend/src/pages/RolloutWorkflowPage.tsx`
4. Regression assets and tests are already being adjusted in parallel:
   - `frontend/e2e/prototype-routes-completion.spec.ts`
   - `frontend/src/pages/WorkspaceCenterPage.navigation.test.ts`
   - `frontend/src/pages/WorkspacePrototypePageShell.test.ts`
   - `frontend/src/components/BackendWorkbenchShell.test.tsx`

### 1.3 Backend capability baseline already present

The backend already exposes more governance and target-state routes than the requirement documents currently admit. Representative implemented route groups include:

1. Async jobs:
   - `/api/v1/admin/jobs`
   - `/api/v1/admin/jobs/{jobID}`
   - `/api/v1/admin/jobs/{jobID}/retry`
   - `/api/v1/admin/jobs/{jobID}/cancel`
2. Sync governance:
   - `/api/v1/admin/sync-runs`
   - `/api/v1/admin/sync-policies`
3. Account governance:
   - `/api/v1/admin/accounts`
   - `/api/v1/admin/accounts/{userID}/status`
   - `/api/v1/admin/accounts/{userID}/force-signout`
   - `/api/v1/admin/accounts/{userID}/password-reset`
4. Organization and moderation governance:
   - `/api/v1/admin/organizations`
   - `/api/v1/admin/moderation`
5. API key scope and SSO governance:
   - `/api/v1/admin/apikeys/{keyID}/scopes`
   - `/api/v1/admin/sso/providers`
   - `/api/v1/admin/sso/users/sync`

This indicates the codebase is ahead of the current requirement status labels for several modules.

---

## 2. Updated Development Judgment

### 2.1 Done and accepted baseline

Treat the following as completed baseline work unless regression appears:

1. Frontend/backend separation foundation
2. Public and admin route API exposure baseline
3. Recent frontend page maintainability refactor
4. Requirement directory cleanup and capability-layer README restructuring

### 2.2 Work currently in progress

The active in-flight stream is:

1. Workspace/dashboard/governance information hierarchy consolidation
2. Prototype route simplification and obsolete page removal
3. Sidebar, topbar, and shell composition cleanup
4. Focused regression coverage updates for the new route and layout model

### 2.3 Highest current planning gaps

The biggest remaining planning gaps are not “missing pages”, but mismatch between implementation, requirement status, and delivery sequencing:

1. Requirement documents still mark several implemented modules as target-state only
2. Session/account lifecycle model is still not fully self-consistent
3. API key security boundary and scope model are not fully aligned with implementation
4. Data model, audit model, and moderation/version access constraints remain under-specified
5. Release-quality gates for the next capability wave are not yet staged into a single delivery plan

---

## 3. Near-Term Execution Plan (Current Branch Stabilization)

### Task 1: Finish workspace and governance route consolidation

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/BackendWorkbenchShell.tsx`
- Modify: `frontend/src/pages/WorkspaceCenterPage.tsx`
- Modify: `frontend/src/pages/WorkspaceCenterPage.navigation.ts`
- Modify: `frontend/src/pages/WorkspaceCenterPageSectionViews.tsx`
- Create/Modify: `frontend/src/pages/WorkspaceDashboardPageContent.tsx`
- Remove/verify removal: `frontend/src/pages/RolloutWorkflowPage.tsx`

**Expected outcome:**
1. One stable route model for workspace/governance/records/admin shells
2. No orphaned route references to removed rollout-specific pages
3. Navigation, anchor mode, and section mode behave consistently in dark/light/mobile variants

**Verification:**
- `cd frontend && npm run test:unit -- WorkspaceCenterPage.navigation`
- `cd frontend && npm run test:unit -- PrototypeRouteRenderer`
- `cd frontend && npm run test:e2e -- prototype-routes-completion`

### Task 2: Close the prototype catalog and shell regression loop

**Files:**
- Modify: `frontend/src/lib/prototypeCatalog.ts`
- Modify: `frontend/src/lib/prototypeCatalogRouteFallback.ts`
- Modify: `frontend/src/lib/prototypeRouteResolver.ts`
- Modify: `frontend/src/pages/PrototypeRouteRenderer.tsx`
- Test: `frontend/src/lib/prototypeRouteResolver.test.ts`
- Test: `frontend/src/pages/PrototypeRouteRenderer.test.ts`
- Test: `frontend/src/components/BackendWorkbenchShell.test.tsx`

**Expected outcome:**
1. Prototype catalog entries match active route families
2. Removed/merged pages no longer appear in catalog resolution
3. Shell-level route handling is deterministic

**Verification:**
- `cd frontend && npm run test:unit -- prototypeRouteResolver`
- `cd frontend && npm run test:unit -- BackendWorkbenchShell`

### Task 3: Re-baseline visual and layout evidence for the current frontend pass

**Files:**
- Modify: `frontend/e2e/prototype-routes-completion.spec.ts`
- Update artifacts: `frontend/prototype-baselines/*`
- Review style bridge files touched in current branch

**Expected outcome:**
1. Visual baselines reflect the consolidated route and shell structure
2. Current branch can be reviewed as one coherent frontend pass

**Verification:**
- `cd frontend && npm run test:visual`
- `cd frontend && npm run build`

---

## 4. Plan Refresh for Requirement and Delivery Alignment

### Task 4: Synchronize requirement status with real implementation

**Files:**
- Modify: `docs/design-requirements/overview/functional-coverage-matrix.md`
- Modify: `docs/design-requirements/overview/requirement-traceability.md`
- Modify: `docs/design-requirements/test-acceptance/test-acceptance.md`
- Modify: `docs/design-requirements/README.md`

**Scope:**
1. Reclassify modules from `目标态（待实现）` to `部分覆盖` where routes or APIs already exist
2. Separate “route exists” from “requirement closed” and “release ready”
3. Make the requirement layer reflect the current codebase truthfully

**Verification:**
- Manual document consistency review
- Optional grep-based check for all route references against `backend/internal/web/app_routing.go`

### Task 5: Resolve the identity and access contract gaps

**Files:**
- Modify: `docs/design-requirements/auth-rbac/auth-session-rbac.md`
- Modify: `docs/design-requirements/auth-rbac/account-management.md`
- Modify: `docs/design-requirements/auth-rbac/account-center-implementation.md`
- Modify: `docs/design-requirements/admin-governance/admin-account-operations.md`
- Modify: `docs/design-requirements/data-model/data-model-constraints.md`

**Scope:**
1. Define the real session model and revocation semantics
2. Define account lifecycle states and transitions
3. Align self-service account actions with admin governance actions
4. Ensure the data model and audit model can support these flows

**Verification:**
- Requirement review against existing backend endpoints
- Confirm all affected FRs map to acceptance scenarios in `test-acceptance.md`

### Task 6: Resolve the API key and security boundary gaps

**Files:**
- Modify: `docs/design-requirements/public-api/openapi-public-api.md`
- Modify: `docs/design-requirements/public-api/api-key-scope-governance.md`
- Modify: `docs/design-requirements/non-functional/nfr.md`
- Modify: `docs/design-requirements/test-acceptance/test-acceptance.md`

**Scope:**
1. Decide which interfaces are permanently `session + CSRF` only
2. Remove or explicitly govern static key bypass behavior
3. Unify scope naming with implementation
4. Define 401/403/429/error behavior and pagination/limit constraints

**Verification:**
- Review against backend API key service and OpenAPI paths
- Ensure acceptance cases exist for invalid key, scope denied, rotate, revoke, expiry

---

## 5. Next Delivery Wave (Post-Alignment Development)

### Phase A: Governance contract hardening

Priority: P0

1. Finalize session, account, audit, and API key contracts
2. Finalize moderation case state model and organization/workspace ownership rules
3. Finalize version-history visibility and deletion/archive rules

**Exit criteria:**
- No major cross-document contradiction remains in auth, governance, API security, or audit design

### Phase B: Backend gap closure for incomplete governance flows

Priority: P0/P1

1. Complete account governance behavior where routes exist but contracts are incomplete
2. Complete moderation workflow semantics
3. Complete organization membership safeguards and owner protection semantics
4. Complete sync job/run/version chain semantics and access rules

**Verification:**
- `go test ./backend/internal/...`
- targeted handler/service regression suites

### Phase C: Frontend governance experience completion

Priority: P1

1. Finish real governance workbench page flows for accounts, organizations, moderation, jobs, and sync runs
2. Align frontend states with the updated backend contracts
3. Eliminate prototype-only navigation assumptions in governed routes

**Verification:**
- focused frontend unit tests
- Playwright flows for governance operations
- visual regression on critical admin pages

### Phase D: Platform foundation hardening

Priority: P1/P2

1. Expand data model constraints and indexes for discovery, governance, and audit use cases
2. Add observability and ops acceptance baselines
3. Add performance and release-gate evidence paths to the plan

**Verification:**
- `go test ./...`
- `cd frontend && npm run build`
- NFR evidence collection tasks

---

## 6. Recommended Sequence for the Next 4 Development Windows

### Window 1: Stabilize current branch

1. Finish workspace/governance route consolidation
2. Make unit/e2e/visual/build green again
3. Merge only after layout and routing behavior are stable

### Window 2: Refresh requirement truth

1. Update requirement status documents to match the real implementation baseline
2. Mark `部分覆盖` vs `目标态（待实现）`
3. Produce one authoritative status snapshot for product, engineering, and QA

### Window 3: Close platform contract gaps

1. Identity/session/account contract pass
2. API key/security contract pass
3. Data model/audit contract pass

### Window 4: Open the next implementation stream

1. Governance flow completion
2. Organization and moderation completion
3. Release-quality regression and NFR proof gathering

---

## 7. Delivery Risks and Controls

### Main risks

1. Continuing frontend refactor without freezing route semantics will cause repeated test churn
2. Continuing feature delivery without updating requirement status will keep planning inaccurate
3. Implementing governance flows before session/account/security contracts are finalized will create rework
4. Leaving API key scope naming and permission boundaries inconsistent will create security drift

### Controls

1. Do not open a new major feature stream before the current workspace/governance refactor is verified
2. Complete requirement status synchronization before new “gap closure” claims are made
3. Treat identity/session/API security/data model as shared contracts and review them before feature expansion
4. Keep verification evidence attached to each phase, not only at release time

---

## 8. Verification Gate for This Plan Refresh

Before claiming the next phase is ready, run and record:

1. `cd frontend && npm run test:unit`
2. `cd frontend && npm run test:e2e`
3. `cd frontend && npm run test:visual`
4. `cd frontend && npm run build`
5. `go test ./...`
6. `./scripts/check_max_lines.sh`

If any of these cannot run, capture the skipped command, the reason, and the residual risk in the next update.

---

## 9. Immediate Recommendation

The immediate recommendation is:

1. Finish and verify the active frontend workspace/governance consolidation branch
2. Refresh requirement status documents to reflect actual backend and frontend coverage
3. Start the next implementation wave only after the contract layer is cleaned up

This sequencing minimizes rework and makes the next development plan measurable.
