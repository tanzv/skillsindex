# Protected Route Contract Consolidation Design

## Goal

Reduce duplicated protected-route truth inside `frontend-next/` by consolidating shared route literals into governed routing contracts and updating high-churn consumers to depend on those contracts instead of inline path strings.

## Scope

This design covers:

1. protected route constants used by `Admin`, `Workspace`, and `Account`
2. route-entry files under `frontend-next/app/**`
3. route metadata and feature-level route switch points
4. workbench and overview quick-link consumers that currently duplicate protected route strings

This design does not cover:

1. backend `internal/web` transport and template refactors
2. retirement of backend-rendered legacy pages
3. public route-family consolidation beyond directly touched consumers

## Current Problems

1. protected route strings are repeated across `src/lib/routing/**`, `app/**`, `src/features/**`, and workbench definitions
2. route additions or renames require synchronized edits in multiple unrelated layers
3. navigation and feature render logic depend on string duplication instead of shared contracts
4. the active frontend architecture drifts away from the repository target of explicit route ownership

## Design

### 1. Expand the protected routing contract

`frontend-next/src/lib/routing/protectedSurfaceLinks.ts` will become the canonical exported constant set for protected route paths. Any protected route currently duplicated as a string literal in active frontend code should have a named exported constant there.

This keeps route ownership in `src/lib/routing/**`, aligned with the frontend architecture blueprint, while avoiding a larger route-registry rewrite in one patch.

### 2. Repoint high-churn consumers

The following consumers will be updated to import shared constants:

1. `app/**` protected route entry files
2. `src/lib/routing/adminRouteRegistry.data.ts`
3. `src/lib/routing/adminRoutePageMeta.ts`
4. `src/features/adminOverview/model.ts`
5. `src/features/workbench/**`
6. `src/features/workspace/**`
7. selected admin feature files that branch on route identity

The change is intentionally biased toward files that either:

1. define route truth today
2. branch behavior by route
3. produce user-facing navigation or action links

### 3. Keep routing and navigation boundaries stable

This patch will not move navigation ownership into feature folders. It only reduces duplicate literal usage inside existing ownership points.

If a file needs path comparison, it should compare against imported route constants. If a file needs a path collection, it should derive that collection from routing contracts where practical.

### 4. Structural cleanup

The accidental nested artifact folder under `frontend-next/frontend-next/` will be removed from the active frontend structure if it is confirmed to be generated scratch output only. If not safe to delete, it will be left untouched and documented as residual cleanup.

## Extension Points

1. introduce route-definition objects keyed by stable route ids for protected surfaces
2. derive page metadata, workbench definitions, and top-level route entries from one protected route registry
3. migrate public route-family consumers to the same pattern in a follow-up refactor

## Assumptions

1. this iteration prioritizes safe frontend consolidation over a broader routing rewrite
2. the current protected route taxonomy remains stable during the patch
3. preserving behavior is more important than maximizing abstraction depth in one change set

## Testing Strategy

1. add or update unit tests for any newly centralized route constant usage
2. add regression tests for route-entry and metadata consumers touched by the refactor
3. run targeted frontend unit tests for routing, admin route metadata, workspace route rendering, and workbench definitions

## Risks

1. missing one duplicated path consumer could leave partial truth duplication
2. route-keyed object literals may require careful typing when swapping string keys to constants
3. broad literal replacement without tests could silently break route-specific branches

## Mitigations

1. use TDD for touched route consumers
2. refactor only protected-route surfaces in this patch
3. verify with focused unit suites before claiming completion
