# Component Design Reference

This reference captures the active system-level component composition model in `frontend-next/`.
The public marketplace route family is documented as the concrete baseline implementation.

## 1. Shared Public Shell Layer

Primary files:

- `frontend-next/app/(public)/layout.tsx`
- `frontend-next/src/components/shared/PublicShell.tsx`
- `frontend-next/src/components/shared/PublicTopbar.tsx`
- `frontend-next/src/components/shared/PublicShellSlots.tsx`

Responsibilities:

- unify root shell structure for public routes
- inject shared marketplace shell behavior and route-aware state
- centralize reusable topbar slot composition for public pages

Guideline:

- If a new public marketplace page follows existing shell semantics, extend this layer first.

## 2. Topbar Composition

Primary files:

- `frontend-next/src/features/public/marketplace/MarketplaceHomeTopbar.tsx`
- `frontend-next/src/features/public/marketplace/marketplaceTopbarSlots.tsx`
- `frontend-next/src/features/public/marketplace/useMarketplaceTopbarSlots.tsx`

Behavior model:

- brand area
- primary navigation group
- status strip / route-context slots
- utility action group
- locale/theme switch controls where applicable

## 3. Search Component Contract

Primary files:

- `frontend-next/src/features/public/marketplace/MarketplaceSearchForm.tsx`
- `frontend-next/src/features/public/marketplace/MarketplaceSearchPanel.tsx`
- `frontend-next/src/features/public/marketplace/MarketplaceSearchOverlay.tsx`

Use this composition for:

- keyword query input
- optional semantic input
- submit action
- recent-search recovery
- overlay-based query refinement

Keep form behavior explicit through props rather than route-specific hidden assumptions.

## 4. Route-Scoped Page Ownership

### Landing And Results

Primary files:

- `frontend-next/src/features/public/PublicLanding.tsx`
- `frontend-next/src/features/public/PublicSearchPage.tsx`
- `frontend-next/src/features/public/marketplace/MarketplaceResultsStage.tsx`

Notes:

- own the landing, results, and discovery composition
- can use overlay search and stacked marketplace sections
- keep shell-level navigation and recommendation surfaces aligned

### Category Detail

Primary files:

- `frontend-next/src/features/public/PublicCategoryPage.tsx`
- `frontend-next/src/features/public/PublicCategoryDetailPage.tsx`
- `frontend-next/src/features/public/marketplace/categoryDetailModel.ts`

Notes:

- own category listing and category detail workflows
- keep in-page filtering distinct from landing-page overlay behavior
- must preserve deterministic query serialization

### Skill Detail

Primary files:

- `frontend-next/src/features/public/PublicSkillDetailPage.tsx`
- `frontend-next/src/features/public/skill-detail/SkillDetailHeader.tsx`
- `frontend-next/src/features/public/skill-detail/SkillDetailWorkbench.tsx`
- `frontend-next/src/features/public/skill-detail/SkillDetailSidebar.tsx`

Notes:

- own the skill-detail workbench layout and supplementary panels
- preserve resource tree, install prompts, and contextual evidence flow

## 5. Query And Navigation Contracts

Primary files:

- `frontend-next/src/lib/routing/publicCompat.ts`
- `frontend-next/src/lib/routing/PublicRoutePathProvider.tsx`
- `frontend-next/src/lib/routing/useResolvedPublicPathname.ts`
- `frontend-next/src/features/public/marketplace/searchHistory.ts`

Rules:

- preserve public route-prefix normalization and deterministic query serialization
- keep redirect behavior and route aliases documented in routing helpers
- keep shell-level pathname resolution independent from page-local rendering

## 6. Results And Card Composition

Primary files:

- `frontend-next/src/features/public/marketplace/MarketplaceResultsStage.tsx`
- `frontend-next/src/features/public/marketplace/MarketplaceSkillCard.tsx`
- `frontend-next/src/features/public/marketplace/MarketplaceCategorySkillCard.tsx`
- `frontend-next/src/features/public/marketplace/MarketplaceHomeDeckCard.tsx`

Contracts:

- stable card information hierarchy
- deterministic results-stage column layout
- reusable discovery cards across landing, results, and category flows

## 7. Regression Checkpoints

Primary checkpoints:

- unit: `frontend-next/tests/unit/marketplace-home-topbar.test.ts`, `frontend-next/tests/unit/marketplace-search-panel.test.ts`, `frontend-next/tests/unit/public-compat.test.ts`
- e2e: `frontend-next/tests/e2e/public-routes.spec.ts`, `frontend-next/tests/e2e/public-topbar-navigation.spec.ts`, `frontend-next/tests/e2e/public-shell-background.spec.ts`

Rule:

- when changing a behavior or contract, update matching tests in the same change set.
