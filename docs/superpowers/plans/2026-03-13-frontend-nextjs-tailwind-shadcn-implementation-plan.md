# SkillsIndex Frontend Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new `frontend-next/` application on `Next.js App Router`, `Tailwind CSS`, and `shadcn/ui`, fully replacing the current frontend while preserving current `Admin` functional layout and allowing full redesign of `Public` and `Workspace`.

**Architecture:** Use a dual-track migration. Keep the current `frontend/` as the behavioral baseline, especially for `Admin`, while building `frontend-next/` as a clean application with route groups, BFF adapters, a governed design system, and shared app shells. Prioritize infrastructure and design system first, then migrate `Public`, `Workspace`, and finally `Admin` with parity checks.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, TanStack Query, Playwright, Vitest, Go backend session/cookie/CSRF integration.

---

## File Map

### New Frontend Foundation

- Create: `frontend-next/package.json`
- Create: `frontend-next/next.config.ts`
- Create: `frontend-next/tsconfig.json`
- Create: `frontend-next/postcss.config.mjs`
- Create: `frontend-next/eslint.config.mjs`
- Create: `frontend-next/components.json`
- Create: `frontend-next/playwright.config.ts`
- Create: `frontend-next/vitest.config.ts`
- Create: `frontend-next/.env.example`

### App Router And Route Groups

- Create: `frontend-next/app/layout.tsx`
- Create: `frontend-next/app/globals.css`
- Create: `frontend-next/app/(public)/layout.tsx`
- Create: `frontend-next/app/(public)/page.tsx`
- Create: `frontend-next/app/(public)/search/page.tsx`
- Create: `frontend-next/app/(public)/categories/page.tsx`
- Create: `frontend-next/app/(public)/categories/[slug]/page.tsx`
- Create: `frontend-next/app/(public)/skills/[skillId]/page.tsx`
- Create: `frontend-next/app/(public)/docs/page.tsx`
- Create: `frontend-next/app/(workspace)/workspace/layout.tsx`
- Create: `frontend-next/app/(workspace)/workspace/page.tsx`
- Create: `frontend-next/app/(workspace)/workspace/activity/page.tsx`
- Create: `frontend-next/app/(workspace)/workspace/queue/page.tsx`
- Create: `frontend-next/app/(workspace)/workspace/policy/page.tsx`
- Create: `frontend-next/app/(workspace)/workspace/runbook/page.tsx`
- Create: `frontend-next/app/(workspace)/workspace/actions/page.tsx`
- Create: `frontend-next/app/(admin)/admin/layout.tsx`
- Create: `frontend-next/app/(admin)/admin/overview/page.tsx`
- Create: `frontend-next/app/(admin)/admin/ingestion/manual/page.tsx`
- Create: `frontend-next/app/(admin)/admin/ingestion/repository/page.tsx`
- Create: `frontend-next/app/(admin)/admin/records/imports/page.tsx`
- Create: `frontend-next/app/(admin)/admin/accounts/page.tsx`
- Create: `frontend-next/app/(admin)/admin/accounts/new/page.tsx`
- Create: `frontend-next/app/(admin)/admin/roles/page.tsx`
- Create: `frontend-next/app/(admin)/admin/roles/new/page.tsx`
- Create: `frontend-next/app/(admin)/admin/integrations/page.tsx`
- Create: `frontend-next/app/(admin)/admin/access/page.tsx`
- Create: `frontend-next/app/(admin)/admin/organizations/page.tsx`
- Create: `frontend-next/app/(admin)/admin/moderation/page.tsx`

### BFF, Auth, And Shared Infrastructure

- Create: `frontend-next/middleware.ts`
- Create: `frontend-next/app/api/bff/session/route.ts`
- Create: `frontend-next/app/api/bff/auth/login/route.ts`
- Create: `frontend-next/app/api/bff/auth/logout/route.ts`
- Create: `frontend-next/app/api/bff/marketplace/search/route.ts`
- Create: `frontend-next/app/api/bff/marketplace/skills/[skillId]/route.ts`
- Create: `frontend-next/src/lib/http/serverFetch.ts`
- Create: `frontend-next/src/lib/http/clientFetch.ts`
- Create: `frontend-next/src/lib/bff/cookies.ts`
- Create: `frontend-next/src/lib/bff/csrf.ts`
- Create: `frontend-next/src/lib/auth/session.ts`
- Create: `frontend-next/src/lib/auth/guards.ts`
- Create: `frontend-next/src/lib/routing/routes.ts`
- Create: `frontend-next/src/lib/routing/adminNavigation.ts`
- Create: `frontend-next/src/lib/routing/workspaceNavigation.ts`
- Create: `frontend-next/src/lib/schemas/session.ts`
- Create: `frontend-next/src/lib/schemas/marketplace.ts`
- Create: `frontend-next/src/lib/schemas/admin.ts`

