# Frontend Architecture Blueprint

Version: 1.2
Last Updated: 2026-03-22
Owner: Frontend Architecture

## Objective

Define the current target architecture for repository frontends and the concrete system blueprint for `frontend-next/`.
This document is descriptive and project-specific.
Repository-wide frontend rules remain defined by policy and standards documents under `agents/policies/` and `agents/standards/`.

## Scope

This blueprint applies to:

1. the active Next.js frontend under `frontend-next/`
2. future repository frontends that need to align with the same product surface model
3. architecture reviews, refactors, and new module placement decisions

## Product Surface Model

The frontend is one product with four route families:

1. **Public**
   - marketplace discovery
   - category exploration
   - rankings
   - skill detail
   - product narrative and docs-like content
2. **Workspace**
   - authenticated operational work
   - queue, activity, runbook, policy, and actions
3. **Admin**
   - governance
   - ingestion
   - moderation
   - organizations
   - accounts and platform controls
4. **Account**
   - user profile
   - security
   - sessions
   - API credentials

These route families must feel like one system with shared visual foundations and consistent navigation behavior, not like unrelated apps.

## Architecture Goals

1. Keep backend-owned business truth out of presentation modules.
2. Keep route entry files thin and framework-specific.
3. Keep page-family behavior inside feature boundaries.
4. Keep reusable UI stable and business-agnostic.
5. Keep data shaping pure and testable.
6. Keep network, auth, cookie, and proxy concerns behind explicit adapters and BFF boundaries.
7. Keep styling token-first with controlled global entry points.
8. Improve incrementally without forcing large rewrites for every touched file.

## Runtime Topology

The intended runtime path is:

1. browser request enters `Next.js App Router`
2. route entry parses params and coordinates server-side loading
3. route entry delegates to a feature page or shell
4. feature page composes shared UI and feature-local components
5. feature-local page models derive display-ready state from normalized contracts
6. adapters and BFF handlers isolate backend integration concerns
7. backend remains the system of record for domain truth and durable workflow behavior

## Directory Blueprint

`frontend-next/` must converge on the following ownership map:

1. `app/**`
   - route registration
   - route-family layouts
   - route-specific metadata
   - top-level server orchestration
   - BFF route handlers under `app/api/**`
2. `src/features/**`
   - route-family implementation
   - page composition
   - feature-local hooks
   - feature-local model builders
   - feature-local subcomponents
3. `src/components/**`
   - shared primitives
   - shared composites
   - shells
   - cross-feature reusable navigation and structural UI
4. `src/lib/**`
   - application-agnostic helpers
   - adapters
   - schemas
   - route helpers
   - auth/session helpers
   - registries with more than one consuming feature or route family
5. `app/*.css`, `app/*.scss`, and local `*.module.scss`
   - approved global theme and shell entry points
   - route-family stylesheet entry points
   - component-local styles

## Layer Mapping For `frontend-next/`

Map the repository frontend layers into concrete ownership like this:

1. **Entry Layer**
   - `frontend-next/app/**`
   - only route registration, layout nesting, and route handler entry logic
2. **Route Composition Layer**
   - route `page.tsx` and `layout.tsx`
   - server fetch coordination
   - search-param parsing
   - metadata wiring
3. **Feature Layer**
   - `frontend-next/src/features/**`
   - page-family composition and feature-local interaction ownership
4. **Shared UI Layer**
   - `frontend-next/src/components/**`
   - reusable UI, shells, shared navigation, and common presentation contracts
5. **Application Model Layer**
   - pure builders in `src/features/**` when feature-owned
   - pure reusable mappers, selectors, and registries in `src/lib/**` when multi-consumer
6. **Adapter Layer**
   - `src/lib/api/**`
   - `src/lib/auth/**`
   - `src/lib/http/**`
   - `src/lib/bff/**`
   - route handlers in `app/api/**`
7. **Design Foundation Layer**
   - token, theme, and foundation styles under app-owned entry files and standards-governed theme files

## Dependency Rules For The Current System

1. `app/**` may import `src/features/**`, `src/components/**`, and `src/lib/**`.
2. `src/features/**` may import `src/components/**` and `src/lib/**`.
3. `src/components/**` may import `src/lib/**` but must not import feature internals.
4. `src/lib/**` must not depend on route entry files.
5. Feature-local pure builders should stay in the feature until multiple unrelated consumers justify promotion.
6. Adapters must not depend on page components or route-local render code.

## Current Source Of Truth Boundaries

The current frontend already has several partial registries.
Treat them as the active ownership points until a stronger replacement exists:

1. `src/lib/routing/routes.ts`
   - coarse route-family membership
   - top-level navigation items
   - protected-route detection helpers
2. `src/lib/navigation/protectedNavigationRegistry.ts`
   - protected shell module registration
   - protected sidebar grouping
   - protected topbar structure
3. `src/lib/routing/usePublicRouteState.ts`
   - public route prefix handling for canonical and prefixed public paths
4. feature-local marketplace builders under `src/features/public/marketplace/**`
   - public marketplace view shaping until those contracts become shared enough to promote

