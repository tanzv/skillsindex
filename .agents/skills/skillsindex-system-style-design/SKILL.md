---
name: skillsindex-system-style-design
description: Use when implementing, refactoring, or restyling frontend UI in this repository while preserving the system-wide token architecture, component style contracts, accessibility behavior, and responsive interaction consistency.
metadata:
  short-description: SkillsIndex system-wide style design and governance guide
---

# SkillsIndex System Style Design

Use this skill for frontend style and design work across the full system, not only a single page family.

This skill is architecture-first: preserve style contracts, token pipelines, interaction behavior, and accessibility guarantees while changing visuals.

## Scope

- Frontend implementation area:
  - `frontend/src/pages`
  - `frontend/src/components`
  - `frontend/src/styles`
  - `frontend/src/theme`
  - `frontend/src/lib`
- All route families and mode prefixes:
  - default
  - light
  - mobile
  - mobile-light

## Architecture Baseline

Current style architecture is split into **global token layers**, **shared design primitives**, and **route-level visual composition**:

- Global tokens:
  - `frontend/src/theme/themeSystem.ts`
  - `frontend/src/styles/globalStyles*.ts`
- Shared UI composition:
  - shared components under `frontend/src/components`
  - shared page shells and style modules under `frontend/src/pages`
- Route-level ownership:
  - page files keep route-specific layout and interaction composition

## Non-Negotiable System Rules

- Do not bypass token layers with hardcoded leaf-level values unless explicitly documented.
- Keep accessibility behavior (`focus-visible`, keyboard flow, reduced-motion) intact.
- Preserve responsive behavior contracts for desktop and mobile modes.
- Keep existing component class contracts stable unless migration is explicitly included.
- Keep route-specific interaction models intact when changing only visual style.

## Read Order

Read only what you need, in this order:

1. `frontend/src/theme/themeSystem.ts`
2. `frontend/src/styles/globalStyles*.ts`
3. Target page/component files in `frontend/src/pages` and `frontend/src/components`
4. Route/path helpers:
   - `frontend/src/App.tsx`
   - `frontend/src/lib/appPathnameResolver.ts`
   - `frontend/src/pages/publicPageNavigation.ts`

Then load detailed references from this skill:

- `references/style-system.md`
- `references/component-design.md`

## Decision Matrix

Before editing, classify the request:

1. Token/theme change:
   - Update token mapping first, then consume tokens in components.
2. Shared component style change:
   - Change shared component contracts first, then update page consumers.
3. Route/page visual change:
   - Keep route behavior and state flow stable; change only presentation layers.
4. Interaction state styling:
   - Keep hover/active/focus/disabled semantics explicit and accessible.
5. Responsive adjustment:
   - Extend existing responsive gates and mode classes before adding new rules.

## Implementation Workflow

### 1. Resolve Style Ownership First

- Identify if change belongs to:
  - global tokens
  - shared components
  - page-local style modules

### 2. Apply Token-First Styling

- Prefer `--si-*` and mapped component tokens before hardcoded values.
- Keep typography, spacing, and surface depth consistent with system rhythm.

### 3. Preserve Interaction and Accessibility Contracts

- Keep keyboard and focus behavior visible and usable.
- Keep `prefers-reduced-motion` handling for transitions/animations.
- Keep pointer and keyboard close/open flows unchanged for overlays/panels.

### 4. Preserve Route and Mode Consistency

- Keep prefix-aware navigation and route-family behavior.
- Keep page ownership boundaries and existing state flow contracts.

### 5. Verify Before Completion

Run required checks:

```bash
cd frontend && npm run test:unit
cd frontend && npm run test:e2e
cd frontend && npm run test:visual
cd frontend && npm run build
cd /Users/tanzv/Development/Git/skillsindex && ./scripts/check_max_lines.sh
```

If visual regression fails, report:

- mismatch ratio
- threshold
- artifact paths under `frontend/test-results/visual/`

## Extension Points

- Add or extend global tokens through `themeSystem.ts`.
- Add reusable style primitives in shared component modules.
- Extend route-specific style layers through page-level style modules.
- Add style references in this skill's `references/` to keep guidance current.

## Guardrails

- Do not break stable class contracts without compatibility handling.
- Do not bypass token layers with undocumented hardcoding.
- Do not weaken reduced-motion and focus-visible support.
- Do not regress mobile and light/dark mode behavior.
- Do not duplicate existing shared style composition logic.

## Completion Checklist

- Style ownership and token path are clear.
- Interaction and accessibility contracts remain valid.
- Responsive and mode behavior remains stable.
- Changed scope has matching test/verification evidence.
- Unit/E2E/visual/build/max-lines evidence collected.