### Design System And Shared Components

- Create: `frontend-next/src/design-system/tokens/theme.css`
- Create: `frontend-next/src/design-system/tokens/density.css`
- Create: `frontend-next/src/design-system/tokens/tailwind-theme.ts`
- Create: `frontend-next/src/design-system/recipes/button.ts`
- Create: `frontend-next/src/design-system/recipes/card.ts`
- Create: `frontend-next/src/design-system/recipes/table.ts`
- Create: `frontend-next/src/design-system/recipes/navigation.ts`
- Create: `frontend-next/src/components/ui/button.tsx`
- Create: `frontend-next/src/components/ui/input.tsx`
- Create: `frontend-next/src/components/ui/select.tsx`
- Create: `frontend-next/src/components/ui/textarea.tsx`
- Create: `frontend-next/src/components/ui/card.tsx`
- Create: `frontend-next/src/components/ui/badge.tsx`
- Create: `frontend-next/src/components/ui/dialog.tsx`
- Create: `frontend-next/src/components/ui/sheet.tsx`
- Create: `frontend-next/src/components/ui/dropdown-menu.tsx`
- Create: `frontend-next/src/components/ui/tabs.tsx`
- Create: `frontend-next/src/components/ui/table.tsx`
- Create: `frontend-next/src/components/ui/command.tsx`
- Create: `frontend-next/src/components/shared/AppShell.tsx`
- Create: `frontend-next/src/components/shared/PageHeader.tsx`
- Create: `frontend-next/src/components/shared/EmptyState.tsx`
- Create: `frontend-next/src/components/shared/ErrorState.tsx`
- Create: `frontend-next/src/components/navigation/TopNav.tsx`
- Create: `frontend-next/src/components/navigation/SideNav.tsx`
- Create: `frontend-next/src/components/navigation/Breadcrumbs.tsx`

### Surface Features

- Create: `frontend-next/src/features/public/home/HomePage.tsx`
- Create: `frontend-next/src/features/public/search/SearchPage.tsx`
- Create: `frontend-next/src/features/public/categories/CategoriesPage.tsx`
- Create: `frontend-next/src/features/public/skill-detail/SkillDetailPage.tsx`
- Create: `frontend-next/src/features/workspace/overview/WorkspaceOverviewPage.tsx`
- Create: `frontend-next/src/features/workspace/activity/WorkspaceActivityPage.tsx`
- Create: `frontend-next/src/features/workspace/queue/WorkspaceQueuePage.tsx`
- Create: `frontend-next/src/features/workspace/policy/WorkspacePolicyPage.tsx`
- Create: `frontend-next/src/features/workspace/actions/WorkspaceActionsPage.tsx`
- Create: `frontend-next/src/features/admin/overview/AdminOverviewPage.tsx`
- Create: `frontend-next/src/features/admin/catalog/AdminIngestionPage.tsx`
- Create: `frontend-next/src/features/admin/catalog/AdminRecordsPage.tsx`
- Create: `frontend-next/src/features/admin/access/AdminAccountsPage.tsx`
- Create: `frontend-next/src/features/admin/access/AdminRolesPage.tsx`
- Create: `frontend-next/src/features/admin/integrations/AdminIntegrationsPage.tsx`
- Create: `frontend-next/src/features/admin/governance/AdminAccessPage.tsx`
- Create: `frontend-next/src/features/admin/governance/AdminOrganizationsPage.tsx`
- Create: `frontend-next/src/features/admin/governance/AdminModerationPage.tsx`

### Tests And Baselines

- Create: `frontend-next/tests/unit/`
- Create: `frontend-next/tests/e2e/`
- Create: `frontend-next/tests/fixtures/`
- Create: `docs/superpowers/migration/admin-layout-baseline.md`
- Create: `docs/superpowers/migration/admin-route-map.md`
- Create: `docs/superpowers/migration/admin-parity-checklist.md`

---

## Chunk 1: Baseline Freeze And New App Scaffold

### Task 1: Capture Admin Baseline Before Rebuild

**Files:**
- Create: `docs/superpowers/migration/admin-layout-baseline.md`
- Create: `docs/superpowers/migration/admin-route-map.md`
- Create: `docs/superpowers/migration/admin-parity-checklist.md`
- Read for reference: `frontend/src/appNavigationConfig.ts`
- Read for reference: `frontend/src/App.tsx`
- Read for reference: `frontend/src/pages/adminOverview/AdminOverviewPage.tsx`
- Read for reference: `frontend/src/pages/adminWorkbench/AdminWorkbenchPage.tsx`

- [ ] **Step 1: Inventory current admin routes and navigation groups**

Document:
- first-level and second-level menu groups
- route-to-page mapping
- pages with list/detail/form/context layouts

