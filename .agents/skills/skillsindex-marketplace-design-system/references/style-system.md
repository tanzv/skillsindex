# Style System Reference

This reference captures the active visual system used by the current marketplace homepage stack.

## 1. Token Layers

### Global Theme Tokens

Source: `frontend/src/theme/themeSystem.ts`

- Color tokens: `--si-color-*`
- Overlay token: `--si-color-overlay-mask`
- Overlay shadow token: `--si-shadow-overlay`
- Marketplace sizing tokens: `--si-size-marketplace-*`

Dark and light modes are both fully defined in `standardThemeTokens`.

### Component Dimension Tokens

Source: `frontend/src/pages/MarketplaceHomePage.styles.dimensionTokens.ts`

Component-level variables mirror global size tokens, for example:

- `--marketplace-search-input-height`
- `--marketplace-results-row-height`
- `--marketplace-card-title-size`
- `--marketplace-results-stat-height`

Rule: if a size changes, update global token first, then mapping token.

## 2. Typography System

Source: `frontend/src/pages/MarketplaceHomePage.styles.theme.ts`

- Sans body/UI: `"Noto Sans SC", "Noto Sans", sans-serif`
- Monospace metric/label: `"JetBrains Mono", monospace`
- Optional import includes Inter, but primary usage is Noto Sans SC + JetBrains Mono.

Usage conventions:

- Data labels and chips use JetBrains Mono.
- Content, descriptions, and body copy use Noto Sans SC.

## 3. Color and Surface Direction

### Dark Baseline

- Canvas starts from near-black (`#101010` family).
- Topbar uses layered dark gradient.
- Cards use low-alpha, low-contrast gradients and borders.

### Light Baseline

- Canvas is cool neutral (`#eef1f5` family).
- Panels/cards move to white and light gray neutrals.
- Active nav and CTA keep strong black/white contrast for emphasis.

## 4. Radius, Spacing, and Density

Common radii:

- Chips and pills: `999px`
- Utility buttons: `8px`
- Card blocks: `12px` to `16px`

Spacing pattern:

- Global content gutter via `--marketplace-content-gutter`
- Vertical rhythm in 8/10/12/14 px increments
- Dense data UI but clear section separation

## 5. Motion and Accessibility Contracts

Animation keys:

- Page and section fade enter
- Auto-load ring/dot/arrow motion
- Results overlay enter

Required accessibility:

- `:focus-visible` ring on actionable controls
- `@media (prefers-reduced-motion: reduce)` disables heavy animation
- Strong keyboard behavior in results dialog

## 6. Responsive Rules

Source: `frontend/src/pages/MarketplaceHomePage.styles.responsive.ts`

Mobile mode uses `.is-mobile` and `.is-mobile-stage`:

- Topbar stacks vertically
- Search row collapses into one-column controls
- Results grid becomes one column
- Overlay modal search row becomes one column

Rule: preserve class-based responsive contract before adding new breakpoints.

## 7. Overlay and Modal Style Rules

Source: `frontend/src/pages/MarketplaceHomePage.styles.resultsPage.ts`

- Overlay uses tokenized mask (`--si-color-overlay-mask`)
- Modal canvas and panel use border + radius hierarchy
- Search row uses multi-column desktop and single-column mobile
- Footer and stat pills keep compact informational density

## 8. What Not to Change Lightly

- Token names and existing `marketplace-*` class contract
- Theme mode class gates (`.is-light-theme`, `.is-mobile`)
- Reduced-motion and focus-visible behavior
- Prefix-aware route styling behavior
