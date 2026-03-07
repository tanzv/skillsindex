# Style System and Theme Integration Rules

Version: 1.0
Last Updated: 2026-03-06
Owner: Frontend Engineering

## Objective

Enforce a consistent style system across the project through a token-first theme architecture.
All frontend style work must integrate with the project theme system instead of introducing isolated styling logic.

## Mandatory Skill

For frontend style implementation/refactor/restyle tasks, use project skill:

- `skillsindex-system-style-design`

Apply it before editing style-related code.

## Source of Truth

1. Theme definitions: `frontend/src/theme/themeSystem.ts`
2. Global style layers: `frontend/src/styles/globalStyles*.ts`
3. Shared component styles: `frontend/src/components/**`
4. Route/page style composition: `frontend/src/pages/**`

## Unified Style System Rules

1. Token-first only: consume semantic/component tokens before introducing new raw values.
2. No hardcoded leaf-level colors/spacing/radius/typography in route or component style modules unless explicitly documented.
3. Keep class and component style contracts stable; include migration notes for breaking changes.
4. Keep dark/light/mobile parity for visual hierarchy and interaction semantics.
5. Keep accessibility style contracts intact:
   - `focus-visible` remains explicit.
   - reduced-motion behavior remains supported.
   - disabled/hover/active states remain distinguishable.
6. Keep state styling semantic and consistent:
   - status color meaning must stay stable across pages.
   - CTA emphasis must not be reused for non-action surfaces.

## Documented Prototype Exceptions

Some prototype-aligned pages intentionally keep fixed values for baseline fidelity.
These are the only approved exceptions for raw color usage in admin surfaces:

1. `frontend/src/pages/AdminOverviewPage.tsx`
2. `frontend/src/pages/AdminOverviewPage.styles.ts`

Exception governance:

1. Any new exception must be added to this section before code merge.
2. Exception scope must stay minimal and tied to a concrete prototype alignment test.
3. Non-exception admin and organization pages must remain token-first and are subject to style governance tests.

## Theme Integration Contract

When adding or changing UI styles:

1. Add or update tokens in `themeSystem.ts` first.
2. Map tokens through global styles (`globalStyles*.ts`) and expose stable CSS variables/contracts.
3. Consume mapped tokens in shared components before page-local overrides.
4. Apply page-local style only for route-specific composition, not for global semantics.
5. Add or update tests that validate token usage and mode parity for changed behavior.

## Layout Rhythm Contract

Navigation and content spacing must remain consistent across workspace/admin pages.

1. Shared layout shells own the default top offset below navigation; route-level modules must not add duplicate top gaps.
2. Page-specific grids that run inside workspace shells must normalize inherited `.page-grid` top margins where needed.
3. For organization/account workbench routes, `.page-grid.account-workbench` must keep `margin-top: 0` to avoid double offset.
4. Add regression assertions in e2e for sidebar-to-content top alignment whenever shell spacing is changed.

## Extension Rules

1. New token proposals must include name, semantic purpose, and consumer scope.
2. Any token additions affecting design language must update both:
   - `agents/standards/tokens.md`
   - `agents/standards/prototype-design-standards.md`
3. Do not duplicate existing token meaning with near-equivalent names.

## Verification Requirements

For style changes, run and report evidence:

- `cd frontend && npm run test:unit`
- `cd frontend && npm run test:e2e`
- `cd frontend && npm run test:visual`
- `cd frontend && npm run build`
- `./scripts/check_max_lines.sh`

If any command cannot run, explicitly record skipped scope, reason, and residual risk.
