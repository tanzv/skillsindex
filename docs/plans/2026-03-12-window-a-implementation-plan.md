# Window A Security And Audit Foundation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close Window A by hardening API key scope enforcement, upgrading audit foundations, completing password reset audit coverage, adding login failure throttling, and formally deciding the `marketplace_public_access` baseline.

**Architecture:** Keep the implementation centered on existing backend services and web handlers. Harden behavior first in service-level contracts and middleware, then propagate the new semantics into audit export, password reset flow, login flow, OpenAPI/docs, and only finally into frontend or E2E coverage when the marketplace access toggle is retained.

**Tech Stack:** Go, Chi, GORM, Vitest, Playwright, OpenAPI schema generation, Markdown plan/docs.

## Execution Status (2026-03-12)

- Implementation status: Window A implementation is complete for the scoped backend, contract, and documentation changes. Commit steps remain intentionally open because the current worktree contains unrelated user changes.
- Implementation note: The final patch set converged on `backend/internal/web/app_login_protection.go`, `backend/internal/web/app_response_helpers.go`, `backend/internal/db/db.go`, and `backend/internal/web/openapi_paths_admin_ops.go`. Some candidate files listed below did not require direct edits after implementation review.
- Marketplace decision: Retain `marketplace_public_access`. Existing redirect-and-return coverage in `frontend/e2e/public-route-prefix.spec.ts` was reused instead of adding a duplicate Playwright spec.
- Verification evidence:
  - `GOCACHE=/tmp/skillsindex-go-build go test ./...` in `backend/` passed.
  - `npm exec -- vitest run src/lib/api.test.ts` in `frontend/` passed.
  - `npm exec -- playwright test e2e/public-route-prefix.spec.ts --grep 'private marketplace redirects anonymous visits'` in `frontend/` passed.
- Review follow-up: Final review findings on marketplace login redirect preservation and password-reset confirm audit ordering were fixed and covered by backend regression tests.
- Known unrelated issue: `VITE_MARKETPLACE_HOME_MODE=prototype npm run build` in `frontend/` still fails because of pre-existing workspace issues in `src/components/AppShellTopbar.test.ts`, `src/lib/visualRegressionRuntime.test.ts`, and `../../scripts/visual-regression/runtime.mjs` declarations.

---

## File Map

### Backend Core

- Modify: `backend/internal/services/api_key_service.go`
- Modify: `backend/internal/services/api_key_service_test.go`
- Modify: `backend/internal/services/api_key_service_update_scopes_test.go`
- Modify: `backend/internal/services/auth_service.go`
- Modify: `backend/internal/services/auth_service_test.go`
- Modify: `backend/internal/services/audit_service.go`
- Modify: `backend/internal/services/audit_service_test.go`
- Modify: `backend/internal/services/ops_service_helpers.go`
- Modify: `backend/internal/services/ops_service_records.go`
- Modify: `backend/internal/services/ops_service.go`
- Modify: `backend/internal/services/ops_service_test.go`
- Modify: `backend/internal/models/audit_log.go`

### Backend Web Layer

- Modify: `backend/internal/web/app_routing.go`
- Modify: `backend/internal/web/app_account_reset_api.go`
- Modify: `backend/internal/web/app_account_reset_api_test.go`
- Modify: `backend/internal/web/app_auth_page_handlers.go`
- Modify: `backend/internal/web/app_api_auth_test.go`
- Modify: `backend/internal/web/api_key_scope_middleware_test.go`
- Modify: `backend/internal/web/app_account_apikey_public_search_test.go`
- Modify: `backend/internal/web/app_marketplace_access.go`
- Modify: `backend/internal/web/app_access_settings_test.go`
- Modify: `backend/internal/web/app_public_marketplace_api_test.go`
- Modify: `backend/internal/web/app_public_skill_detail_api_test.go`
- Modify: `backend/internal/web/app_admin_registration_settings_api.go`
- Modify: `backend/internal/web/openapi_paths_public_auth.go`
- Modify: `backend/internal/web/openapi_schemas_ops.go`
- Modify: `backend/internal/web/openapi_schemas_access_org_moderation.go`
- Create: `backend/internal/web/app_login_rate_limit_test.go`
- Create: `backend/internal/web/app_account_reset_audit_test.go`

