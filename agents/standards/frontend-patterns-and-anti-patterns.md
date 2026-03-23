# Frontend Patterns And Anti-Patterns Standard

Version: 1.2
Last Updated: 2026-03-22
Owner: Frontend Architecture

## Objective

Capture the preferred design patterns and the repository-wide anti-patterns that must be avoided to keep frontend systems maintainable and extensible.

## Preferred Patterns

1. **Thin Entry, Rich Feature**
   - route entry files stay small
   - features own meaningful composition
2. **Declarative Registry**
   - route, navigation, and feature metadata should converge into explicit registries rather than scattered conditionals
3. **Route Contract Adapter**
   - keep path registries, page metadata adapters, and render dispatch as separate but connected contracts
   - let features consume those contracts instead of redefining them
4. **Pure View-Model Builder**
   - shape data and derive presentation state in pure helpers before rendering
5. **Adapter Boundary**
   - isolate network, storage, session, and framework side effects behind explicit adapters
6. **Composition Over Inheritance**
   - compose shells, panels, and primitives instead of encoding every variation into one giant component
7. **Explicit Extension Points**
   - use slots, render points, or structured composition when consumers need controlled customization
8. **Co-Located Feature Units**
   - keep feature-local components, models, hooks, tests, and styles together when they change together
9. **In-Context Detail Form Surface**
   - keep list, board, or dashboard context visible while opening record details in a drawer by default
   - reserve modal presentation for confirmation-heavy or interruptive workflows only

## Extraction Rules

Extract a shared module only when:

1. multiple real consumers exist or are clearly imminent
2. the abstraction boundary is stable
3. the extracted contract is simpler than the duplicated callers

Do not extract for hypothetical reuse.

## Anti-Patterns

1. **Fat Page**
   - a route page that owns data loading, state coordination, rendering, and styling all at once
2. **God Shell**
   - a shared shell that accumulates page-specific actions, business rules, and exception logic
3. **Cross-Feature Reach-Through**
   - importing internals from another feature instead of promoting an explicit shared contract
4. **Duplicate Route Truth**
   - path definitions, navigation metadata, and render dispatch duplicated across unrelated files without synchronization
5. **Passive Wrapper Drift**
   - feature-local helpers that only forward to a shared route contract and then become accidental second entry points
6. **Boolean Variant Explosion**
   - components controlled by many booleans instead of clear variants or composition
7. **Style By Cascade**
   - relying on distant global selectors and DOM shape instead of local style contracts
8. **Unbounded Utility Dump**
   - generic helper files that collect unrelated logic with no ownership boundary
9. **Hidden Side Effects**
   - components or helpers performing network or storage work without an explicit boundary contract
10. **Route Detour For Local Detail Editing**
    - pushing users to a separate page for record details when the workflow should stay in-context on the current screen

## Route-Specific Guidance

1. A feature may branch on route when the branch only changes rendering, local copy arrangement, or local interaction flow inside one page family.
2. A feature should not branch on route to redefine shared path literals, endpoint strings, or navigation metadata that already belong in the routing layer.
3. If a route helper contains no real feature logic and only forwards to a shared resolver, remove it after migration rather than preserving a second truth source.

## Overlay Ownership Guidance

1. Route entries should not own detail overlay state unless the open state is intentionally encoded in the URL contract.
2. Feature modules should own selected-record state, dirty-form handling, and submit orchestration for detail drawers or modals.
3. Shared overlay primitives should own presentation, focus handling, and close affordances only.

## Design Review Questions

Use these questions when reviewing new frontend architecture:

1. Can a new engineer find the owner of this behavior from the path alone?
2. Can the UI contract be understood without reading internal implementation details?
3. If this feature grows by three more routes, will the current structure still hold?
4. If one consumer changes, will shared modules remain stable?
5. Does the styling approach preserve token ownership and local scope?

## Refactor Priorities

Prioritize refactors when anti-patterns appear in:

1. shared shells
2. route registries
3. global style layers
4. shared primitives
5. feature boundaries with repeated cross-import pressure
