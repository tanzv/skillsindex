# Frontend Component Standard

Version: 1.1
Last Updated: 2026-03-22
Owner: Frontend Architecture

## Objective

Define how frontend components are classified, designed, named, extended, and verified so they remain composable, testable, and stable over time.

## Component Taxonomy

Every component must belong to one of these categories:

1. **Primitive**
   - low-level reusable UI building block
   - minimal styling and behavior contract
2. **Shared Composite**
   - reusable composition of primitives
   - no feature-specific data assumptions
3. **Shell**
   - layout, navigation, and frame composition
   - stable contract for a route family or app family
4. **Feature Component**
   - feature-local composition and interaction logic
   - not intended for general reuse outside the owning feature
5. **Headless Behavior Unit**
   - hook or controller-like module with no required visual output
6. **Adapter Wrapper**
   - framework or platform integration boundary around a component contract

## Placement Rules

1. Primitives belong in shared UI locations.
2. Shared composites belong in shared component locations.
3. Shells belong in shared shell locations.
4. Feature components belong inside the owning feature boundary.
5. Headless behavior units belong next to the consumer feature unless they are reused across features.
6. Adapter wrappers belong near the platform or framework boundary they integrate with.

## Design Rules

1. Each component must have one clear responsibility.
2. A component API must describe what consumers control and what the component owns internally.
3. Prefer composition over large variant matrices when behavior diverges meaningfully.
4. Boolean prop explosion is a design smell. Replace it with explicit variants, slot composition, or separate components.
5. Prefer explicit data contracts over passing arbitrary raw backend payloads into shared UI.

## State Rules

1. Controlled components are preferred when external state ownership exists.
2. Uncontrolled behavior is acceptable only for isolated local interaction state.
3. Derived state should be computed, not duplicated.
4. Components must not hide network side effects unless they are explicit boundary components.

## Props Contract Rules

1. Public props must be intentionally small and documented by naming.
2. Do not forward unbounded dependency objects when a small explicit contract is sufficient.
3. Callbacks must represent meaningful events, not implementation details.
4. Shared component props must remain backward compatible unless an approved breaking change exists.

## Composition Rules

1. Use slots, children, or render hooks when the consumer needs structured extension.
2. Keep extension points explicit and minimal.
3. Do not expose styling escape hatches that bypass token contracts unless clearly justified.
4. Shared components must not assume a specific route, page copy, or feature workflow.

## Accessibility Rules

1. Components must preserve semantic HTML and keyboard operability.
2. Focus, disabled, loading, and error states must be visually and behaviorally distinct.
3. Components must not rely on color alone to communicate state.
4. Interactive components require accessible names and predictable focus behavior.

## Detail Form Surface Rules

1. In-context detail editing should default to a shared detail-form surface instead of a dedicated route.
2. The default detail-form surface is a drawer that preserves list or dashboard context while exposing a focused form.
3. A modal is allowed only when the workflow is intentionally blocking, short-lived, or confirmation-heavy.
4. Shared detail-form surfaces must stay business-agnostic and accept controlled open state, close callbacks, title, description, and footer actions through explicit props.
5. Feature modules own selected-record state, dirty-state policy, and submit side effects; the shared surface owns only overlay presentation behavior.
6. Detail-form surfaces must preserve keyboard close behavior, visible focus, title and description association, and explicit close affordances.
7. Shared detail-form surfaces must not hardcode page copy, form schema, or route-specific behavior.

## New Component Intake Rules

Before adding a new shared component:

1. confirm an existing component cannot be extended cleanly
2. assign the component taxonomy and ownership scope
3. define the intended consumers
4. define the styling strategy and token usage
5. define the test surface

If these cannot be stated clearly, the component should not be added yet.

## Testing Rules

1. Primitive and shared components require contract-level tests.
2. Feature components require tests around user-visible behavior and edge cases.
3. Headless behavior units require deterministic unit tests.
4. Shell changes require navigation, layout, and responsive verification appropriate to the risk.

## Refactor Triggers

Refactor a component when:

1. it starts mixing business logic with reusable presentation
2. multiple consumers require incompatible variants
3. it accumulates route-specific assumptions
4. the prop API becomes difficult to understand without internal knowledge
5. tests must mock too many hidden details to exercise the component