### Frontend And E2E

- Modify if retaining marketplace toggle: `frontend/src/lib/api.ts`
- Modify if retaining marketplace toggle: `frontend/src/App.shared.tsx`
- Modify if retaining marketplace toggle: `frontend/src/App.tsx`
- Modify if retaining marketplace toggle: `frontend/src/lib/api.test.ts`
- Modify if retaining marketplace toggle: `frontend/src/App.shared.test.ts`
- Create if retaining marketplace toggle: `frontend/e2e/marketplace-private-access.spec.ts`

### Docs

- Modify: `docs/design-requirements/public-api/api-key-scope-governance.md`
- Modify: `docs/design-requirements/auth-rbac/account-management.md`
- Modify: `docs/design-requirements/non-functional/operations-compliance-observability.md`
- Modify if retaining marketplace toggle: `docs/design-requirements/marketplace/marketplace-discovery.md`
- Modify if retaining marketplace toggle: `docs/design-requirements/public-api/openapi-public-api.md`
- Modify: `docs/design-requirements/test-acceptance/test-acceptance.md`

---

## Chunk 1: API Key Hardening

### Task 1: Lock Down Scope Semantics In The Service Layer

**Files:**
- Modify: `backend/internal/services/api_key_service.go`
- Test: `backend/internal/services/api_key_service_test.go`
- Test: `backend/internal/services/api_key_service_update_scopes_test.go`

- [x] **Step 1: Write failing tests for strict scope behavior**

Add coverage for:
- static or legacy-like keys with empty scopes must not implicitly pass protected routes
- malformed scopes must not normalize into broad access
- exact scope, `skills.read`, `skills:*`, and `*` still behave as intended

- [x] **Step 2: Run scope-focused service tests**

Run: `go test ./backend/internal/services -run 'Test.*APIKey.*Scope|Test.*UpdateScopes'`
Expected: FAIL on the newly added strict-scope assertions

- [x] **Step 3: Implement strict normalization and access checks**

Update `NormalizeAPIKeyScopes(...)` and `APIKeyHasScope(...)` so that:
- empty persisted scope sets are deny-by-default for protected routes
- invalid persisted scope tokens are ignored or rejected deterministically
- wildcard behavior remains explicit and testable

- [x] **Step 4: Re-run the service tests**

Run: `go test ./backend/internal/services -run 'Test.*APIKey.*Scope|Test.*UpdateScopes'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/internal/services/api_key_service.go \
  backend/internal/services/api_key_service_test.go \
  backend/internal/services/api_key_service_update_scopes_test.go
git commit -m "fix: harden api key scope evaluation"
```

### Task 2: Enforce Hardened Behavior In Middleware And Public Search Routes

**Files:**
- Modify: `backend/internal/web/app_routing.go`
- Test: `backend/internal/web/api_key_scope_middleware_test.go`
- Test: `backend/internal/web/app_account_apikey_public_search_test.go`

- [x] **Step 1: Write failing middleware tests for static-key and malformed-scope cases**

Cover:
- static configured key path
- db-backed key with empty scopes
- db-backed key with invalid scopes
- valid key with exact scope

- [x] **Step 2: Run middleware-focused tests**

Run: `go test ./backend/internal/web -run 'Test.*APIKey.*Scope|Test.*PublicSearch'`
Expected: FAIL on strict-enforcement cases

- [x] **Step 3: Update `requireAPIKey(...)` and scope lookup behavior**

Implement one explicit policy:
- either static keys become scope-aware
- or static keys are rejected for protected public-search endpoints until mapped to scopes

Do not leave an implicit bypass path.

- [x] **Step 4: Re-run middleware-focused tests**

Run: `go test ./backend/internal/web -run 'Test.*APIKey.*Scope|Test.*PublicSearch'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/internal/web/app_routing.go \
  backend/internal/web/api_key_scope_middleware_test.go \
  backend/internal/web/app_account_apikey_public_search_test.go
git commit -m "fix: enforce api key scope checks in middleware"
```

