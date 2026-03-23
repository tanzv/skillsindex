# Frontend Styling Standard

Version: 1.0
Last Updated: 2026-03-20
Owner: Frontend Architecture

## Objective

Define the default styling strategy for all frontends in the repository, with SCSS as the default authoring format and token-first styling as the baseline contract.

## Default Styling Rule

1. SCSS is the default authoring format for all new component, feature, and page-local styles.
2. CSS Modules with SCSS are the default for local component and feature styles.
3. Global styles are allowed only at approved foundation and shell entry points.

## Approved Non-SCSS Exceptions

Plain CSS may be used only for:

1. global reset files
2. theme or token composition roots already owned by a project standard
3. framework-mandated global stylesheets
4. generated or vendor-managed assets
5. temporary migration bridges explicitly documented as exceptions

## Style Layer Order

Style decisions must follow this order:

1. repository or product tokens
2. semantic aliases
3. shell and layout surfaces
4. component-local styles
5. route-local exceptions

Never skip directly to route-local values when a token or semantic alias should own the decision.

## File Placement Rules

1. Component-local styles must live next to the component.
2. Feature-local styles must live inside the owning feature boundary.
3. Shared visual foundations must live in explicit theme or foundation locations.
4. Do not place feature-local styles into a global stylesheet.

## Naming Rules

1. Local style modules must use `*.module.scss`.
2. Global SCSS files must use clear scope-oriented names.
3. In CSS Modules, prefer semantic local selectors such as `root`, `header`, `title`, `actions`, `isActive`.
4. In global styles, scope selectors under an explicit app, shell, or feature namespace.

## Token Rules

1. Colors, spacing, radius, typography, elevation, and motion must resolve through tokens or documented semantic aliases.
2. Hardcoded visual values are forbidden unless the owning standard documents the exception.
3. Repeated raw values must be promoted into tokens or semantic aliases.
4. Status styling must remain semantic and stable across pages.

## SCSS Authoring Rules

1. Use SCSS for nesting, local composition, and readable co-located structure.
2. Nesting depth should stay shallow and should not exceed three levels unless required by a controlled third-party integration.
3. Do not build global mixin libraries without clear cross-project demand.
4. Prefer readable selectors over clever selector chains.

## Forbidden Styling Patterns

1. unscoped global selectors for feature-local styling
2. styling through DOM depth assumptions when a local class contract should exist
3. inline style objects for static values
4. color, spacing, or typography magic numbers in component code
5. `!important` outside approved override boundaries

## Runtime Styling Rules

1. Inline styles are allowed only for runtime-computed values that are impractical to express through class toggles or CSS variables.
2. When runtime values are required, prefer CSS custom properties over many inline declarations.
3. A runtime style decision must still consume repository tokens where possible.

## Migration Rules

1. Existing non-SCSS files do not require immediate rewrite solely for compliance.
2. When materially modifying a legacy local stylesheet, prefer migrating it to SCSS unless the project standard documents a reason not to.
3. New files added during legacy refactors must follow this standard.

## Verification Rules

1. Styling changes must be verified in both intended theme and responsive states when applicable.
2. Shared styling changes must include regression evidence for affected consumers.
3. New style exceptions must update the owning standard in the same change set.
