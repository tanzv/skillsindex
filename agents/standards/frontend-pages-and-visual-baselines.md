# Frontend Pages and Visual Baselines Standard

Version: 1.0
Last Updated: 2026-03-08
Owner: Frontend Engineering

## Objective

Define the mandatory structure for route-level frontend modules and the maintenance contract for visual regression baselines.

This standard exists to keep `frontend/src/pages` scalable, reviewable, and predictable while preserving reliable screenshot-based verification.

## Scope

This standard applies to:

1. `frontend/src/pages/**`
2. `frontend/scripts/visual-regression/**`
3. `frontend/prototype-baselines/**`
4. `frontend/public/prototypes/previews/**` when a scenario or prototype-alignment rule depends on those files

## 1. Pages Directory Structure Contract

### 1.1 Root Directory Rule

1. `frontend/src/pages/` is a feature-folder index, not a dumping ground.
2. Do not place new page implementation files directly under `frontend/src/pages/`.
3. The root may contain folders only, unless a temporary exception is explicitly approved and documented.

### 1.2 Feature Folder Rule

1. Create one folder per route family, page family, or cohesive workbench area.
2. Folder names must describe the domain boundary, for example:
   - `marketplaceHome`
   - `marketplacePublic`
   - `adminOverview`
   - `adminWorkbench`
   - `publicSkillDetail`
3. Prefer stable domain names over temporary workflow names.

### 1.3 Co-location Rule

Keep the following together inside the same feature folder when they belong to one page family:

1. Page entry components (`*Page.tsx`)
2. Local subcomponents
3. Local hooks
4. Local helpers
5. Local types
6. Local copy/config modules
7. Local style modules
8. Unit tests and alignment tests

Example:

- `WorkspaceCenterPage.tsx`
- `WorkspaceCenterPage.helpers.ts`
- `WorkspaceCenterPage.navigation.ts`
- `WorkspaceCenterPage.styles.ts`
- `WorkspaceCenterPage.test.ts`

### 1.4 Shared Extraction Rule

1. If code is reusable across multiple feature folders, move it out of the page folder.
2. Shared presentational UI belongs in `frontend/src/components/`.
3. Shared pure logic, data shaping, or route-agnostic utilities belong in `frontend/src/lib/`.
4. Route-family shared helpers may live in an explicit shared page folder such as `publicShared` or `adminShared`.
5. Do not keep cross-feature reuse hidden inside an unrelated feature folder.

### 1.5 Naming Rule

1. Keep page entry filenames explicit and stable, for example `MarketplaceHomePage.tsx`.
2. Keep companion module names aligned with the page basename, for example:
   - `MarketplaceHomePage.helpers.ts`
   - `MarketplaceHomePage.styles.tsx`
   - `MarketplaceHomePage.copy.ts`
3. Avoid ambiguous generic filenames such as `helpers.ts`, `styles.ts`, or `types.ts` unless they are nested under a page-specific folder and the scope is obvious.

## 2. Import and Refactor Safety Contract

### 2.1 Import Path Rule

1. App-level route wiring must import pages from their feature folders.
2. Relative imports inside a feature folder should stay local to that folder.
3. Do not preserve legacy root-level page paths through compatibility shims unless explicitly approved.

### 2.2 Move-Safety Rule

Whenever a page file moves:

1. Update direct imports.
2. Update `?raw` imports used by style or governance tests.
3. Update filesystem-based alignment tests that resolve files through `path.resolve(...)`.
4. Update route-entry imports in `frontend/src/App.tsx` and any affected test files.

### 2.3 Review Rule

A pages refactor is not complete until:

1. The target feature folder owns the moved files coherently.
2. No stale import path references remain.
3. No temporary duplicate files remain in the old location.

## 3. Visual Baseline Contract

### 3.1 Scenario Coverage Rule

1. Every scenario declared in `frontend/scripts/visual-regression/run.mjs` must reference an existing baseline file.
2. Missing baselines are validation gaps and must be treated as unfinished verification for that scenario.

### 3.2 Baseline Storage Rule

1. Use `frontend/prototype-baselines/` for active visual regression baselines driven by the screenshot runner.
2. Use `frontend/public/prototypes/previews/` for prototype preview assets and route-alignment previews.
3. If a scenario depends on preview assets instead of regression baselines, document that explicitly in the scenario config.

### 3.3 Baseline Update Rule

When a route-level visual contract changes intentionally:

1. Update the implementation.
2. Update the matching baseline image.
3. Update the scenario path if storage location changes.
4. Re-run the relevant visual regression command and record the evidence.

Do not merge intentional UI changes while leaving stale baselines in place.

## 4. Visual Capture Stability Rule

Visual regression runs must reduce avoidable screenshot noise.

Required stabilization behavior:

1. Wait for route content selector visibility.
2. Wait for document fonts to finish loading.
3. Neutralize animations and transitions during capture.
4. Use a deterministic viewport derived from the baseline image dimensions.
5. Keep locale, auth stubs, and mock data deterministic for the scenario.

## 5. Verification Requirements

### 5.1 Required Commands for Pages Refactors

For route-level file moves or page-folder refactors, run at minimum:

1. `cd frontend && npm run build`
2. Targeted `cd frontend && npm run test:unit -- ...` for the moved page families
3. Relevant visual regression or route-alignment checks when screenshot-based coverage exists

### 5.2 Expanded Verification for High-Risk Frontend Changes

When route behavior, navigation, or shared shells change, also run:

1. `cd frontend && npm run test:e2e`
2. `cd frontend && npm run test:visual`

If any command is flaky or partially scoped, document:

1. What failed or was skipped
2. Whether it reproduced consistently
3. Why it is believed to be flaky or environmental
4. Residual risk after the available verification

## 6. Enforcement Summary

The following are considered rule violations:

1. Adding new route implementation files directly under `frontend/src/pages/`
2. Moving page files without fixing relative path tests or raw imports
3. Shipping visual regression scenarios with missing baselines
4. Claiming completion for a frontend refactor without matching verification evidence
