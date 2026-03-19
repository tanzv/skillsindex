---
name: skillsindex-system-style-design
description: Use when implementing, refactoring, or restyling frontend UI in this repository while preserving the system-wide token architecture, component style contracts, accessibility behavior, and responsive interaction consistency.
metadata:
  short-description: SkillsIndex system-wide style design and governance guide
---

# SkillsIndex System Style Design

Use this skill for frontend style and design work across the full `frontend-next/` system, not only a single page family.

This skill is architecture-first: preserve style contracts, token pipelines, interaction behavior, and accessibility guarantees while changing visuals.

## Scope

- Frontend implementation area:
  - `frontend-next/app`
  - `frontend-next/src/components`
  - `frontend-next/src/features`
  - `frontend-next/src/lib`
- All route families and shells:
  - public
  - workspace
  - admin
  - account

## Architecture Baseline

Current style architecture is split into **global CSS variable layers**, **shared shell/components**, and **feature-level visual composition**:

- Global composition root:
  - `frontend-next/app/globals.css`
- Shared theme layers:
  - `frontend-next/app/public-marketplace-theme.css`
  - `frontend-next/app/protected-theme.css`
  - `frontend-next/app/protected-content-theme.css`
- Shared UI composition:
  - shared components under `frontend-next/src/components`
- Route-level ownership:
  - feature files under `frontend-next/src/features`
  - thin entry wrappers under `frontend-next/app`

## Non-Negotiable System Rules

- Do not bypass shared CSS variables with undocumented hardcoded leaf-level values.
- Keep accessibility behavior (`focus-visible`, keyboard flow, reduced-motion) intact.
- Preserve responsive behavior contracts across public and protected shells.
- Keep existing component class and prop contracts stable unless migration is explicitly included.
- Keep route-specific interaction models intact when changing only visual style.

## Read Order

Read only what you need, in this order:

1. `frontend-next/app/globals.css`
2. Shared theme layers in `frontend-next/app/*.css` that affect the target surface
3. Target feature/component files in `frontend-next/src/features` and `frontend-next/src/components`
4. Route/path helpers:
   - `frontend-next/app/layout.tsx`
   - `frontend-next/src/lib/routing/*.ts`
   - `frontend-next/src/components/shared/PublicShell.tsx`
   - `frontend-next/src/components/shared/AdminShell.tsx`
   - `frontend-next/src/components/shared/WorkspaceShell.tsx`

Then load detailed references from this skill:

- `references/style-system.md`
- `references/component-design.md`

## Decision Matrix

Before editing, classify the request:

1. Theme-layer change:
   - Update shared CSS variables first, then consume them in components.
2. Shared component style change:
   - Change shared component contracts first, then update feature consumers.
3. Route/feature visual change:
   - Keep route behavior and state flow stable; change only presentation layers.
4. Interaction state styling:
   - Keep hover/active/focus/disabled semantics explicit and accessible.
5. Responsive adjustment:
   - Extend existing shell/layout rules before adding unrelated breakpoints.

## Implementation Workflow

### 1. Resolve Style Ownership First

- Identify if change belongs to:
  - app-level CSS variable layers
  - shared shells/components
  - feature-local style composition

### 2. Apply Token-First Styling

- Prefer shared CSS variables (`--si-*`, `--ui-*`, `--marketplace-*`, `--protected-*`) before hardcoded values.
- Keep typography, spacing, and surface depth consistent with system rhythm.

### 3. Preserve Interaction And Accessibility Contracts

- Keep keyboard and focus behavior visible and usable.
- Keep `prefers-reduced-motion` handling for transitions/animations.
- Keep pointer and keyboard close/open flows unchanged for overlays and panels.

### 4. Preserve Route And Shell Consistency

- Keep prefix-aware public routing and protected navigation behavior intact.
- Keep feature ownership boundaries and existing state flow contracts.

### 5. Verify Before Completion

Run required checks:

```bash
cd frontend-next && npm run test:unit
cd frontend-next && npm run test:e2e
cd frontend-next && npm run build
cd /Users/tanzv/Development/Git/skillsindex && ./scripts/check_max_lines.sh
```

If Playwright verification fails, report:

- failed specs
- artifact paths under `frontend-next/test-results/`
- any supplemental screenshots captured under `frontend-next/tmp-screens/`

## Extension Points

- Add or extend shared CSS variables in `frontend-next/app/*.css`.
- Add reusable style primitives in shared component modules.
- Extend route-specific visual layers through feature modules.
- Add style references in this skill's `references/` to keep guidance current.

## Guardrails

- Do not break stable class or prop contracts without compatibility handling.
- Do not bypass shared CSS variable layers with undocumented hardcoding.
- Do not weaken reduced-motion and focus-visible support.
- Do not regress public/protected shell behavior across responsive breakpoints.
- Do not duplicate existing shared style composition logic.

## Completion Checklist

- Style ownership and variable path are clear.
- Interaction and accessibility contracts remain valid.
- Responsive and shell behavior remains stable.
- Changed scope has matching test/verification evidence.
- Unit/E2E/build/max-lines evidence collected.
