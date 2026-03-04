---
name: skillsindex-marketplace-design-system
description: Use when implementing or restyling public marketplace pages in this repo to match the existing marketplace design language, including style direction, component composition, tokens, and verification for routes like /, /results, /categories, and /rankings.
---

# SkillsIndex Marketplace Design System

Use this skill for UI work that must stay visually and behaviorally aligned with the current public marketplace homepage and its related pages.

## Scope

- Public routes: `/`, `/results`, `/skills/:id`, `/categories`, `/rankings`
- Prefix families: `/light`, `/mobile`, `/mobile/light`
- Core implementation area: `frontend/src/pages`

## Read Order

1. `frontend/src/pages/MarketplaceHomePage.tsx`
2. `frontend/src/pages/MarketplaceHomePage.styles.tsx`
3. `frontend/src/theme/themeSystem.ts`
4. `frontend/src/pages/PublicStandardTopbar.tsx`
5. `frontend/src/pages/MarketplaceHomePage.lightTopbar.ts`
6. `frontend/src/lib/appPathnameResolver.ts`
7. `frontend/src/App.shared.tsx`

Then load detailed references from this skill:

- Style system: `references/style-system.md`
- Component design: `references/component-design.md`

## Implementation Workflow

### 1. Resolve Route Context First

- Detect normalized route through `normalizeAppRoute`.
- Preserve public prefix family when navigating.
- Respect legacy redirects:
  - `/docs` -> `/categories`
  - `/compare` -> `/rankings`

### 2. Compose Page with Existing Building Blocks

- Reuse `PublicStandardTopbar` for brand, nav groups, utility actions, and locale/theme controls.
- Reuse `buildLightTopbarPrimaryActions` and `buildLightTopbarUtilityActions`.
- Keep section order aligned with homepage baseline:
  - Topbar
  - Search/stat strip
  - Recommendation chips
  - Results content
  - Optional floating results overlay

### 3. Apply Tokenized Styling Instead of Hardcoded Rewrites

- Theme tokens come from `themeSystem.ts` (`--si-color-*`, `--si-size-*`).
- Component-level CSS variables are mapped in `MarketplaceHomePage.styles.dimensionTokens.ts`.
- Prefer existing `marketplace-*` class contracts and token wiring over new bespoke naming.

### 4. Keep Interaction Contracts Stable

- Search button submits and normalizes query to `/results`.
- Quick filter behavior must remain deterministic for URL state.
- Floating results modal must keep:
  - Escape-to-close
  - focus trap
  - masked backdrop close
- Auto-load indicator states: `idle`, `loading`, `completed`.

### 5. Verify Before Completion

Run the required checks:

```bash
cd frontend && npm run test:unit
cd frontend && npm run test:e2e
cd frontend && npm run test:visual
cd frontend && npm run build
cd /Users/tanzv/Development/Git/skillsindex && ./scripts/check_max_lines.sh
```

If visual diff fails, report mismatch ratio and artifact paths under `frontend/test-results/visual/`.

## Extension Points

- Add primary or utility topbar actions via `extraPrimaryActions` and `extraUtilityActions`.
- Extend quick filters through `buildHomeChipFilters`.
- Extend style scale by adding `--si-size-*` in `themeSystem.ts` and mapping it in `MarketplaceHomePage.styles.dimensionTokens.ts`.
- Add new public subpages by reusing topbar + utility shell patterns from categories/rankings pages.

## Guardrails

- Do not replace the established `marketplace-*` naming system.
- Do not bypass token layers with ad-hoc global values unless absolutely required.
- Keep reduced-motion and focus-visible behavior intact.
- Keep mobile behavior aligned with `.is-mobile` and responsive media rules.
