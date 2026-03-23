# Frontend Component Intake Checklist

Version: 1.1
Last Updated: 2026-03-22
Owner: Frontend Architecture

Use this checklist before adding a new shared or reusable frontend component.

## Intake Questions

- [ ] An existing component cannot be extended cleanly to solve the same problem.
- [ ] The component category is explicit: primitive, shared composite, shell, feature component, headless behavior unit, or adapter wrapper.
- [ ] The owning layer and folder placement are explicit.
- [ ] The intended consumers are known.
- [ ] The component name communicates responsibility clearly.
- [ ] The public props contract is explicit and intentionally small.
- [ ] Controlled versus uncontrolled ownership has been decided.
- [ ] Required extension points are explicit and minimal.
- [ ] Accessibility states and keyboard behavior have been considered.
- [ ] If this component is a detail form surface, the drawer-by-default vs modal exception has been decided explicitly.
- [ ] If this component is a detail form surface, feature ownership of selected-record state, submit orchestration, and dirty-state policy is explicit.
- [ ] Styling will use SCSS and token-first rules, or a documented exception exists.
- [ ] Tests for the expected contract have been identified.
- [ ] Any migration impact on existing consumers is understood.

## Rejection Signals

Do not add the component yet if any of the following are true:

- [ ] The component only has one narrow consumer and is still highly page-specific.
- [ ] The proposed API is mostly booleans and escape hatches.
- [ ] The styling approach depends on unrelated global selectors.
- [ ] The component requires raw backend payloads to render.
- [ ] The team cannot explain where this component belongs in the architecture layers.
