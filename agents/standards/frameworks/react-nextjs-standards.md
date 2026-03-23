# React And Next.js Standards

Version: 1.3
Last Updated: 2026-03-22
Owner: Frontend Architecture

## Objective

Define how the repository-wide frontend standards apply to React and Next.js implementations.

## Scope

This chapter applies to any React and Next.js frontend in the repository, including `frontend-next/`.

## Route Structure Rules

1. App Router entry files own route registration, layout nesting, and top-level server orchestration only.
2. `page.tsx`, `layout.tsx`, `loading.tsx`, and `error.tsx` must stay thin.
3. Meaningful page implementation belongs in feature modules or shared shells, not directly in route entry files.
4. Redirect-only routes should remain trivial.

## Server And Client Boundary Rules

1. Default to server components unless client runtime behavior is required.
2. Add `"use client"` only when the module needs browser-only hooks, event handlers, or client-side state.
3. Do not mark a large subtree client-side for convenience when only a small leaf requires it.
4. Keep data shaping outside client components where possible.

## Data Loading Rules

1. Top-level request parsing and server fetching should happen at route or server feature boundaries.
2. Client components should not call backend APIs directly unless the project standard explicitly approves it.
3. Prefer repository adapters and BFF routes over ad-hoc fetch calls scattered through the tree.
4. Normalize or map backend payloads before they spread across shared UI.

## Provider Rules

1. Providers must be placed at the smallest stable boundary that needs them.
2. Root layout should not become a dumping ground for feature-specific providers.
3. Route-family layouts may own shell-scoped providers when the whole family depends on them.

## Directory Mapping Rules

For React and Next.js implementations, map the repository layers like this:

1. `app/**`
   - Entry Layer and route-family layout wiring
2. `src/features/**`
   - Feature Layer
3. `src/components/**`
   - Shared UI Layer
4. `src/lib/**`
   - Application Model and Adapter Layers
5. theme and token files under the owning app boundary
   - Design Foundation Layer

## Styling Rules

1. New React component-local styles should use `*.module.scss`.
2. Global route-family or theme entry styles may remain global only when the owning project standard requires it.
3. Shared components should not rely on unrelated route-level global selectors for their base appearance.

## Route Registry Rules

1. Paths, navigation labels, route descriptions, and render dispatch should converge toward explicit registries.
2. Avoid growing `if` or `switch` dispatchers when a declarative route registry would scale better.
3. If multiple route maps exist, document which one is the source of truth.
4. A public barrel such as `src/lib/routing/<family>RouteRegistry.ts` may re-export a split implementation, but consumers should still have one obvious entry point.
5. Prefer splitting large route registries into route families, contract types, definitions, and matchers before a single file becomes a routing dump.
6. Keep route metadata adapters separate from path-family registries when that separation makes ownership clearer.
7. In `src/lib/routing/**`, keep the authoritative route contract: path families, route unions, metadata adapters, endpoint bindings, and render-target ownership.
8. In `src/lib/navigation/**`, keep shell-facing projections such as sidebar grouping, topbar layout, or navigation registration, and derive them from `src/lib/routing/**` instead of redefining paths.

## Route Branching Rules

1. Feature components may branch on a validated route value when choosing route-specific rendering or feature-local view-model shaping.
2. Feature components must not become the source of truth for shared path literals, route metadata, or endpoint mappings that belong in `src/lib/routing/**`.
3. Temporary wrapper modules that only forward to shared route contracts may be used during migration, but new imports must point to the shared contract directly.
4. When a wrapper stops carrying migration value, remove it in the next safe refactor rather than preserving duplicate route access paths.

## Component Rules

1. Shared components should receive normalized props, not raw `searchParams`, request headers, or backend envelopes.
2. Client components that become view-model builders should be split into model and render layers.
3. Keep React hooks local to the component or feature that owns the behavior.

## Detail Form Overlay Rules

1. For record details and edit forms inside an existing page family, prefer a feature-owned drawer instead of a dedicated route transition.
2. Use a modal only when the interaction must block surrounding context, such as destructive confirmation or short mandatory review.
3. Keep overlay open state, selected-record state, and submit orchestration in the owning feature client boundary.
4. Shared detail-form surfaces under `src/components/**` must stay controlled and business-agnostic.
5. When URL-addressable detail overlays are required, the route layer may parse and pass the open/selected contract, but the shared surface must still remain route-agnostic.

## BFF And Route Handler Rules

1. Route handlers must act as explicit boundary modules.
2. Auth, CSRF, cookie, and proxy concerns belong in adapters and boundary helpers, not in arbitrary UI components.
3. Route handlers must not become unbounded backend mirrors without clear ownership.

## Testing Rules

1. Pure builders and mappers require deterministic unit tests.
2. Shared component contracts require render or interaction tests as appropriate.
3. Route-family shell changes require integration coverage for navigation and layout behavior.
4. High-risk route changes should include E2E coverage or documented manual evidence when automated coverage is not yet feasible.

## Migration Rules

1. Existing React and Next.js code does not require wholesale rewrite to match this chapter.
2. New files and materially refactored files must follow this chapter.
3. When touching legacy boundaries, improve them toward the target structure rather than reproducing the same architectural debt.