- [ ] **Step 2: Capture page layout contracts**

Record for each admin route family:
- primary region
- secondary/context region
- action placement
- filter placement

- [ ] **Step 3: Write the parity checklist**

Include per-page validation items for:
- entry point parity
- navigation parity
- layout parity
- action parity

- [ ] **Step 4: Review the baseline docs for completeness**

Run: `sed -n '1,240p' docs/superpowers/migration/admin-parity-checklist.md`
Expected: route coverage and validation rules are present

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/migration/admin-layout-baseline.md \
  docs/superpowers/migration/admin-route-map.md \
  docs/superpowers/migration/admin-parity-checklist.md
git commit -m "docs: capture admin migration baseline"
```

### Task 2: Scaffold The New Next.js Application

**Files:**
- Create: `frontend-next/package.json`
- Create: `frontend-next/next.config.ts`
- Create: `frontend-next/tsconfig.json`
- Create: `frontend-next/postcss.config.mjs`
- Create: `frontend-next/eslint.config.mjs`
- Create: `frontend-next/.env.example`

- [ ] **Step 1: Write the failing bootstrap smoke check**

Create a lightweight config test in:
- `frontend-next/tests/unit/bootstrap.test.ts`

Validate:
- package scripts exist
- TypeScript config resolves `src/*`
- Next config exports successfully

- [ ] **Step 2: Run the bootstrap test and confirm failure**

Run: `cd frontend-next && npm run test:unit -- bootstrap.test.ts`
Expected: FAIL because the app scaffold does not exist yet

- [ ] **Step 3: Create the minimal app scaffold**

Implement:
- dependencies and scripts
- TypeScript config
- Next config
- environment template

- [ ] **Step 4: Re-run the bootstrap smoke check**

Run: `cd frontend-next && npm run test:unit -- bootstrap.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/package.json \
  frontend-next/next.config.ts \
  frontend-next/tsconfig.json \
  frontend-next/postcss.config.mjs \
  frontend-next/eslint.config.mjs \
  frontend-next/.env.example \
  frontend-next/tests/unit/bootstrap.test.ts
git commit -m "feat: scaffold frontend-next foundation"
```

---

## Chunk 2: BFF, Auth, And Routing Foundations

### Task 3: Build The Shared HTTP And Session Adapters

**Files:**
- Create: `frontend-next/src/lib/http/serverFetch.ts`
- Create: `frontend-next/src/lib/http/clientFetch.ts`
- Create: `frontend-next/src/lib/bff/cookies.ts`
- Create: `frontend-next/src/lib/bff/csrf.ts`
- Create: `frontend-next/src/lib/auth/session.ts`
- Create: `frontend-next/src/lib/schemas/session.ts`
- Test: `frontend-next/tests/unit/session-adapters.test.ts`

- [ ] **Step 1: Write failing tests for cookie, CSRF, and session normalization**

Cover:
- cookie forwarding
- CSRF header injection
- session payload normalization
- consistent error mapping

- [ ] **Step 2: Run the unit tests and confirm failure**

Run: `cd frontend-next && npm run test:unit -- session-adapters.test.ts`
Expected: FAIL because adapters are missing

- [ ] **Step 3: Implement the minimal adapters**

Implement:
- server fetch wrapper
- client fetch wrapper
- cookie utilities
- CSRF extraction and forwarding
- session schema parsing

- [ ] **Step 4: Re-run the session adapter tests**

Run: `cd frontend-next && npm run test:unit -- session-adapters.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/src/lib/http/serverFetch.ts \
  frontend-next/src/lib/http/clientFetch.ts \
  frontend-next/src/lib/bff/cookies.ts \
  frontend-next/src/lib/bff/csrf.ts \
  frontend-next/src/lib/auth/session.ts \
  frontend-next/src/lib/schemas/session.ts \
  frontend-next/tests/unit/session-adapters.test.ts
git commit -m "feat: add frontend-next session adapters"
```

### Task 4: Add Middleware And Protected Route Guards

**Files:**
- Create: `frontend-next/middleware.ts`
- Create: `frontend-next/src/lib/auth/guards.ts`
- Create: `frontend-next/src/lib/routing/routes.ts`
- Create: `frontend-next/src/lib/routing/adminNavigation.ts`
- Create: `frontend-next/src/lib/routing/workspaceNavigation.ts`
- Test: `frontend-next/tests/unit/route-guards.test.ts`

- [ ] **Step 1: Write failing tests for route protection and redirect behavior**

Cover:
- anonymous access to protected workspace/admin routes
- login return-path preservation
- admin route registration
- workspace route registration

- [ ] **Step 2: Run the route-guard tests**

Run: `cd frontend-next && npm run test:unit -- route-guards.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement route maps, guards, and middleware**

Implement:
- route constants
- guard helpers
- middleware matcher and redirect rules
- navigation config helpers

- [ ] **Step 4: Re-run the route-guard tests**

Run: `cd frontend-next && npm run test:unit -- route-guards.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/middleware.ts \
  frontend-next/src/lib/auth/guards.ts \
  frontend-next/src/lib/routing/routes.ts \
  frontend-next/src/lib/routing/adminNavigation.ts \
  frontend-next/src/lib/routing/workspaceNavigation.ts \
  frontend-next/tests/unit/route-guards.test.ts
git commit -m "feat: add frontend-next route guards"
```

### Task 5: Build Initial BFF Route Handlers

**Files:**
- Create: `frontend-next/app/api/bff/session/route.ts`
- Create: `frontend-next/app/api/bff/auth/login/route.ts`
- Create: `frontend-next/app/api/bff/auth/logout/route.ts`
- Create: `frontend-next/app/api/bff/marketplace/search/route.ts`
- Create: `frontend-next/app/api/bff/marketplace/skills/[skillId]/route.ts`
- Test: `frontend-next/tests/unit/bff-routes.test.ts`

- [ ] **Step 1: Write failing tests for BFF forwarding and response shaping**

Cover:
- session passthrough
- login/logout forwarding
- marketplace search response shape
- skill detail response shape

- [ ] **Step 2: Run the BFF unit tests**

Run: `cd frontend-next && npm run test:unit -- bff-routes.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement the BFF handlers**

Implement:
- request forwarding
- cookie and CSRF handling
- response normalization
- typed error responses

- [ ] **Step 4: Re-run the BFF unit tests**

Run: `cd frontend-next && npm run test:unit -- bff-routes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/app/api/bff/session/route.ts \
  frontend-next/app/api/bff/auth/login/route.ts \
  frontend-next/app/api/bff/auth/logout/route.ts \
  frontend-next/app/api/bff/marketplace/search/route.ts \
  frontend-next/app/api/bff/marketplace/skills/[skillId]/route.ts \
  frontend-next/tests/unit/bff-routes.test.ts
git commit -m "feat: add frontend-next bff routes"
```

---

## Chunk 3: Design System And Shared Shells

### Task 6: Create The Token And Density Foundation

**Files:**
- Create: `frontend-next/src/design-system/tokens/theme.css`
- Create: `frontend-next/src/design-system/tokens/density.css`
- Create: `frontend-next/src/design-system/tokens/tailwind-theme.ts`
- Create: `frontend-next/app/globals.css`
- Test: `frontend-next/tests/unit/design-tokens.test.ts`

- [ ] **Step 1: Write failing tests for token exports and density profiles**

Cover:
- public/workspace/admin density tokens
- semantic surface and text tokens
- tailwind token mapping exports

- [ ] **Step 2: Run the token tests**

Run: `cd frontend-next && npm run test:unit -- design-tokens.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement the token files and global imports**

Implement:
- CSS variables
- density profiles
- tailwind token mapping
- global stylesheet imports

- [ ] **Step 4: Re-run the token tests**

Run: `cd frontend-next && npm run test:unit -- design-tokens.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/src/design-system/tokens/theme.css \
  frontend-next/src/design-system/tokens/density.css \
  frontend-next/src/design-system/tokens/tailwind-theme.ts \
  frontend-next/app/globals.css \
  frontend-next/tests/unit/design-tokens.test.ts
git commit -m "feat: add frontend-next design tokens"
```

### Task 7: Build Governed UI Primitives On Top Of shadcn/ui

**Files:**
- Create: `frontend-next/components.json`
- Create: `frontend-next/src/design-system/recipes/button.ts`
- Create: `frontend-next/src/design-system/recipes/card.ts`
- Create: `frontend-next/src/design-system/recipes/table.ts`
- Create: `frontend-next/src/design-system/recipes/navigation.ts`
- Create: `frontend-next/src/components/ui/button.tsx`
- Create: `frontend-next/src/components/ui/input.tsx`
- Create: `frontend-next/src/components/ui/select.tsx`
- Create: `frontend-next/src/components/ui/textarea.tsx`
- Create: `frontend-next/src/components/ui/card.tsx`
- Create: `frontend-next/src/components/ui/badge.tsx`
- Create: `frontend-next/src/components/ui/dialog.tsx`
- Create: `frontend-next/src/components/ui/sheet.tsx`
- Create: `frontend-next/src/components/ui/dropdown-menu.tsx`
- Create: `frontend-next/src/components/ui/tabs.tsx`
- Create: `frontend-next/src/components/ui/table.tsx`
- Create: `frontend-next/src/components/ui/command.tsx`
- Test: `frontend-next/tests/unit/ui-primitives.test.tsx`

- [ ] **Step 1: Write failing tests for variant contracts and accessibility basics**

Cover:
- button variants
- card density classes
- table shell structure
- command trigger rendering

- [ ] **Step 2: Run the UI primitive tests**

Run: `cd frontend-next && npm run test:unit -- ui-primitives.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement the recipes and component wrappers**

Implement only the minimum needed for:
- button
- card
- table shell
- command
- core form controls

- [ ] **Step 4: Re-run the UI primitive tests**

Run: `cd frontend-next && npm run test:unit -- ui-primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/components.json \
  frontend-next/src/design-system/recipes/button.ts \
  frontend-next/src/design-system/recipes/card.ts \
  frontend-next/src/design-system/recipes/table.ts \
  frontend-next/src/design-system/recipes/navigation.ts \
  frontend-next/src/components/ui \
  frontend-next/tests/unit/ui-primitives.test.tsx
git commit -m "feat: add frontend-next governed ui primitives"
```

### Task 8: Build Shared Shell And Navigation Components

**Files:**
- Create: `frontend-next/src/components/shared/AppShell.tsx`
- Create: `frontend-next/src/components/shared/PageHeader.tsx`
- Create: `frontend-next/src/components/shared/EmptyState.tsx`
- Create: `frontend-next/src/components/shared/ErrorState.tsx`
- Create: `frontend-next/src/components/navigation/TopNav.tsx`
- Create: `frontend-next/src/components/navigation/SideNav.tsx`
- Create: `frontend-next/src/components/navigation/Breadcrumbs.tsx`
- Test: `frontend-next/tests/unit/app-shell.test.tsx`

- [ ] **Step 1: Write failing tests for shell, top nav, side nav, and page header contracts**

Cover:
- public shell rendering
- protected shell rendering
- breadcrumb output
- side nav active state

- [ ] **Step 2: Run the shell tests**

Run: `cd frontend-next && npm run test:unit -- app-shell.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement the shared shell components**

Implement:
- top nav
- side nav
- page header
- empty and error states
- app shell composition

- [ ] **Step 4: Re-run the shell tests**

Run: `cd frontend-next && npm run test:unit -- app-shell.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/src/components/shared \
  frontend-next/src/components/navigation \
  frontend-next/tests/unit/app-shell.test.tsx
git commit -m "feat: add frontend-next shared shell components"
```

---

## Chunk 4: Public Surface Migration

### Task 9: Build The Public Route Group And Home/Search Experience

**Files:**
- Create: `frontend-next/app/(public)/layout.tsx`
- Create: `frontend-next/app/(public)/page.tsx`
- Create: `frontend-next/app/(public)/search/page.tsx`
- Create: `frontend-next/src/features/public/home/HomePage.tsx`
- Create: `frontend-next/src/features/public/search/SearchPage.tsx`
- Create: `frontend-next/src/lib/schemas/marketplace.ts`
- Test: `frontend-next/tests/unit/public-home.test.tsx`
- Test: `frontend-next/tests/e2e/public-home.spec.ts`

- [ ] **Step 1: Write failing unit and E2E coverage for public home and search**

Cover:
- home shell render
- search trigger and result layout
- BFF-backed search request
- public navigation presence

- [ ] **Step 2: Run the targeted tests and confirm failure**

Run: `cd frontend-next && npm run test:unit -- public-home.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- public-home.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement the public layout and first pages**

Implement:
- public route group layout
- home page
- search page
- marketplace schema normalization

- [ ] **Step 4: Re-run the targeted tests**

Run: `cd frontend-next && npm run test:unit -- public-home.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- public-home.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/app/\(public\)/layout.tsx \
  frontend-next/app/\(public\)/page.tsx \
  frontend-next/app/\(public\)/search/page.tsx \
  frontend-next/src/features/public/home/HomePage.tsx \
  frontend-next/src/features/public/search/SearchPage.tsx \
  frontend-next/src/lib/schemas/marketplace.ts \
  frontend-next/tests/unit/public-home.test.tsx \
  frontend-next/tests/e2e/public-home.spec.ts
git commit -m "feat: add frontend-next public home and search"
```

### Task 10: Build Categories, Skill Detail, And Docs Entry

**Files:**
- Create: `frontend-next/app/(public)/categories/page.tsx`
- Create: `frontend-next/app/(public)/categories/[slug]/page.tsx`
- Create: `frontend-next/app/(public)/skills/[skillId]/page.tsx`
- Create: `frontend-next/app/(public)/docs/page.tsx`
- Create: `frontend-next/src/features/public/categories/CategoriesPage.tsx`
- Create: `frontend-next/src/features/public/skill-detail/SkillDetailPage.tsx`
- Test: `frontend-next/tests/unit/public-detail.test.tsx`
- Test: `frontend-next/tests/e2e/public-detail.spec.ts`

- [ ] **Step 1: Write failing tests for category and skill detail rendering**

Cover:
- category list route
- category detail route
- skill detail route
- docs entry route

- [ ] **Step 2: Run the targeted tests**

Run: `cd frontend-next && npm run test:unit -- public-detail.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- public-detail.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement the public detail routes**

Implement:
- categories pages
- skill detail page
- docs entry page
- associated feature components

- [ ] **Step 4: Re-run the targeted tests**

Run: `cd frontend-next && npm run test:unit -- public-detail.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- public-detail.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/app/\(public\)/categories \
  frontend-next/app/\(public\)/skills \
  frontend-next/app/\(public\)/docs/page.tsx \
  frontend-next/src/features/public/categories/CategoriesPage.tsx \
  frontend-next/src/features/public/skill-detail/SkillDetailPage.tsx \
  frontend-next/tests/unit/public-detail.test.tsx \
  frontend-next/tests/e2e/public-detail.spec.ts
git commit -m "feat: add frontend-next public detail routes"
```

---

## Chunk 5: Workspace Surface Migration

### Task 11: Build Workspace Layout And Overview/Activity

**Files:**
- Create: `frontend-next/app/(workspace)/workspace/layout.tsx`
- Create: `frontend-next/app/(workspace)/workspace/page.tsx`
- Create: `frontend-next/app/(workspace)/workspace/activity/page.tsx`
- Create: `frontend-next/src/features/workspace/overview/WorkspaceOverviewPage.tsx`
- Create: `frontend-next/src/features/workspace/activity/WorkspaceActivityPage.tsx`
- Test: `frontend-next/tests/unit/workspace-shell.test.tsx`
- Test: `frontend-next/tests/e2e/workspace-overview.spec.ts`

- [ ] **Step 1: Write failing tests for workspace shell and first routes**

Cover:
- protected workspace layout
- overview route
- activity route
- side nav and context area

- [ ] **Step 2: Run the workspace tests**

Run: `cd frontend-next && npm run test:unit -- workspace-shell.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- workspace-overview.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement the workspace shell and first pages**

Implement:
- workspace layout
- overview page
- activity page
- protected route wiring

- [ ] **Step 4: Re-run the workspace tests**

Run: `cd frontend-next && npm run test:unit -- workspace-shell.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- workspace-overview.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/app/\(workspace\)/workspace \
  frontend-next/src/features/workspace/overview/WorkspaceOverviewPage.tsx \
  frontend-next/src/features/workspace/activity/WorkspaceActivityPage.tsx \
  frontend-next/tests/unit/workspace-shell.test.tsx \
  frontend-next/tests/e2e/workspace-overview.spec.ts
git commit -m "feat: add frontend-next workspace shell"
```

### Task 12: Build Queue, Policy, Runbook, And Actions

**Files:**
- Create: `frontend-next/app/(workspace)/workspace/queue/page.tsx`
- Create: `frontend-next/app/(workspace)/workspace/policy/page.tsx`
- Create: `frontend-next/app/(workspace)/workspace/runbook/page.tsx`
- Create: `frontend-next/app/(workspace)/workspace/actions/page.tsx`
- Create: `frontend-next/src/features/workspace/queue/WorkspaceQueuePage.tsx`
- Create: `frontend-next/src/features/workspace/policy/WorkspacePolicyPage.tsx`
- Create: `frontend-next/src/features/workspace/actions/WorkspaceActionsPage.tsx`
- Test: `frontend-next/tests/unit/workspace-pages.test.tsx`
- Test: `frontend-next/tests/e2e/workspace-pages.spec.ts`

- [ ] **Step 1: Write failing tests for the remaining workspace routes**

Cover:
- queue route
- policy route
- runbook route
- actions route

- [ ] **Step 2: Run the workspace route tests**

Run: `cd frontend-next && npm run test:unit -- workspace-pages.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- workspace-pages.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement the remaining workspace routes**

Implement:
- queue page
- policy page
- runbook page
- actions page

- [ ] **Step 4: Re-run the workspace route tests**

Run: `cd frontend-next && npm run test:unit -- workspace-pages.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- workspace-pages.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/app/\(workspace\)/workspace/queue/page.tsx \
  frontend-next/app/\(workspace\)/workspace/policy/page.tsx \
  frontend-next/app/\(workspace\)/workspace/runbook/page.tsx \
  frontend-next/app/\(workspace\)/workspace/actions/page.tsx \
  frontend-next/src/features/workspace/queue/WorkspaceQueuePage.tsx \
  frontend-next/src/features/workspace/policy/WorkspacePolicyPage.tsx \
  frontend-next/src/features/workspace/actions/WorkspaceActionsPage.tsx \
  frontend-next/tests/unit/workspace-pages.test.tsx \
  frontend-next/tests/e2e/workspace-pages.spec.ts
git commit -m "feat: add frontend-next workspace routes"
```

---

## Chunk 6: Admin Parity Migration

### Task 13: Build The Admin Shell With Current Navigation Parity

**Files:**
- Create: `frontend-next/app/(admin)/admin/layout.tsx`
- Create: `frontend-next/src/features/admin/AdminShell.tsx`
- Modify: `frontend-next/src/lib/routing/adminNavigation.ts`
- Test: `frontend-next/tests/unit/admin-navigation.test.tsx`
- Test: `frontend-next/tests/e2e/admin-navigation.spec.ts`
- Reference: `docs/superpowers/migration/admin-route-map.md`
- Reference: `docs/superpowers/migration/admin-parity-checklist.md`

- [ ] **Step 1: Write failing tests for admin menu grouping and active-state parity**

Cover:
- first-level grouping
- second-level grouping
- active item state
- protected route access

- [ ] **Step 2: Run the admin navigation tests**

Run: `cd frontend-next && npm run test:unit -- admin-navigation.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- admin-navigation.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement the admin shell and nav parity**

Implement:
- admin layout
- shell wrapper
- first-level and second-level navigation
- parity-driven structure

- [ ] **Step 4: Re-run the admin navigation tests**

Run: `cd frontend-next && npm run test:unit -- admin-navigation.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- admin-navigation.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/app/\(admin\)/admin/layout.tsx \
  frontend-next/src/features/admin/AdminShell.tsx \
  frontend-next/src/lib/routing/adminNavigation.ts \
  frontend-next/tests/unit/admin-navigation.test.tsx \
  frontend-next/tests/e2e/admin-navigation.spec.ts
git commit -m "feat: add frontend-next admin shell parity"
```

### Task 14: Migrate Admin Overview And Catalog Families

**Files:**
- Create: `frontend-next/app/(admin)/admin/overview/page.tsx`
- Create: `frontend-next/app/(admin)/admin/ingestion/manual/page.tsx`
- Create: `frontend-next/app/(admin)/admin/ingestion/repository/page.tsx`
- Create: `frontend-next/app/(admin)/admin/records/imports/page.tsx`
- Create: `frontend-next/src/features/admin/overview/AdminOverviewPage.tsx`
- Create: `frontend-next/src/features/admin/catalog/AdminIngestionPage.tsx`
- Create: `frontend-next/src/features/admin/catalog/AdminRecordsPage.tsx`
- Test: `frontend-next/tests/unit/admin-catalog.test.tsx`
- Test: `frontend-next/tests/e2e/admin-catalog.spec.ts`

- [ ] **Step 1: Write failing tests for overview and catalog layout parity**

Cover:
- overview page shell
- ingestion pages
- records imports page
- list/detail/context structure

- [ ] **Step 2: Run the overview/catalog tests**

Run: `cd frontend-next && npm run test:unit -- admin-catalog.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- admin-catalog.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement overview and catalog routes**

Implement:
- overview page
- ingestion pages
- records imports page
- catalog feature components

- [ ] **Step 4: Re-run the overview/catalog tests**

Run: `cd frontend-next && npm run test:unit -- admin-catalog.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- admin-catalog.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/app/\(admin\)/admin/overview/page.tsx \
  frontend-next/app/\(admin\)/admin/ingestion/manual/page.tsx \
  frontend-next/app/\(admin\)/admin/ingestion/repository/page.tsx \
  frontend-next/app/\(admin\)/admin/records/imports/page.tsx \
  frontend-next/src/features/admin/overview/AdminOverviewPage.tsx \
  frontend-next/src/features/admin/catalog/AdminIngestionPage.tsx \
  frontend-next/src/features/admin/catalog/AdminRecordsPage.tsx \
  frontend-next/tests/unit/admin-catalog.test.tsx \
  frontend-next/tests/e2e/admin-catalog.spec.ts
git commit -m "feat: migrate frontend-next admin catalog routes"
```

### Task 15: Migrate Admin Access, Integrations, And Governance Families

**Files:**
- Create: `frontend-next/app/(admin)/admin/accounts/page.tsx`
- Create: `frontend-next/app/(admin)/admin/accounts/new/page.tsx`
- Create: `frontend-next/app/(admin)/admin/roles/page.tsx`
- Create: `frontend-next/app/(admin)/admin/roles/new/page.tsx`
- Create: `frontend-next/app/(admin)/admin/integrations/page.tsx`
- Create: `frontend-next/app/(admin)/admin/access/page.tsx`
- Create: `frontend-next/app/(admin)/admin/organizations/page.tsx`
- Create: `frontend-next/app/(admin)/admin/moderation/page.tsx`
- Create: `frontend-next/src/features/admin/access/AdminAccountsPage.tsx`
- Create: `frontend-next/src/features/admin/access/AdminRolesPage.tsx`
- Create: `frontend-next/src/features/admin/integrations/AdminIntegrationsPage.tsx`
- Create: `frontend-next/src/features/admin/governance/AdminAccessPage.tsx`
- Create: `frontend-next/src/features/admin/governance/AdminOrganizationsPage.tsx`
- Create: `frontend-next/src/features/admin/governance/AdminModerationPage.tsx`
- Test: `frontend-next/tests/unit/admin-governance.test.tsx`
- Test: `frontend-next/tests/e2e/admin-governance.spec.ts`

- [ ] **Step 1: Write failing tests for the remaining admin families**

Cover:
- accounts and roles
- integrations
- access
- organizations
- moderation

- [ ] **Step 2: Run the governance-family tests**

Run: `cd frontend-next && npm run test:unit -- admin-governance.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- admin-governance.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement the remaining admin routes**

Implement:
- accounts and roles
- integrations
- access
- organizations
- moderation

- [ ] **Step 4: Re-run the governance-family tests**

Run: `cd frontend-next && npm run test:unit -- admin-governance.test.tsx`
Run: `cd frontend-next && npm run test:e2e -- admin-governance.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend-next/app/\(admin\)/admin/accounts \
  frontend-next/app/\(admin\)/admin/roles \
  frontend-next/app/\(admin\)/admin/integrations/page.tsx \
  frontend-next/app/\(admin\)/admin/access/page.tsx \
  frontend-next/app/\(admin\)/admin/organizations/page.tsx \
  frontend-next/app/\(admin\)/admin/moderation/page.tsx \
  frontend-next/src/features/admin/access/AdminAccountsPage.tsx \
  frontend-next/src/features/admin/access/AdminRolesPage.tsx \
  frontend-next/src/features/admin/integrations/AdminIntegrationsPage.tsx \
  frontend-next/src/features/admin/governance/AdminAccessPage.tsx \
  frontend-next/src/features/admin/governance/AdminOrganizationsPage.tsx \
  frontend-next/src/features/admin/governance/AdminModerationPage.tsx \
  frontend-next/tests/unit/admin-governance.test.tsx \
  frontend-next/tests/e2e/admin-governance.spec.ts
git commit -m "feat: migrate frontend-next admin governance routes"
```

---

## Chunk 7: Final Verification And Cutover Readiness

### Task 16: Run Whole-App Verification And Record Remaining Gaps

**Files:**
- Modify: `docs/superpowers/migration/admin-parity-checklist.md`
- Create: `docs/superpowers/migration/frontend-next-cutover-checklist.md`

- [ ] **Step 1: Run unit, build, and E2E verification for the new app**

Run:

```bash
cd frontend-next && npm run test:unit
cd frontend-next && npm run build
cd frontend-next && npm run test:e2e
cd /Users/tanzv/Development/Git/skillsindex && ./scripts/check_max_lines.sh
```

Expected:
- tests pass
- build succeeds
- max-lines check passes or only reports unrelated files

- [ ] **Step 2: Record any parity gaps or known blockers**

Document:
- routes not yet migrated
- UI parity exceptions
- backend contract gaps

- [ ] **Step 3: Write the cutover checklist**

Include:
- environment setup
- session verification
- public route smoke tests
- workspace smoke tests
- admin parity sign-off

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/migration/admin-parity-checklist.md \
  docs/superpowers/migration/frontend-next-cutover-checklist.md
git commit -m "docs: add frontend-next cutover checklist"
```

---

## Execution Notes For Subagent Routing

Use these tasks as the default subagent work units:

1. Task 1-2: architecture and scaffold implementer
2. Task 3-5: BFF/auth implementer
3. Task 6-8: design-system implementer
4. Task 9-10: public-surface implementer
5. Task 11-12: workspace implementer
6. Task 13-15: admin parity implementer
7. Task 16: verification and release-readiness implementer

Do not run multiple implementation subagents in parallel against the same worktree.
Parallelism is only safe for read-only analysis and reviewer work.

## Review Gate Per Task

For every task:

1. implementation subagent completes the task
2. spec reviewer checks against:
   - `docs/superpowers/specs/2026-03-13-frontend-nextjs-tailwind-shadcn-design.md`
   - `docs/superpowers/migration/admin-parity-checklist.md` for admin tasks
3. code quality reviewer checks test quality, boundaries, and maintainability
4. only then mark the task complete

## Plan Exit Condition

The migration plan is execution-ready when:

1. `frontend-next/` exists and runs
2. BFF/session integration is stable
3. `Public` and `Workspace` route families are migrated
4. `Admin` routes pass parity review against the captured baseline
5. final build and test evidence are recorded
