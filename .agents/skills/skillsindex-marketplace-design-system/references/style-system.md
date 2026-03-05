# Style System Reference

This reference documents the active public marketplace style system and how to extend it safely.

## 1. Token Layers

### Global Theme Tokens

Source: `frontend/src/theme/themeSystem.ts`

- Color tokens: `--si-color-*`
- Overlay and shadow tokens: `--si-color-overlay-mask`, `--si-shadow-overlay`
- Sizing tokens: `--si-size-*` (including marketplace dimensions)

Both dark and light mode values are defined in the shared theme token set.

### Marketplace Component Tokens

Primary sources:

- `frontend/src/pages/MarketplaceHomePage.styles.theme.ts`
- `frontend/src/pages/MarketplaceHomePage.styles.dimensionTokens.ts`
- `frontend/src/pages/MarketplaceHomePage.styles.theme.categoryTokens.ts`

Pattern:

- Global tokens (`--si-*`) feed page/component tokens (`--marketplace-*`).
- Component styles consume `--marketplace-*` tokens.

Rule:

- New visual values should be introduced through token mapping, not direct hardcoded values in leaf selectors.

## 2. Typography System

Source: `frontend/src/pages/MarketplaceHomePage.styles.theme.ts`

- Body/UI: `"Noto Sans SC", "Noto Sans", sans-serif`
- Metrics/labels/chips: `"JetBrains Mono", monospace`

Usage conventions:

- Mono font for compact labels, chips, counts, and diagnostics.
- Sans font for body text, titles, descriptions, and interaction-heavy copy.

## 3. Surface and Contrast Direction

### Dark Mode

- Canvas is near-black with subtle depth and low-alpha surfaces.
- Borders are soft and minimal.
- High-contrast action states should remain clear.

### Light Mode

- Canvas uses cool neutral backgrounds.
- Surface layers move toward white/light gray values.
- Active actions preserve strong contrast for readability.

## 4. Category Detail Theming Rules

Category detail surfaces must stay token-driven.

Use category-specific marketplace tokens for:

- heading overline text
- heading title text
- filter labels and chip states
- filter button states
- category search input surface

Do not hardcode category section colors directly in `MarketplaceHomePage.styles.search.utility.ts`.

## 5. Radius, Spacing, and Density

Common patterns:

- Pills/chips: `999px`
- Utility/action controls: `8px` to `11px`
- Card/surface blocks: `12px` to `16px`
- Spacing rhythm: mostly 8/10/12/14 px increments

Rule:

- Preserve dense information layout while keeping distinct section separation.

## 6. Motion and Accessibility Contracts

Keep existing behavior:

- section/page fade transitions
- loading indicators and subtle state transitions
- reduced-motion fallback (`@media (prefers-reduced-motion: reduce)`)
- visible keyboard focus (`:focus-visible`)

Do not remove or weaken accessibility behavior when adjusting visuals.

## 7. Responsive Contract

Source: `frontend/src/pages/MarketplaceHomePage.styles.responsive.ts`

Mobile behavior relies on class gates (`.is-mobile`, `.is-mobile-stage`) and existing media rules.

Expected outcomes:

- topbar wraps/reshapes without overlap
- search rows collapse into stacked layout
- result grids reduce column count
- compact controls remain operable

Prefer extending existing responsive rules over introducing unrelated breakpoints.

## 8. Overlay and Modal Rules

Source: `frontend/src/pages/MarketplaceHomePage.styles.resultsPage.ts`

- Overlay mask and panel should remain tokenized.
- Result overlay should keep keyboard and pointer-close affordances.
- Modal row layout adapts desktop/mobile while preserving function order.

Important:

- Category detail page should not rely on floating overlay UI.
