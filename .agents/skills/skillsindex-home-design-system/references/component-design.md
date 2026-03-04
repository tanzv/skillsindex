# Component Design Reference

This reference documents the current component composition model for the public marketplace experience.

## 1. Page Shell and Navigation

### Standard Topbar

Source: `frontend/src/pages/PublicStandardTopbar.tsx`

Primary responsibilities:

- Brand anchor and identity lockup
- Primary navigation group
- Utility action group
- Locale/theme switch slot
- Optional status + CTA

Action style model comes from `TopbarActionItem`:

- `tone`: `default` | `subtle` | `highlight`
- `active`, `disabled`, `badge`, custom `className`

### Topbar Action Builders

Source: `frontend/src/pages/MarketplaceHomePage.lightTopbar.ts`

Reusable builders:

- `buildLightTopbarPrimaryActions`
- `buildLightTopbarUtilityActions`

Current public IA alignment:

- Categories route: `/categories`
- Ranking route: `/rankings`
- Global search utility: `/results`

## 2. Homepage Composition

Source: `frontend/src/pages/MarketplaceHomePage.tsx`

Primary composition sequence:

1. `PublicStandardTopbar`
2. Top stats and search strip
3. `MarketplaceHomeTopRecommendations`
4. Search main row + utility row
5. `MarketplaceHomeResultsContent`
6. Optional `MarketplaceResultsPage` floating overlay

Shared stylesheet injector:

- `MarketplaceHomePageStyles`

## 3. Search and Recommendation Components

### Recommendation Chips

Source: `frontend/src/pages/MarketplaceHomeTopRecommendations.tsx`

- Shows up to 3 recommendations
- Emits selected filter (`queryTags`) to parent

### Query Entry and Quick Filter

Source: `MarketplaceHomePage.tsx` and `MarketplaceHomePage.styles.search.utility.ts`

- Query input opens or submits into `/results`
- Quick filter button opens results context while preserving query state
- Utility pills provide mode/sort/view and queue shortcut affordances

## 4. Card and List Patterns

### Skill Card

Source: `frontend/src/pages/MarketplaceHomeSkillCard.tsx`

Structure:

- Head: circular cover + compact badge
- Title button
- Description paragraph
- Chip row (up to 2 chips)
- Metadata row (up to 3 segments)

### Results Content Block

Source: `frontend/src/pages/MarketplaceHomeResultsContent.tsx`

Contracts:

- Three-column desktop row grouping
- Virtualized row window for larger datasets
- Auto-load trigger near page bottom
- Explicit visual states for loading indicator

## 5. Floating Results Overlay

Source: `frontend/src/pages/MarketplaceResultsPage.tsx`

Behavior contracts:

- Modal focus trap
- Escape closes dialog
- Backdrop click closes dialog
- Search row updates query fields
- Quick filter chips sync with current tags
- Result cards provide direct open action

## 6. Categories and Ranking Subpages

Sources:

- `frontend/src/pages/PublicCategoriesPage.tsx`
- `frontend/src/pages/PublicRankingPage.tsx`

Shared pattern:

- Reuse standard topbar and navigation builders
- Keep homepage class language (`marketplace-home-stage`, `marketplace-home`, light/mobile modifiers)
- Use utility shell components from `prototypeCssInJs.tsx`
- Keep routing prefix awareness through `createPublicPageNavigator`

## 7. Route and Prefix Rules

Sources:

- `frontend/src/lib/appPathnameResolver.ts`
- `frontend/src/App.shared.tsx`

Requirements:

- Preserve mode prefixes (`/light`, `/mobile`, `/mobile/light`)
- Normalize public route matching for prefixed and unprefixed paths
- Apply legacy redirects:
  - `/docs` -> `/categories`
  - `/compare` -> `/rankings`

## 8. Test and Alignment Contracts

Primary regression checkpoints:

- `MarketplaceHomePage.pen-alignment.test.js`
- `MarketplaceHomePage.lightTopbar.test.ts`
- `public-route-prefix.spec.ts`
- `marketplace-home.spec.ts`
- visual regression under `frontend/scripts/visual-regression`

If component geometry or interaction contracts change, update matching tests in the same change set.
