# Admin Skills Inline Detail Panel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/admin/skills` drawer detail interaction with an inline right-side detail panel that preserves continuous list scanning.

**Architecture:** Keep the existing two-column admin catalog layout, but move detail ownership into the route body instead of `DetailFormSurface`. The left column remains the governed inventory list, while the right column switches between governance side panels and the selected skill detail card plus actions.

**Tech Stack:** Next.js App Router, React, TypeScript, SCSS modules, Vitest, Playwright.

---

## Chunk 1: Contract updates

### Task 1: Update unit and E2E expectations for inline detail behavior

**Files:**
- Modify: `frontend-next/tests/unit/admin-catalog-content.test.ts`
- Modify: `frontend-next/tests/e2e/authenticated-admin-catalog-ingestion.spec.ts`

- [ ] Update unit assertions so `/admin/skills` checks for inline selection copy instead of drawer triggers.
- [ ] Update E2E flow so `/admin/skills` verifies same-page detail content and the absence of dialog behavior.

## Chunk 2: Skills route implementation

### Task 2: Refactor skills route to use inline detail panel

**Files:**
- Modify: `frontend-next/src/features/adminCatalog/AdminCatalogViews.tsx`
- Modify: `frontend-next/src/features/adminCatalog/AdminCatalogShared.tsx`
- Modify: `frontend-next/src/features/adminCatalog/AdminCatalogSurface.module.scss`

- [ ] Reuse selected-row state as the single source of truth for the details pane.
- [ ] Remove drawer open state and drawer rendering from `/admin/skills`.
- [ ] Render selected skill details inline in the right column with clear actions.
- [ ] Keep jobs and sync-runs drawer behavior unchanged.

## Chunk 3: Verification

### Task 3: Run focused verification

**Files:**
- Verify: `frontend-next/tests/unit/admin-catalog-content.test.ts`
- Verify: `frontend-next/tests/e2e/authenticated-admin-catalog-ingestion.spec.ts`

- [ ] Run the updated unit test file.
- [ ] Run the targeted E2E spec.
- [ ] Run build for `frontend-next`.