The public route family still has more distributed navigation truth than the protected route families.
The target direction is to converge public route metadata and navigation behavior into explicit registries instead of repeated local decisions.

For `frontend-next/`, apply this ownership split when both folders exist for one surface:

1. `src/lib/routing/**`
   - canonical route paths
   - route-family unions and matchers
   - route metadata adapters
   - endpoint and render-target contracts
2. `src/lib/navigation/**`
   - shell-facing navigation registration
   - sidebar or topbar grouping
   - shell presets and module ordering
   - projections derived from routing contracts

`src/lib/navigation/**` should not become a second route truth source.
If a navigation file needs path literals or route copy, it should consume the shared routing contract instead of redefining it.

## Request And Data Flow

Use this request flow for new work:

1. route entry parses request params and headers
2. route entry or server feature boundary calls adapters under `src/lib/api/**`
3. adapter normalizes transport concerns and returns stable frontend contracts
4. feature-local pure builders derive page state from normalized contracts
5. page components render from model output and bind user interactions

Do not let shared UI or low-level primitives parse backend envelopes, raw request headers, or arbitrary `searchParams`.

## Server And Client Boundaries

1. Default to server components for route entries and server orchestration.
2. Use client components only where browser hooks, events, or local interactive state are required.
3. When a client page starts owning large data-shaping logic, split that logic into a pure model builder.
4. Keep auth, CSRF, cookie, and proxy behavior inside adapters, providers, or route handlers rather than arbitrary components.

## Page Composition Pattern

The default page pattern for `frontend-next/` is:

1. route entry loads and normalizes data
2. feature page owns shell slot composition, event binding, and render composition
3. pure page model builder derives view-ready sections, metrics, links, and labels
4. shared or feature-local subcomponents render the derived model

This pattern is already the target for public search, public category detail, and similar route families.
It should become the default for remaining fat pages.

## Detail Form Interaction Pattern

For pages that list, inspect, or govern records, the default interaction pattern is:

1. keep the page route stable
2. let the feature module own selected-record state
3. open the record detail form in a shared drawer surface
4. keep side effects and submit orchestration inside the feature boundary
5. reserve modal presentation for blocking review or confirmation flows only

This keeps operational context visible, reduces route churn, and allows detail workflows to scale without turning shared shells into page-specific controllers.

## State Ownership

Use these ownership rules:

1. URL and route state belong to route composition or route-state adapters.
2. feature interaction state belongs to the owning feature module.
3. reusable UI may own only ephemeral presentation state.
4. shared cross-route state requires an explicit provider or adapter boundary.
5. hidden singleton state is not an approved default.

## Styling Architecture

The current styling strategy is:

1. token-first visual decisions
2. approved global entry styles only at app, theme, and shell boundaries
3. route-family stylesheet entry points imported from matching layouts or route files
4. local component or feature styling through `*.module.scss`
5. legacy global CSS kept only where already justified by route-family or theme ownership

The active direction is to keep route-family styles scoped to the owning layout and migrate materially touched local styles toward SCSS modules.

## Testing Architecture

Architecture work should be verified through multiple test shapes:

1. pure builder unit tests for page models and selectors
2. route-split tests that prevent pages from directly importing lower-level view-model internals
3. layout and stylesheet guard tests that keep global and route-level style boundaries stable
4. component contract tests for shared UI and shells
5. E2E or documented manual evidence for high-risk navigation and flow changes

## Extension Points

Use these extension points when expanding the frontend:

1. **New Route Family**
   - add route-family layouts under `app/**`
   - define shell ownership
   - define navigation registry ownership before scale increases
2. **New Feature Page**
   - add route entry in `app/**`
   - add feature page and pure page model under `src/features/**`
   - extract shared UI only after real multi-consumer demand
3. **New Shared Component**
   - use `src/components/**`
   - satisfy the intake checklist
   - document styling and extension contracts
4. **New Adapter Or BFF Capability**
   - place boundary logic under `src/lib/**` or `app/api/**`
   - keep backend mechanics out of components
5. **New Framework**
   - add a dedicated framework chapter under `agents/standards/frameworks/`
   - map this blueprint into the new runtime structure

## Current Refactor Priorities

The current architecture backlog for `frontend-next/` is:

1. keep shrinking fat public pages by moving pure derivation into feature-local page models
2. converge public route metadata and navigation truth into more explicit registries
3. remove adapter-to-feature inversions where low-level API modules depend on feature-local presentation shaping
4. continue reducing global stylesheet coupling by keeping route-family style imports at layout boundaries
5. keep shared shells focused on navigation and framing instead of page-specific business rules

## Decision Rules

When placement is unclear, decide in this order:

1. place the module where the primary responsibility is owned today
2. keep it feature-local if reuse is still narrow or uncertain
3. promote to shared or `src/lib/**` only after the contract is stable and multi-consumer
4. if a module mixes routing, pure logic, and render concerns, split it before growth continues

## Related Documents

Use these documents together:

1. `AGENTS.md`
2. `agents/project-architecture-profile.md`
3. `agents/policies/frontend-governance.md`
4. `agents/standards/frontend-architecture-layering.md`
5. `agents/standards/frameworks/react-nextjs-standards.md`
