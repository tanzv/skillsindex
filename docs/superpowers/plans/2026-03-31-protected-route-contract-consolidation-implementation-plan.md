# Protected Route Contract Consolidation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate protected frontend route literals behind shared routing contracts and update high-churn consumers to use those contracts.

**Architecture:** Keep route ownership inside `frontend-next/src/lib/routing/**`, expand the protected route constant surface, and rewire route-entry, metadata, workbench, and feature branching code to import canonical constants. Preserve runtime behavior while shrinking duplicate route truth.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest

---

## Chunk 1: Contract Expansion

### Task 1: Document protected route constants that must become canonical

**Files:**
- Modify: `frontend-next/src/lib/routing/protectedSurfaceLinks.ts`
- Test: `frontend-next/tests/unit/auth-routing.test.ts`

- [ ] Step 1: Add or update a failing test that expects the touched protected routes to be exported from the shared routing contract.
- [ ] Step 2: Run the targeted test and verify it fails for the missing exports.
- [ ] Step 3: Add the missing exported route constants and any stable grouped collections needed by current consumers.
- [ ] Step 4: Re-run the targeted test and verify it passes.

### Task 2: Repoint protected route registry data to canonical constants

**Files:**
- Modify: `frontend-next/src/lib/routing/adminRouteRegistry.data.ts`
- Test: `frontend-next/tests/unit/admin-route-registry.test.ts`

- [ ] Step 1: Add a failing assertion that registry definitions resolve the expected canonical paths.
- [ ] Step 2: Run the registry test and verify the new assertion fails.
- [ ] Step 3: Replace inline protected route strings with imported constants.
- [ ] Step 4: Re-run the registry test and verify it passes.

## Chunk 2: Consumer Refactor

### Task 3: Repoint route-entry and metadata consumers

**Files:**
- Modify: `frontend-next/app/(admin)/**/page.tsx`
- Modify: `frontend-next/app/(workspace)/**/page.tsx`
- Modify: `frontend-next/app/(account)/**/page.tsx`
- Modify: `frontend-next/src/lib/routing/adminRoutePageMeta.ts`
- Test: `frontend-next/tests/unit/admin-route-entrypoints.test.ts`
- Test: `frontend-next/tests/unit/account-route-entrypoints.test.ts`
- Test: `frontend-next/tests/unit/workspace-route-entry-split.test.ts`

- [ ] Step 1: Add failing assertions that route-entry files and metadata resolve via shared constants.
- [ ] Step 2: Run the targeted tests and verify failure.
- [ ] Step 3: Replace inline path strings with imported canonical constants.
- [ ] Step 4: Re-run the targeted tests and verify success.

### Task 4: Repoint feature route branching and quick links

**Files:**
- Modify: `frontend-next/src/features/adminOverview/model.ts`
- Modify: `frontend-next/src/features/workbench/adminDefinitions.ts`
- Modify: `frontend-next/src/features/workbench/adminDefinitionsOps.ts`
- Modify: `frontend-next/src/features/workbench/accountDefinitions.ts`
- Modify: `frontend-next/src/features/workspace/pageSections.ts`
- Modify: `frontend-next/src/features/workspace/WorkspaceRouteViews.tsx`
- Modify: selected `frontend-next/src/features/admin**/*.tsx` files with inline protected route branching
- Test: `frontend-next/tests/unit/workspace-route-views.test.ts`
- Test: `frontend-next/tests/unit/workbench-config.test.ts`
- Test: `frontend-next/tests/unit/admin-route-page-meta.test.ts`

- [ ] Step 1: Add failing assertions around route-keyed lookups or quick-link outputs for touched modules.
- [ ] Step 2: Run the targeted tests and verify failure.
- [ ] Step 3: Replace inline path literals with imported route constants while preserving behavior.
- [ ] Step 4: Re-run the targeted tests and verify success.

## Chunk 3: Structure and Verification

### Task 5: Resolve accidental nested frontend artifact structure

**Files:**
- Inspect: `frontend-next/frontend-next/**`
- Modify if safe: cleanup or ignore configuration

- [ ] Step 1: Confirm whether the nested folder is generated scratch output and not active source.
- [ ] Step 2: If safe, remove or isolate it from the active frontend structure; otherwise document it as residual cleanup.

### Task 6: Run focused verification

**Files:**
- Test: `frontend-next/tests/unit/**`

- [ ] Step 1: Run targeted unit tests for routing, route entrypoints, workbench configuration, and workspace route rendering.
- [ ] Step 2: Run the relevant frontend lint or type-safe verification if the touched scope requires it.
- [ ] Step 3: Record exact commands and outcomes before claiming completion.
