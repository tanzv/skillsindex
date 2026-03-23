# Style System and Theme Integration Rules

Version: 1.1
Last Updated: 2026-03-18
Owner: Frontend Engineering

## Objective

Enforce a consistent style system across the project through a token-first theme architecture.
All frontend style work must integrate with the active `frontend-next/` theme system instead of introducing isolated styling logic.

This standard specializes the repository-wide rules in `agents/standards/frontend-styling-standard.md` for the active `frontend-next/` implementation.

## Mandatory Skill

For frontend style implementation/refactor/restyle tasks, use project skill:

- `skillsindex-system-style-design`

Apply it before editing style-related code.

## Source of Truth

1. Global CSS composition root: `frontend-next/app/globals.css`
2. Public token and shell layers: `frontend-next/app/public-marketplace-theme.css`, `frontend-next/app/public-marketplace-layout.css`
3. Protected token and shell layers: `frontend-next/app/protected-theme.css`, `frontend-next/app/protected-content-theme.css`
4. Shared UI composition: `frontend-next/src/components/**`
5. Route-level feature composition: `frontend-next/src/features/**`
6. App Router entry wrappers: `frontend-next/app/**`

Approved local-style default for new work:

7. Component and feature-local styles: co-located `*.module.scss`

## Unified Style System Rules

1. Token-first only: consume shared CSS variables before introducing new raw values.
2. No hardcoded leaf-level colors, spacing, radius, or typography in route or component modules unless explicitly documented.
3. Keep component style contracts stable; include migration notes for breaking changes.
4. Keep dark/light/mobile parity for visual hierarchy and interaction semantics.
5. Keep accessibility style contracts intact:
   - `focus-visible` remains explicit.
   - reduced-motion behavior remains supported.
   - disabled, hover, and active states remain distinguishable.
6. Keep state styling semantic and consistent:
   - status color meaning must stay stable across pages.
   - CTA emphasis must not be reused for non-action surfaces.

## Documented Prototype Exceptions

Some prototype-aligned surfaces intentionally keep fixed values for baseline fidelity.
These are the only approved exceptions for raw color usage in admin surfaces:

1. `frontend-next/src/features/adminOverview/AdminOverviewPage.tsx`
2. `frontend-next/app/admin-overview.css`

Exception governance:

1. Any new exception must be added to this section before code merge.
2. Exception scope must stay minimal and tied to a concrete prototype alignment need.
3. Non-exception admin and organization pages must remain token-first and are subject to style governance tests.

## Theme Integration Contract

When adding or changing UI styles:

1. Add or update shared CSS variable layers in `frontend-next/app/*.css` first.
2. Keep `frontend-next/app/globals.css` as the import root for shared visual layers.
3. Consume mapped variables in shared shells/components before page-local overrides.
4. Apply feature-local style only for route-specific composition, not for global semantics.
5. Add or update tests that validate token usage, route parity, and mode parity for changed behavior.

## Layout Rhythm Contract

Navigation and content spacing must remain consistent across workspace/admin pages.

1. Shared shells own the default top offset below navigation; route-level modules must not add duplicate top gaps.
2. Feature-specific grids that run inside protected shells must normalize inherited top margins where needed.
3. Account, workspace, and admin routes must keep topbar-to-content alignment stable across layouts.
4. Add regression assertions in unit/e2e coverage whenever shell spacing is changed.

## Extension Rules

1. New token proposals must include name, semantic purpose, and consumer scope.
2. Any token additions affecting design language must update both:
   - `agents/standards/tokens.md`
   - `agents/standards/prototype-design-standards.md`
3. Do not duplicate existing token meaning with near-equivalent names.

## Verification Requirements

For style changes, run and report evidence:

- `cd frontend-next && npm run lint`
- `cd frontend-next && npm run test:unit`
- `cd frontend-next && npm run test:e2e`
- `cd frontend-next && npm run build`
- `./scripts/check_max_lines.sh`

If Playwright UI checks fail, explicitly record failed specs, artifact paths under `frontend-next/test-results/`, and residual risk.
