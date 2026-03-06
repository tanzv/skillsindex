# SkillsIndex Prototype Tokens

Version: 1.0
Last Updated: 2026-02-27
Source: `agents/standards/prototype-design-standards.md`

## 1. Usage

This file defines visual tokens for prototype consistency across user and admin pages.
Use these tokens before introducing any new raw color or spacing value.

## 2. Color Tokens

### 2.1 Dark Theme

| Token | Value | Usage |
|---|---:|---|
| `--bg-dark-app` | `#0B1326` | Main app background |
| `--bg-dark-header` | `#12213F` | Top header background |
| `--bg-dark-card` | `#1B2E57` | Primary card background |
| `--bg-dark-panel-muted` | `#1F3B62` | Right context panel, low-noise action panel |
| `--text-dark-primary` | `#EAF2FF` | Primary text on dark surfaces |
| `--text-dark-secondary` | `#BFD8FF` | Secondary text on dark surfaces |
| `--text-dark-tertiary` | `#93B4E8` | Auxiliary metadata |

### 2.2 Light Theme

| Token | Value | Usage |
|---|---:|---|
| `--bg-light-app` | `#F8FAFC` | Main app background |
| `--bg-light-header` | `#E2EAF6` | Top header and hero soft background |
| `--bg-light-card` | `#FFFFFF` | Primary card background |
| `--bg-light-card-alt` | `#F8FAFC` | Secondary card background |
| `--bg-light-card-soft` | `#EAF0FA` | Tertiary card background |
| `--text-light-primary` | `#0F172A` | Main text |
| `--text-light-secondary` | `#475569` | Secondary text |
| `--text-light-tertiary` | `#1D4ED8` | Route hint / meta accent |

### 2.3 Semantic Colors

| Token | Value | Usage |
|---|---:|---|
| `--semantic-success-strong` | `#15803D` | Confirmed success state |
| `--semantic-success-base` | `#16A34A` | Success tag/button |
| `--semantic-warning-strong` | `#B45309` | Warning state |
| `--semantic-warning-base` | `#D97706` | Warning tag/button |
| `--semantic-error-strong` | `#B91C1C` | Error state |
| `--semantic-error-base` | `#DC2626` | Error tag/button |
| `--accent-action-strong` | `#1D4ED8` | Primary CTA |
| `--accent-action-base` | `#2563EB` | Selected state / secondary CTA |

### 2.4 Semantic Surfaces

| Token | Value | Usage |
|---|---:|---|
| `--surface-success-soft` | `#D1FAE5` | Success chip/container background |
| `--surface-warning-soft` | `#FFF3D7` | Warning chip/container background |
| `--surface-error-soft` | `#FEE2E2` | Error chip/container background |
| `--surface-info-soft` | `#DBEAFE` | Informational chip/container background |

## 3. Typography Tokens

### 3.1 Font Family

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | `"Noto Sans SC", sans-serif` | Primary UI text |
| `--font-mono` | `"JetBrains Mono", monospace` | IDs, logs, metrics |

### 3.2 Type Scale

| Token | Value | Usage |
|---|---:|---|
| `--text-screen-title` | `31px / 700` | Page title |
| `--text-card-title` | `14px / 700` | Card title |
| `--text-body-md` | `13px / 600` | Main body text |
| `--text-body-sm` | `12px / 600` | Secondary body text |
| `--text-meta` | `11px / 500` | Metadata/log preview |
| `--text-code` | `10px / 500` | Dense log/code lines |

## 4. Spacing Tokens

| Token | Value | Usage |
|---|---:|---|
| `--space-2` | `2` | Tiny icon/text offset |
| `--space-4` | `4` | Tight inner spacing |
| `--space-6` | `6` | Pill internal spacing |
| `--space-8` | `8` | Compact component gap |
| `--space-10` | `10` | Mid compact gap |
| `--space-12` | `12` | Screen vertical rhythm |
| `--space-14` | `14` | Card item spacing |
| `--space-16` | `16` | Card padding / column gap |
| `--space-18` | `18` | Header inner spacing |
| `--space-22` | `22` | Top bar left/right padding |
| `--space-24` | `24` | Section padding |
| `--space-32` | `32` | Wide container padding |

## 5. Radius Tokens

| Token | Value | Usage |
|---|---:|---|
| `--radius-8` | `8` | Pills / compact controls |
| `--radius-10` | `10` | Inner info blocks |
| `--radius-12` | `12` | Small cards / chips |
| `--radius-16` | `16` | Standard cards |
| `--radius-18` | `18` | Feature cards |
| `--radius-24` | `24` | Large visual containers |

## 6. Layout Tokens

| Token | Value | Usage |
|---|---:|---|
| `--canvas-desktop-width` | `1440` | Desktop frame width |
| `--content-max-width` | `1360` | Inner content width |
| `--layout-col-main` | `932` | Main work column |
| `--layout-col-context` | `412` | Context column |
| `--layout-col-gap` | `16` | Column gap |
| `--layout-top-height` | `86` | Standard page header height |
| `--layout-main-height` | `850` | Main panel target height |

## 7. Component Mapping

| Component | Required Tokens |
|---|---|
| Page root (dark) | `--bg-dark-app`, `--space-12` |
| Page root (light) | `--bg-light-app`, `--space-12` |
| Header bar (dark) | `--bg-dark-header`, `--layout-top-height` |
| Header bar (light) | `--bg-light-header`, `--layout-top-height` |
| Main card (dark) | `--bg-dark-card`, `--radius-16`, `--space-14` |
| Main card (light) | `--bg-light-card`, `--radius-16`, `--space-14` |
| Context panel | `--bg-dark-panel-muted` or `--bg-light-card-soft`, `--radius-16` |

## 8. Guardrails

1. Do not introduce unregistered high-saturation background colors for large areas.
2. Use `--accent-action-*` only for CTA and active controls.
3. Use semantic colors only for semantic meaning.
4. Keep dark/light hierarchy equivalent when switching themes.
5. If a new token is required, update this file and `agents/standards/prototype-design-standards.md` in the same change.