### Task 3: Sync Error Contract, OpenAPI, And Acceptance Text

**Files:**
- Modify: `backend/internal/web/openapi_paths_public_auth.go`
- Modify: `docs/design-requirements/public-api/api-key-scope-governance.md`
- Modify: `docs/design-requirements/test-acceptance/test-acceptance.md`

- [x] **Step 1: Update docs and OpenAPI to match the strict policy**

Document:
- when `401 api_key_invalid` applies
- when `403 api_key_scope_denied` applies
- what happens for empty, invalid, legacy, and static keys

- [x] **Step 2: Run targeted contract checks if available**

Run: `go test ./backend/internal/web -run 'Test.*OpenAPI|Test.*APIKey'`
Expected: PASS or no regression in OpenAPI-related tests

- [ ] **Step 3: Commit**

```bash
git add backend/internal/web/openapi_paths_public_auth.go \
  docs/design-requirements/public-api/api-key-scope-governance.md \
  docs/design-requirements/test-acceptance/test-acceptance.md
git commit -m "docs: sync api key scope contract with implementation"
```

---

## Chunk 2: Audit Foundation And Password Reset Auditing

### Task 4: Extend The AuditLog Model And Export Surface

**Files:**
- Modify: `backend/internal/models/audit_log.go`
- Modify: `backend/internal/services/audit_service.go`
- Modify: `backend/internal/services/audit_service_test.go`
- Modify: `backend/internal/services/ops_service_helpers.go`
- Modify: `backend/internal/services/ops_service_records.go`
- Modify: `backend/internal/services/ops_service.go`
- Modify: `backend/internal/services/ops_service_test.go`
- Modify: `backend/internal/web/openapi_schemas_ops.go`
- Modify: `docs/design-requirements/non-functional/operations-compliance-observability.md`

- [x] **Step 1: Write failing tests for enriched audit fields**

Cover:
- persistence of `request_id`, `result`, `reason`, `source_ip`
- JSON export includes the new fields
- CSV export includes stable columns

- [x] **Step 2: Run audit and ops tests**

Run: `go test ./backend/internal/services -run 'Test.*Audit|Test.*Ops'`
Expected: FAIL on new field assertions

- [x] **Step 3: Implement the model and service changes**

Update:
- `AuditLog` schema
- `RecordAuditInput` and write path
- audit export helpers
- ops records that depend on audit serialization

- [x] **Step 4: Re-run audit and ops tests**

Run: `go test ./backend/internal/services -run 'Test.*Audit|Test.*Ops'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/internal/models/audit_log.go \
  backend/internal/services/audit_service.go \
  backend/internal/services/audit_service_test.go \
  backend/internal/services/ops_service_helpers.go \
  backend/internal/services/ops_service_records.go \
  backend/internal/services/ops_service.go \
  backend/internal/services/ops_service_test.go \
  backend/internal/web/openapi_schemas_ops.go \
  docs/design-requirements/non-functional/operations-compliance-observability.md
git commit -m "feat: extend audit log structure and export fields"
```

### Task 5: Add Password Reset Audit Coverage

**Files:**
- Modify: `backend/internal/web/app_account_reset_api.go`
- Test: `backend/internal/web/app_account_reset_api_test.go`
- Create: `backend/internal/web/app_account_reset_audit_test.go`
- Modify: `docs/design-requirements/auth-rbac/account-management.md`
- Modify: `docs/design-requirements/test-acceptance/test-acceptance.md`

- [x] **Step 1: Write failing tests for request, confirm, and rate-limit audit events**

Cover:
- request accepted without account enumeration leak
- confirm success
- confirm invalid/expired/used token
- request rate limited

- [x] **Step 2: Run password reset tests**

Run: `go test ./backend/internal/web -run 'Test.*PasswordReset'`
Expected: FAIL on audit assertions

- [x] **Step 3: Implement audit emission using the enriched fields**

Each event should include:
- action
- result
- reason where relevant
- source IP
- request identifier if available

