# Style System Reference

This reference documents the active style-variable pipeline in `frontend-next/` and how to extend it safely.
The public marketplace and protected shell layers are the primary concrete examples.

## 1. Token Layers

### Global Composition Root

Source: `frontend-next/app/globals.css`

- imports shared public and protected CSS layers
- defines global HTML/body defaults
- composes the route-facing theme files into one application root

### Public Marketplace Tokens

Primary sources:

- `frontend-next/app/public-marketplace-theme.css`
- `frontend-next/app/public-marketplace-layout.css`
- `frontend-next/app/public-marketplace-home.css`

Pattern:

- shared shell tokens use `--si-*`
- marketplace surface tokens use `--marketplace-*`
- feature and component selectors consume those variables in public routes

### Protected Shell Tokens

Primary sources:

- `frontend-next/app/protected-theme.css`
- `frontend-next/app/protected-content-theme.css`
- `frontend-next/app/admin-shell.css`
- `frontend-next/app/workspace-shell.css`
- `frontend-next/app/account-shell.css`

Pattern:

- protected-shell variables use `--protected-*`
- shared UI variables use `--ui-*`
- route-family shell variables (`--admin-*`, `--workspace-*`, `--account-*`) derive from shared protected layers

Rule:

- new visual values should be introduced through shared variable mapping, not direct hardcoded values in leaf selectors.

## 2. Typography System

Primary sources:

- `frontend-next/app/globals.css`
- route-specific CSS files under `frontend-next/app/*.css`

Usage conventions:

- primary UI text uses the shared sans stack from `globals.css`
- technical labels and dense metadata may use mono styles only when the route already establishes that contract
- preserve title/body/meta contrast hierarchy across public and protected shells

## 3. Surface And Contrast Direction

### Public Marketplace

- dark and light marketplace routes share the same variable interface
- shell, card, chip, overlay, and search surfaces derive from `--marketplace-*`
- landing and results routes may layer additional surface rules, but should not bypass the base token set

### Protected Shells

- admin, workspace, and account routes derive from `--protected-*` and `--ui-*`
- page-local CSS may specialize spacing or emphasis, but should not redefine the shell contract ad hoc

## 4. Radius, Spacing, And Density

Common patterns:

- chips and pills keep fully rounded treatment where the shell already establishes it
- cards and panels preserve medium-to-large radii with restrained shadow depth
- spacing rhythm should stay compact and information-dense for management surfaces

Rule:

- preserve dense information layout while keeping distinct section separation.

## 5. Motion And Accessibility Contracts

Keep existing behavior:

- visible keyboard focus
- reduced-motion support where transitions are used
- explicit hover/active/disabled state separation
- overlay close affordances that remain keyboard reachable

Do not remove or weaken accessibility behavior when adjusting visuals.

## 6. Responsive Contract

Primary sources:

- `frontend-next/app/public-marketplace-layout.css`
- `frontend-next/app/workspace-shell.css`
- `frontend-next/app/admin-shell.css`
- `frontend-next/app/account-shell.css`

Expected outcomes:

- topbars wrap or compress without overlap
- search rows collapse cleanly when layout narrows
- protected shells preserve navigation hierarchy on smaller viewports
- compact controls remain operable without losing contrast

Prefer extending existing responsive rules over introducing unrelated breakpoint systems.

## 7. Overlay And Modal Rules

Primary sources:

- `frontend-next/app/public-marketplace-home-search-baseline.css`
- `frontend-next/app/public-skill-detail-resources-browser.css`
- `frontend-next/src/features/public/marketplace/MarketplaceSearchOverlay.tsx`

Important:

- overlay masks and panels should remain variable-driven
- close affordances must preserve keyboard and pointer semantics
- category and detail routes should only use overlay patterns that match their established interaction model
