# Admin API Contract Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split admin route registration by domain ownership while preserving all existing URL paths, middleware, and handler behavior.

**Architecture:** Keep `registerDashboardRoutes` as the single private-auth entrypoint, but move the route declarations into small domain-specific registration helpers. This makes the transport layer reflect the target admin domain split without changing contract behavior or introducing compatibility risk.

**Tech Stack:** Go, Chi, backend transport tests under `backend/internal/web`

---

## Scope

This plan only covers the first implementation slice from the design doc:

1. split admin route registration into domain-specific helpers
2. keep all existing routes and handlers intact
3. add regression coverage for representative route families

This plan does not cover:

1. handler refactors
2. service-layer ownership changes
3. URL path renames
4. alias retirement
5. frontend changes

## Assumptions

1. `registerDashboardRoutes` remains the auth and dashboard-access boundary.
2. Existing admin JSON and legacy dashboard form routes must keep working exactly as before.
3. It is acceptable for the first slice to keep all helper functions in the same file if behavior remains clear and file size stays within limits.

## Extension Points

1. The helper functions introduced here can later move into dedicated domain route files.
2. The same domain split can later be mirrored in handler group structs.
3. Alias documentation can later be added alongside the sync governance helper without another transport rewrite.

## File Structure

- Modify: `backend/internal/web/app_routing_dashboard_routes.go`
- Create: `backend/internal/web/app_routing_dashboard_routes_test.go`

## Chunk 1: Transport Split

### Task 1: Add failing route-registration coverage

**Files:**
- Create: `backend/internal/web/app_routing_dashboard_routes_test.go`

- [ ] **Step 1: Write the failing test**

Add tests that build an app test server and assert representative paths from each admin domain resolve to a non-404 response when authenticated:

```go
func TestDashboardRouteRegistrationKeepsAdminDomainPathsReachable(t *testing.T) {
    cases := []struct {
        method string
        path   string
    }{
        {http.MethodGet, "/api/v1/admin/overview"},
        {http.MethodGet, "/api/v1/admin/accounts"},
        {http.MethodGet, "/api/v1/admin/organizations"},
        {http.MethodGet, "/api/v1/admin/apikeys"},
        {http.MethodGet, "/api/v1/admin/ops/metrics"},
        {http.MethodGet, "/api/v1/admin/sync-jobs"},
    }
}
```

- [ ] **Step 2: Run the focused test to verify the new coverage passes against current behavior**

Run:

```bash
cd backend && go test ./internal/web -run TestDashboardRouteRegistrationKeepsAdminDomainPathsReachable -v
```

Expected:

1. the new test passes against current route behavior

- [ ] **Step 3: Strengthen the test to assert helper-driven structure expectations**

Add a second test that calls `registerDashboardRoutes` through `Router()` and verifies representative legacy form endpoints remain reachable too:

```go
{http.MethodPost, "/admin/accounts/create"}
{http.MethodPost, "/admin/sync-policy/repository"}
```

- [ ] **Step 4: Re-run the focused dashboard route tests**

Run:

```bash
cd backend && go test ./internal/web -run TestDashboardRouteRegistration -v
```

Expected:

1. both route-registration tests pass before refactor

### Task 2: Split `registerDashboardRoutes` into domain helpers

**Files:**
- Modify: `backend/internal/web/app_routing_dashboard_routes.go`
- Test: `backend/internal/web/app_routing_dashboard_routes_test.go`

- [ ] **Step 1: Refactor `registerDashboardRoutes` into helper calls**

Introduce helper functions with clear domain ownership:

1. `registerAdminPageRoutes`
2. `registerAdminOverviewRoutes`
3. `registerAdminIngestionRoutes`
4. `registerAdminSyncGovernanceRoutes`
5. `registerAdminAccessRoutes`
6. `registerAdminOrganizationRoutes`
7. `registerAdminSecurityRoutes`
8. `registerAdminOperationsRoutes`
9. `registerLegacyAdminFormRoutes`
10. `registerSkillOwnerManagementRoutes`

Rules:

1. do not change any route path
2. do not change middleware placement
3. do not change handler bindings
4. keep helper names aligned with the design doc

- [ ] **Step 2: Run the focused dashboard route tests**

Run:

```bash
cd backend && go test ./internal/web -run TestDashboardRouteRegistration -v
```

Expected:

1. route registration remains behaviorally identical

- [ ] **Step 3: Run targeted web tests for admin and skill-owner route families**

Run:

```bash
cd backend && go test ./internal/web -run 'TestAPIAdmin|TestAPIAccount|TestAPISkill|TestDashboardRouteRegistration' -v
```

Expected:

1. no route regression in representative admin and authenticated route tests

- [ ] **Step 4: Commit the transport split**

```bash
git add backend/internal/web/app_routing_dashboard_routes.go \
  backend/internal/web/app_routing_dashboard_routes_test.go
git commit -m "refactor: split admin dashboard route registration by domain"
```

## Chunk 2: Verification

### Task 3: Run changed-scope verification

**Files:**
- Modify: `backend/internal/web/app_routing_dashboard_routes.go`
- Create: `backend/internal/web/app_routing_dashboard_routes_test.go`

- [ ] **Step 1: Run backend web tests**

Run:

```bash
cd backend && go test ./internal/web
```

Expected:

1. all web transport tests pass

- [ ] **Step 2: Run full backend tests**

Run:

```bash
cd backend && go test ./...
```

Expected:

1. backend test suite passes

- [ ] **Step 3: Run backend vet**

Run:

```bash
cd backend && go vet ./...
```

Expected:

1. no vet findings

- [ ] **Step 4: Run line limit verification**

Run:

```bash
./scripts/check_max_lines.sh
```

Expected:

1. pass, allowing existing soft warnings only