- [x] **Step 4: Re-run password reset tests**

Run: `go test ./backend/internal/web -run 'Test.*PasswordReset'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/internal/web/app_account_reset_api.go \
  backend/internal/web/app_account_reset_api_test.go \
  backend/internal/web/app_account_reset_audit_test.go \
  docs/design-requirements/auth-rbac/account-management.md \
  docs/design-requirements/test-acceptance/test-acceptance.md
git commit -m "feat: audit password reset request and confirm flows"
```

---

## Chunk 3: Login Failure Throttling And Temporary Lock

### Task 6: Add Minimal Login Failure Protection

**Files:**
- Modify: `backend/internal/services/auth_service.go`
- Modify: `backend/internal/services/auth_service_test.go`
- Modify: `backend/internal/web/app_auth_page_handlers.go`
- Modify: `backend/internal/web/app_auth_api.go`
- Modify: `backend/internal/web/app_api_auth_test.go`
- Create: `backend/internal/web/app_login_rate_limit_test.go`
- Modify: `docs/design-requirements/auth-rbac/account-management.md`
- Modify: `docs/design-requirements/test-acceptance/test-acceptance.md`

- [x] **Step 1: Choose the minimal policy and encode it in tests first**

Recommended minimum:
- track failed login attempts per username and/or IP in a short window
- return a stable throttling or lock response
- do not introduce account enumeration leaks

- [x] **Step 2: Run auth-focused tests**

Run: `go test ./backend/internal/services -run 'Test.*Auth' && go test ./backend/internal/web -run 'Test.*Auth|Test.*Login'`
Expected: FAIL on new rate-limit or lock assertions

- [x] **Step 3: Implement the minimal protection**

Keep scope limited:
- no MFA
- no device fingerprinting
- no notification workflow

Just add the smallest behavior required to close the documented gap.

- [x] **Step 4: Re-run auth-focused tests**

Run: `go test ./backend/internal/services -run 'Test.*Auth' && go test ./backend/internal/web -run 'Test.*Auth|Test.*Login'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/internal/services/auth_service.go \
  backend/internal/services/auth_service_test.go \
  backend/internal/web/app_auth_page_handlers.go \
  backend/internal/web/app_auth_api.go \
  backend/internal/web/app_api_auth_test.go \
  backend/internal/web/app_login_rate_limit_test.go \
  docs/design-requirements/auth-rbac/account-management.md \
  docs/design-requirements/test-acceptance/test-acceptance.md
git commit -m "feat: add login failure throttling"
```

---

## Chunk 4: Marketplace Access Baseline Decision

### Task 7: Decide Whether To Keep `marketplace_public_access`

**Files if keeping the feature:**
- Modify: `backend/internal/web/app_marketplace_access.go`
- Modify: `backend/internal/web/app_admin_registration_settings_api.go`
- Modify: `backend/internal/web/app_access_settings_test.go`
- Modify: `backend/internal/web/app_public_marketplace_api_test.go`
- Modify: `backend/internal/web/app_public_skill_detail_api_test.go`
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/lib/api.test.ts`
- Modify: `frontend/src/App.shared.tsx`
- Modify: `frontend/src/App.shared.test.ts`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/e2e/marketplace-private-access.spec.ts`
- Modify: `docs/design-requirements/marketplace/marketplace-discovery.md`
- Modify: `docs/design-requirements/public-api/openapi-public-api.md`

**Files if dropping the feature:**
- Revert or remove only the `marketplace_public_access` implementation path in the files above
- Update docs to keep public marketplace as the explicit baseline

- [x] **Step 1: Make the decision explicit in the branch**

Create one short note in the PR description or task tracker:
- `retain marketplace_public_access`
- or `defer marketplace_public_access`

- [x] **Step 2: If retaining, write the missing end-to-end test first**

Execution note: The retained-path scenario was already covered by `frontend/e2e/public-route-prefix.spec.ts`, so no duplicate spec file was added.

Minimum coverage:
- anonymous user hitting homepage or detail when marketplace is private
- redirect to login
- post-login return to original path

- [x] **Step 3: Run the new or updated frontend verification**

