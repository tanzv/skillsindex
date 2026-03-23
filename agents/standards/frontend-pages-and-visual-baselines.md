# Frontend Features and Visual Baselines Standard

Version: 1.1
Last Updated: 2026-03-18
Owner: Frontend Engineering

## Objective

Define the mandatory structure for route-level frontend modules and the maintenance contract for visual verification in `frontend-next/`.
This standard exists to keep App Router entry files thin, feature modules scalable, and screenshot-sensitive checks deterministic.

This standard works with:

1. `agents/standards/frontend-architecture-layering.md`
2. `agents/standards/frameworks/react-nextjs-standards.md`

## Scope

This standard applies to:

1. `frontend-next/app/**`
2. `frontend-next/src/features/**`
3. `frontend-next/src/components/**`
4. `frontend-next/tests/e2e/**`
5. `frontend-next/tmp-screens/**` when a task intentionally captures supplemental screenshot evidence

## 1. Route Entry And Feature Structure Contract

### 1.1 App Router Entry Rule

1. `frontend-next/app/` owns route registration, layouts, and server entry orchestration.
2. Do not place substantial route business logic directly in `page.tsx` or `layout.tsx` files.
3. App Router files should stay thin and delegate implementation to `frontend-next/src/features/**` or shared shell components.

### 1.2 Feature Folder Rule

1. Create one folder per route family, page family, or cohesive workbench area under `frontend-next/src/features/`.
2. Folder names must describe the domain boundary, for example:
   - `public`
   - `workspace`
   - `adminOverview`
   - `adminCatalog`
   - `accountCenter`
3. Prefer stable domain names over temporary workflow names.

### 1.3 Co-location Rule

Keep the following together inside the same feature folder when they belong to one page family:

1. Page entry components (`*Page.tsx`)
2. Local subcomponents
3. Local hooks
4. Local helpers
5. Local types
6. Local copy/config modules
7. Page-local state/view-model modules
8. Unit tests that specifically cover that feature boundary

### 1.4 Shared Extraction Rule

1. If code is reusable across multiple feature folders, move it out of the feature folder.
2. Shared presentational UI belongs in `frontend-next/src/components/`.
3. Shared pure logic, data shaping, routing helpers, or route-agnostic utilities belong in `frontend-next/src/lib/`.
4. Do not keep cross-feature reuse hidden inside an unrelated feature folder.

## 2. Import And Refactor Safety Contract

### 2.1 Import Path Rule

1. App-level route wiring must import page implementations from feature folders or shared shells.
2. Relative imports inside a feature folder should stay local to that folder.
3. Do not recreate legacy flat page registries or compatibility shims unless explicitly approved.

### 2.2 Move-Safety Rule

Whenever a route file or feature module moves:

1. Update direct imports.
2. Update App Router entry files under `frontend-next/app/**`.
3. Update any filesystem-based tests or route render helpers.
4. Update affected unit and e2e coverage in the same change set.

### 2.3 Review Rule

A pages/features refactor is not complete until:

1. The target feature folder owns the moved files coherently.
2. No stale import path references remain.
3. No temporary duplicate files remain in the old location.

## 3. Visual Verification Contract

### 3.1 Scenario Coverage Rule

1. Every screenshot-sensitive route change must have deterministic Playwright coverage or an explicitly documented manual capture procedure.
2. Missing coverage for a screenshot-sensitive route is a validation gap.

### 3.2 Evidence Storage Rule

1. Use `frontend-next/test-results/` for Playwright artifacts generated during verification.
2. Use `frontend-next/tmp-screens/` only for temporary or task-specific screenshot evidence.
3. Use `prototypes/skillsindex_framework/` for long-lived prototype baselines and design-source reference material.

### 3.3 Intentional Visual Change Rule

When a route-level visual contract changes intentionally:

1. Update the implementation.
2. Update the matching tests or screenshot assertions.
3. Refresh any manual screenshots captured for review.
4. Re-run the relevant verification command and record the evidence.

Do not merge intentional UI changes while leaving stale visual evidence in place.

## 4. Visual Capture Stability Rule

Visual verification runs must reduce avoidable screenshot noise.

Required stabilization behavior:

1. Wait for route content to load before capture or assertion.
2. Wait for fonts and client hydration to settle when the flow depends on them.
3. Neutralize non-essential animations and transitions during capture.
4. Keep locale, auth stubs, and mock data deterministic for the scenario.
5. Prefer route-specific assertions over broad screenshot snapshots when behavior is the real contract.

## 5. Verification Requirements

### 5.1 Required Commands For Route Refactors

For route-level file moves or feature-folder refactors, run at minimum:

1. `cd frontend-next && npm run lint`
2. `cd frontend-next && npm run build`
3. Targeted `cd frontend-next && npm run test:unit -- ...` for the changed feature families
4. Relevant `cd frontend-next && npm run test:e2e -- ...` coverage when route behavior or shells are affected

### 5.2 Expanded Verification For High-Risk Frontend Changes

When route behavior, navigation, shared shells, or screenshot-sensitive layouts change, also record:

1. Which e2e specs were run
2. Whether Playwright produced artifacts under `frontend-next/test-results/`
3. Any manual screenshots captured under `frontend-next/tmp-screens/`

If any command is flaky or partially scoped, document:

1. What failed or was skipped
2. Whether it reproduced consistently
3. Why it is believed to be flaky or environmental
4. Residual risk after the available verification

## 6. Enforcement Summary

The following are considered rule violations:

1. Putting substantial route implementation directly under `frontend-next/app/` instead of a feature module
2. Moving feature files without fixing route entry imports or affected tests
3. Shipping screenshot-sensitive UI changes without matching verification evidence
4. Claiming completion for a frontend refactor without command-based verification evidence
