# Component Design Reference

This reference captures the current component composition model for public marketplace pages.

## 1. Shared Public Shell Layer

Primary files:

- `frontend/src/pages/marketplacePublic/MarketplacePublicPageShell.tsx`
- `frontend/src/pages/marketplacePublic/MarketplacePublicPageStyles.tsx`
- `frontend/src/pages/marketplacePublic/MarketplacePublicShared.ts`

Responsibilities:

- unify stage/root class structure
- inject shared marketplace styles
- centralize reusable imports for public marketplace pages

Guideline:

- If a new public marketplace page follows existing shell semantics, use this layer first.

## 2. Topbar Composition

Primary files:

- `frontend/src/pages/PublicStandardTopbar.tsx`
- `frontend/src/pages/MarketplaceHomePage.lightTopbar.ts`

Behavior model:

- Brand area
- Primary action group
- Utility action group
- Locale/theme switch slot
- CTA and optional secondary CTA where applicable

Action model:

- `TopbarActionItem` with tone/state/badge/className options

## 3. Search Component Contract

Primary file:

- `frontend/src/components/MarketplaceGlobalSearchBar.tsx`

Use this component for:

- keyword query input
- optional semantic input
- submit action
- optional filter action

Keep action ordering explicit through helper-driven `actionOrder`.

## 4. Route-Scoped Page Ownership

### Home and Results

Primary file:

- `frontend/src/pages/MarketplaceHomePage.tsx`

Notes:

- owns `/` and `/results`
- can use floating overlay search path
- keeps top stats/recommendation/results composition

### Category Detail

Primary files:

- `frontend/src/pages/MarketplaceCategoryDetailPage.tsx`
- `frontend/src/pages/MarketplaceCategoryDetailFilters.tsx`

Notes:

- owns `/categories/:slug`
- is standalone and should not be delegated to `MarketplaceHomePage`
- uses in-page filters and result list flow
- must not depend on floating search overlay behavior

### Other Public Subpages

- categories list: `PublicCategoriesPage.tsx`
- rankings: `PublicRankingPage.tsx`
- skill detail: `PublicSkillDetailPage.tsx`

All should preserve public prefix-aware navigation and topbar consistency.

## 5. Query and Navigation Contracts

Primary files:

- `frontend/src/pages/publicPageNavigation.ts`
- `frontend/src/pages/MarketplacePublicQuery.ts`
- `frontend/src/lib/appPathnameResolver.ts`

Rules:

- preserve `/light`, `/mobile`, `/mobile/light` route families
- normalize and serialize query state deterministically
- keep legacy redirect behavior (`/docs` -> `/categories`, `/compare` -> `/rankings`)

## 6. Results and Card Composition

Primary files:

- `frontend/src/pages/MarketplaceHomeResultsContent.tsx`
- `frontend/src/pages/MarketplaceHomeSkillCard.tsx`

Contracts:

- grouped row rendering and virtualized window on large sets
- deterministic auto-load indicator states
- stable card structure (title button, chips, metadata)

## 7. Overlay Search Composition

Primary files:

- `frontend/src/pages/MarketplaceHomeSearchOverlay.tsx`
- `frontend/src/pages/MarketplaceResultsPage.tsx`

Contract:

- valid for home/results overlay flow only
- keeps escape close and backdrop close
- retains keyboard-focused interactions

Do not attach this flow to category detail page.

## 8. Regression Checkpoints

Primary checkpoints:

- unit: `MarketplaceHomePage.lightTopbar.test.ts`, `MarketplacePublicQuery.test.ts`
- e2e: `marketplace-home.spec.ts`, `public-categories-layout.spec.ts`, `public-route-prefix.spec.ts`
- visual: `frontend/scripts/visual-regression`
- alignment: `MarketplaceHomePage.pen-alignment.test.js`

Rule:

- when changing a behavior or contract, update matching tests in the same change set.