Run: `cd frontend && pnpm vitest run src/lib/api.test.ts src/App.shared.test.ts`
Expected: PASS

If retaining:

Run: `cd frontend && pnpm playwright test e2e/marketplace-private-access.spec.ts`
Expected: PASS

Execution note: Final verification used `npm exec -- vitest run src/lib/api.test.ts` and `npm exec -- playwright test e2e/public-route-prefix.spec.ts --grep 'private marketplace redirects anonymous visits'`. The retained-path behavior was already covered without adding `App.shared.test.ts` or a duplicate Playwright spec.

- [x] **Step 4: Sync docs and OpenAPI-facing text**

Ensure the decision is reflected in:
- marketplace requirements
- public API access description
- test acceptance text

- [ ] **Step 5: Commit**

```bash
git add backend/internal/web/app_marketplace_access.go \
  backend/internal/web/app_admin_registration_settings_api.go \
  backend/internal/web/app_access_settings_test.go \
  backend/internal/web/app_public_marketplace_api_test.go \
  backend/internal/web/app_public_skill_detail_api_test.go \
  frontend/src/lib/api.ts \
  frontend/src/lib/api.test.ts \
  frontend/src/App.shared.tsx \
  frontend/src/App.shared.test.ts \
  frontend/src/App.tsx \
  frontend/e2e/marketplace-private-access.spec.ts \
  docs/design-requirements/marketplace/marketplace-discovery.md \
  docs/design-requirements/public-api/openapi-public-api.md \
  docs/design-requirements/test-acceptance/test-acceptance.md
git commit -m "feat: finalize marketplace access baseline"
```

---

## Chunk 5: Final Verification

### Task 8: Run Window A Exit Verification

**Files:**
- Verify changed backend, frontend, OpenAPI, and docs files from Tasks 1-7

- [x] **Step 1: Run backend tests**

Run: `go test ./...`
Expected: PASS

- [x] **Step 2: Run targeted frontend tests**

Run: `cd frontend && pnpm vitest run src/lib/api.test.ts src/App.shared.test.ts`
Expected: PASS

Execution note: Final verification reused `npm exec -- vitest run src/lib/api.test.ts` because that is the touched contract surface for the retained marketplace path.

- [x] **Step 3: Run targeted Playwright coverage if marketplace toggle is retained**

Run: `cd frontend && pnpm playwright test e2e/marketplace-private-access.spec.ts`
Expected: PASS

Execution note: Final verification reused `npm exec -- playwright test e2e/public-route-prefix.spec.ts --grep 'private marketplace redirects anonymous visits'` because the existing spec already covers the retained private-marketplace redirect flow.

- [x] **Step 4: Verify docs and OpenAPI alignment**

Manual checklist:
- `api_key_invalid` vs `api_key_scope_denied` text matches implementation
- audit field docs list `request_id`, `result`, `reason`, `source_ip`
- account-management docs mention login throttling and reset auditing
- marketplace docs reflect the final baseline decision

- [ ] **Step 5: Final commit or merge-ready checkpoint**

```bash
git status
```

Expected:
- only intended Window A files changed
- no unrelated prototype-only or styling-only changes mixed into the branch

Current status: Intentionally left unchecked. `git status` still includes unrelated frontend and prototype work that predates or sits outside Window A, so this branch is not yet merge-ready as a clean isolated patch set.

---

## Completion Checklist

- [x] API key protected routes are deny-by-default for empty or invalid scopes
- [x] Static key behavior is explicit, documented, and tested
- [x] `AuditLog` contains `request_id`, `result`, `reason`, and `source_ip`
- [x] Password reset request/confirm/rate-limit events are auditable
- [x] Login failure throttling or temporary lock is implemented and tested
- [x] Marketplace access baseline is either formalized or removed from the active branch
- [x] Backend tests pass
- [x] Frontend targeted tests pass
- [x] E2E coverage exists if the marketplace toggle remains

Execution tracking is up to date in `docs/plans/2026-03-12-window-a-implementation-plan.md`. Commit bundling and branch cleanup remain pending.
