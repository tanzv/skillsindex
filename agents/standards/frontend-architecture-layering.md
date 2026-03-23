# Frontend Architecture Layering Standard

Version: 1.2
Last Updated: 2026-03-22
Owner: Frontend Architecture

## Objective

Define the mandatory architecture layers, dependency direction, and module boundaries for all frontend implementations in the repository.

## Layer Model

Every frontend implementation must map its code into the following layers:

1. **Entry Layer**
   - application bootstrap
   - framework route registration
   - global providers
   - shell mounting
2. **Route Composition Layer**
   - route-level orchestration
   - request parsing
   - top-level data loading coordination
   - route metadata wiring
3. **Feature Layer**
   - page-family composition
   - feature-local view models
   - feature-local subcomponents, hooks, and helpers
4. **Shared UI Layer**
   - reusable business-agnostic UI
   - shells
   - shared interaction patterns
   - design-system primitives
5. **Application Model Layer**
   - pure data shaping
   - domain rules
   - serializers, selectors, mappers, and view-model builders
6. **Adapter Layer**
   - HTTP adapters
   - storage adapters
   - framework bindings
   - BFF contracts
7. **Design Foundation Layer**
   - tokens
   - theme variables
   - typography, spacing, and semantic visual contracts

## Dependency Direction

1. Higher layers may depend on lower layers.
2. Lower layers must not import higher layers.
3. Shared UI must not import feature modules.
4. Application model code should stay framework-agnostic where practical.
5. Design foundation files must not import runtime behavior modules.

## Ownership Rules

1. Entry Layer owns framework registration and nothing else.
2. Route Composition Layer owns route wiring and top-level orchestration, not page internals.
3. Feature Layer owns page-family behavior and feature-local composition.
4. Shared UI Layer owns reusable UI contracts with stable APIs.
5. Application Model Layer owns pure logic and data transformations.
6. Adapter Layer owns side-effectful boundary code and external service integration.

## Boundary Rules

1. Route entry files must stay thin and delegate meaningful work to feature modules.
2. A feature may have local substructure, but it must not become an unbounded dump for cross-domain reuse.
3. Shared modules require explicit reuse across multiple consumers before extraction.
4. If a module contains both orchestration and reusable presentation, split it.
5. If a file mixes framework wiring, domain logic, and presentation concerns, split it.

## State Ownership Rules

1. State should live at the lowest layer that owns the behavior.
2. UI primitives may own ephemeral visual state only.
3. Feature modules own feature-scoped interactive state.
4. Shared business state must move behind explicit adapters or providers.
5. Hidden singleton state is forbidden unless the framework chapter explicitly approves it.

## Route And Navigation Rules

1. Paths, navigation labels, route metadata, and render dispatch should converge on a small number of explicit registries.
2. Do not duplicate route truth across unrelated files without a documented reason.
3. Redirect-only routes should stay trivial and must not hide business logic.

### Route Truth Source Rules

1. Route path families and route union types should live in explicit routing registries.
2. Page copy, titles, descriptions, and route-specific endpoints should live in route metadata adapters near the routing layer, not in feature pages.
3. Feature pages may consume route contracts, but they must not become the primary owner of shared path, endpoint, or metadata definitions.
4. Shared shells and shared UI must consume route contracts from shared routing modules rather than importing feature-local route helpers.
5. If one route family needs both registry data and page metadata, keep them in separate modules unless a single module is clearly simpler.

### Navigation Registry Boundary Rules

1. Routing modules own canonical path families, route union types, route metadata adapters, and render-target contracts.
2. Navigation modules may derive sidebar groups, topbar sections, shell presets, and quick links from routing contracts, but they must not redefine canonical path literals.
3. If a navigation registry needs route labels or descriptions, it should consume them from routing contracts or message adapters instead of introducing a second route map.
4. Shell-facing navigation shape may live outside `routing` when it is a derived projection for one shell family rather than the canonical route source.
5. When both `routing` and `navigation` modules exist for one surface, `routing` is authoritative and `navigation` is a consumer.

### Route Branching Rules

1. Route-based branching inside a feature is acceptable when it selects rendering, local interaction behavior, or feature-local view models.
2. Route-based branching inside a feature is not acceptable when it redefines path literals, metadata copy, endpoint mappings, or render-target ownership already defined elsewhere.
3. If route-based conditionals grow beyond one cohesive page family, move the truth into a shared registry or route adapter.

### Compatibility Wrapper Rules

1. Temporary compatibility wrappers may forward to a shared route contract during migration.
2. Compatibility wrappers must not become long-term truth sources once a shared route contract exists.
3. New consumers must depend on the shared contract directly, not on the temporary wrapper.
4. When a compatibility wrapper has no remaining migration value, remove it rather than preserving duplicate indirection.

## File Placement Rules

1. Place a module where its primary responsibility is owned.
2. Do not place shared logic in a feature folder if multiple unrelated features consume it.
3. Do not place feature-specific code in a shared component folder.
4. Keep filesystem structure aligned with architecture boundaries so ownership is visible from paths alone.

## Refactor Triggers

Refactor a module when any of the following become true:

1. the file mixes more than one architecture layer
2. the file becomes a routing switchboard for too many unrelated branches
3. multiple features depend on hidden internals from one feature folder
4. a shared shell starts owning page-specific behavior
5. a feature page becomes both its own controller and its own design system

## Extension Rules

1. New layers may be added only if they solve a repository-wide problem, not a one-off project preference.
2. Framework chapters may refine the layer mapping into concrete directories.
3. New architectural rules must reference this document rather than silently replacing it.
