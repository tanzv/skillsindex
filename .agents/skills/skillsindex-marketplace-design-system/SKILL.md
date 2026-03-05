---
name: skillsindex-marketplace-design-system
description: Use when implementing, refactoring, or restyling public marketplace pages in this repo while preserving the current architecture, tokenized style system, route-prefix behavior, and interaction contracts.
---

# SkillsIndex Marketplace Design System

Use this skill when touching public marketplace UX on routes such as `/`, `/results`, `/categories`, `/categories/:slug`, `/rankings`, and `/skills/:id`.

This skill is architecture-first: keep behavior aligned with the current public page system, not only visual similarity.

## Scope

- Public route families:
  - default: `/...`
  - light: `/light/...`
  - mobile: `/mobile/...`
  - mobile-light: `/mobile/light/...`
- Core implementation area:
  - `frontend/src/pages`
  - `frontend/src/components`
  - `frontend/src/lib`

## Architecture Snapshot

Current public marketplace architecture is split into **page-level ownership** and **shared building blocks**:

- Page-level ownership:
  - `MarketplaceHomePage.tsx` owns `/` and `/results`
  - `MarketplaceCategoryDetailPage.tsx` owns `/categories/:slug`
  - `PublicCategoriesPage.tsx`, `PublicRankingPage.tsx`, `PublicSkillDetailPage.tsx` own their routes
- Shared public building blocks:
  - `pages/marketplacePublic/MarketplacePublicPageShell.tsx`
  - `pages/marketplacePublic/MarketplacePublicPageStyles.tsx`
  - `pages/marketplacePublic/MarketplacePublicShared.ts`
  - `components/MarketplaceGlobalSearchBar.tsx`
  - `pages/PublicStandardTopbar.tsx`

### Non-Negotiable Route Ownership Rules

- `/categories/:slug` must stay a standalone page (`MarketplaceCategoryDetailPage`).
- Do not re-route `/categories/:slug` into `MarketplaceHomePage`.
- Category detail page must not use floating search overlay behavior.
- Floating overlay behavior is home/results context only.

## Read Order

Read only what you need, in this order:

1. `frontend/src/App.tsx`
2. `frontend/src/lib/appPathnameResolver.ts`
3. `frontend/src/pages/publicPageNavigation.ts`
4. `frontend/src/pages/marketplacePublic/MarketplacePublicPageShell.tsx`
5. `frontend/src/pages/marketplacePublic/MarketplacePublicShared.ts`
6. `frontend/src/pages/MarketplaceHomePage.tsx`
7. `frontend/src/pages/MarketplaceCategoryDetailPage.tsx`
8. `frontend/src/components/MarketplaceGlobalSearchBar.tsx`
9. `frontend/src/pages/PublicStandardTopbar.tsx`
10. `frontend/src/pages/MarketplaceHomePage.lightTopbar.ts`

Then load detailed references from this skill:

- `references/style-system.md`
- `references/component-design.md`

## Decision Matrix

Before editing, classify the request:

1. Route wiring change:
   - Update route mapping in `App.tsx` and keep prefix-aware behavior.
2. Public page layout/composition change:
   - Prefer `MarketplacePublicPageShell` + `PublicStandardTopbar` + existing result/filter components.
3. Search/filter interaction change:
   - Prefer `MarketplaceGlobalSearchBar` and query helpers in `MarketplacePublicQuery.ts`.
4. Visual/theme tuning:
   - Use token pipeline (`--si-*` -> `--marketplace-*`) before any hardcoded color/size.
5. Category detail behavior change:
   - Keep independent page behavior and no floating modal dependency.

## Implementation Workflow

### 1. Resolve Route Context First

- Detect normalized route via `normalizeAppRoute`.
- Preserve prefix family via `createPublicPageNavigator`.
- Keep legacy redirects:
  - `/docs` -> `/categories`
  - `/compare` -> `/rankings`

### 2. Keep Page Ownership Clear

- Use `MarketplaceHomePage` for `/` and `/results` only.
- Use `MarketplaceCategoryDetailPage` for `/categories/:slug`.
- Keep category-detail-specific filters in `MarketplaceCategoryDetailFilters.tsx`.

### 3. Reuse Shared Public Building Blocks

- Wrap pages with `MarketplacePublicPageShell` for stage/root class consistency.
- Use `MarketplacePublicShared` exports to avoid duplicate imports and divergent behavior.
- Use `MarketplaceGlobalSearchBar` for keyword/semantic/search action row.
- Use `PublicStandardTopbar` and light action builders for topbar IA consistency.

### 4. Respect Query and Interaction Contracts

- Normalize user-entered query text with `MarketplacePublicQuery` helpers.
- Keep query state in URL (deterministic and shareable).
- Home/results:
  - supports overlay search flow and quick filter interactions.
- Category detail:
  - direct in-page search/filter flow.
  - no overlay open/close path.

### 5. Apply Tokenized Styling

- Prefer `--si-color-*`, `--si-size-*` from `themeSystem.ts`.
- Map component tokens in marketplace style files.
- For category detail visuals, use category token variables (for example from `MarketplaceHomePage.styles.theme.categoryTokens.ts`) instead of ad-hoc values.

### 6. Verify Before Completion

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

- Add topbar primary/utility actions through light topbar builders.
- Extend shared public exports in `MarketplacePublicShared.ts` when introducing new common blocks.
- Extend query normalization helpers in `MarketplacePublicQuery.ts` for new URL fields.
- Expand category-detail filters via `MarketplaceCategoryDetailFilters.config.ts`.

## Guardrails

- Do not replace established `marketplace-*` CSS class contracts.
- Do not bypass token layers with ad-hoc global hardcoding unless there is a documented blocker.
- Do not break `prefers-reduced-motion` and `focus-visible` support.
- Do not regress mobile mode conventions (`.is-mobile`, responsive rules).
- Do not duplicate page shell logic that already exists in `marketplacePublic`.

## Completion Checklist

- Route ownership unchanged and explicit.
- Prefix-preserving navigation still works.
- Category detail remains standalone and overlay-free.
- Search/query behavior remains URL-driven and deterministic.
- Tokenized style path preserved.
- Unit/E2E/visual/build/max-lines evidence collected.
