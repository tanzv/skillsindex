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

### 2.5 Marketplace Category Surface Aliases

| Token | Value | Usage |
|---|---|---|
| `--marketplace-category-metric-border` | Derived from `--marketplace-card-border-soft` | Category KPI card border |
| `--marketplace-category-metric-background` | Derived from marketplace section surfaces | Category KPI card background |
| `--marketplace-category-card-border` | Derived from `--marketplace-card-border-soft` | Shared border for category action, showcase, and skill cards |
| `--marketplace-category-card-background` | Derived from marketplace section surfaces | Default surface for category showcase and skill cards |
| `--marketplace-category-card-accent-background` | Derived from marketplace section surfaces | Slightly stronger action card surface |
| `--marketplace-category-card-hover-background` | Derived from marketplace section surfaces | Hover surface for category skill cards |
| `--marketplace-category-browse-card-border` | Derived from `--marketplace-card-border-soft` | Category browse card border |
| `--marketplace-category-browse-card-background` | Derived from marketplace section surfaces | Category browse card background |
| `--marketplace-category-featured-card-border` | Derived from `--marketplace-card-border-soft` | Featured recommendation card border inside category browse cards |
| `--marketplace-category-featured-card-background` | Derived from marketplace section surfaces | Featured recommendation card background |
| `--marketplace-category-collection-card-border` | Derived from `--marketplace-card-border-soft` | Collection deck card border |
| `--marketplace-category-collection-card-background` | Theme-aware marketplace collection surface | Collection deck card background with dark/light parity |
| `--marketplace-category-collection-link-background` | Derived from marketplace section surfaces | Embedded collection link surface |
| `--marketplace-category-skill-card-avatar-border` | Derived from `--marketplace-card-border-soft` | Category skill avatar border |
| `--marketplace-category-skill-card-avatar-background` | Derived from marketplace section surfaces | Category skill avatar background |
| `--marketplace-category-nav-item-background` | Derived from `--marketplace-chip-background` | Category side navigation idle background |
| `--marketplace-category-nav-count-active-border` | Currentcolor semantic mix | Active category nav count border |
| `--marketplace-category-nav-count-active-background` | Currentcolor semantic mix | Active category nav count background |
| `--marketplace-topbar-button-primary-soft-background` | Derived from `--marketplace-topbar-button-primary-background` | Soft primary emphasis for topbar icon buttons |
| `--marketplace-section-topbar-shell-border` | Derived from `--marketplace-card-border-soft` | Shared section-route topbar shell border |
| `--marketplace-section-topbar-shell-background` | Derived from marketplace section surfaces | Shared section-route topbar shell background |
| `--marketplace-section-topbar-button-border` | Derived from `--marketplace-card-border-soft` | Shared section-route topbar button border |
| `--marketplace-section-topbar-button-background` | Derived from topbar and section surfaces | Shared section-route topbar button background |
| `--marketplace-section-topbar-button-subtle-background` | Derived from marketplace section surfaces | Shared subtle button state for section topbars |
| `--marketplace-section-topbar-button-hover-border` | Derived from `--marketplace-card-border` | Shared hover border for section topbar buttons |
| `--marketplace-section-topbar-button-hover-background` | Uses `--marketplace-section-emphasis-background` | Shared hover background for section topbar buttons |
| `--marketplace-section-topbar-nav-active-border` | Derived from active nav and card border tokens | Active nav border for section topbars |
| `--marketplace-section-topbar-primary-border` | Derived from primary button and card border tokens | Primary CTA border for section topbars |

### 2.6 Skill Detail Shell Surface Aliases

| Token | Value | Usage |
|---|---|---|
| `--skill-detail-topbar-shell-background` | Derived from `--marketplace-nav-shell-background` | Shared nav/switch shell background in skill detail topbar |
| `--skill-detail-breadcrumb-border` | Derived from marketplace card border tokens | Skill detail breadcrumb border |
| `--skill-detail-breadcrumb-background` | Derived from marketplace section surfaces | Skill detail breadcrumb link background |
| `--skill-detail-breadcrumb-hover-background` | Derived from topbar hover surfaces | Skill detail breadcrumb hover background |
| `--skill-detail-breadcrumb-current-background` | Derived from primary action surfaces | Skill detail current breadcrumb background |
| `--skill-detail-breadcrumb-current-text` | Derived from skill detail text hierarchy | Skill detail current breadcrumb text |
| `--skill-detail-breadcrumb-current-soft-border` | Derived from primary action and card border tokens | Skill detail soft current breadcrumb border |
| `--skill-detail-summary-pill-background` | Derived from marketplace section surfaces | Skill detail summary pill background |
| `--skill-detail-feedback-background` | Derived from topbar hover surfaces | Feedback banner background in skill detail sidebar |
| `--skill-detail-prompt-shell-background` | Derived from marketplace section surfaces | Generic prompt shell background in skill detail sidebar |
| `--skill-detail-directory-shell-background` | Derived from marketplace section surfaces | Directory shell background in skill detail side panels |
| `--skill-detail-directory-row-hover-background` | Derived from topbar hover surfaces | Directory row hover state |
| `--skill-detail-directory-row-selected-background` | Derived from primary action surfaces | Directory row selected state |
| `--skill-detail-directory-icon-directory-background` | Derived from primary action surfaces | Directory icon fill |
| `--skill-detail-directory-icon-file-border` | Derived from marketplace card border tokens | File icon border in skill detail directory |
| `--skill-detail-directory-icon-file-background` | Derived from marketplace section surfaces | File icon background in skill detail directory |
| `--skill-detail-top-summary-card-background` | Derived from marketplace section surfaces | Top summary card background in skill detail header |
| `--skill-detail-context-summary-chip-background` | Derived from marketplace section surfaces | Context summary chip background in skill detail |
| `--skill-detail-panel-background` | Alias of skill detail shared panel surface | Generic content/preview/comment panel background in skill detail |
| `--skill-detail-overview-section-background` | Derived from marketplace section surfaces | Shared overview section surface |
| `--skill-detail-install-row-background` | Derived from marketplace section surfaces | Installation row surface in skill detail panels |
| `--skill-detail-overview-inline-fact-background` | Derived from marketplace section surfaces | Overview inline fact card background |
| `--skill-detail-overview-score-main-background` | Derived from marketplace section surfaces | Overview score summary card background |
| `--skill-detail-resource-install-card-border` | Theme-aware resource install card border | Resource-mode install sidebar card border |
| `--skill-detail-resource-install-card-background` | Theme-aware resource install card background | Resource-mode install sidebar card background |
| `--skill-detail-resource-prompt-shell-border` | Theme-aware prompt shell border | Resource-mode prompt shell border in skill detail sidebar |
| `--skill-detail-resource-prompt-shell-background` | Theme-aware prompt shell surface | Resource-mode prompt shell background |
| `--skill-detail-resource-prompt-head-border` | Theme-aware prompt head divider | Resource-mode prompt header divider |
| `--skill-detail-resource-prompt-head-text` | Theme-aware prompt header text | Resource-mode prompt header text |
| `--skill-detail-resource-prompt-body-text` | Theme-aware prompt body text | Resource-mode prompt body text |
| `--skill-detail-resource-secondary-action-primary-shadow` | Theme-aware emphasized action shadow | Resource-mode primary-tone secondary action shadow |
| `--skill-detail-resource-secondary-action-border` | Theme-aware resource action border | Resource-mode secondary action border |
| `--skill-detail-resource-secondary-action-background` | Theme-aware resource action surface | Resource-mode secondary action background |
| `--skill-detail-resource-secondary-action-text` | Theme-aware resource action text color | Resource-mode secondary action text color |
| `--skill-detail-resource-secondary-action-hover-background` | Theme-aware resource action hover surface | Resource-mode secondary action hover background |
| `--skill-detail-resource-secondary-action-hover-border` | Theme-aware resource action hover border | Resource-mode secondary action hover border |
| `--skill-detail-source-analysis-link-hover` | Theme-aware resource link hover color | Hover color for source analysis deep links |
| `--skill-detail-source-analysis-pill-border` | Theme-aware analysis pill border | Source analysis pill border |
| `--skill-detail-source-analysis-pill-background` | Theme-aware analysis pill background | Source analysis pill background |
| `--skill-detail-resource-table-head-border` | Theme-aware resource table head divider | Resource browser header divider |
| `--skill-detail-resource-table-row-border` | Theme-aware resource table row divider | Resource browser row divider |
| `--skill-detail-resource-table-row-hover-background` | Theme-aware resource table row hover surface | Resource browser row hover background |
| `--skill-detail-resource-table-row-selected-background` | Theme-aware resource table row selected surface | Resource browser row selected background |
| `--skill-detail-resource-table-row-selected-shadow` | Theme-aware resource table row selected emphasis | Resource browser row selected inset emphasis |
| `--skill-detail-resource-table-file-icon-border` | Theme-aware resource file icon border | Resource browser file icon border |
| `--skill-detail-loading-shell-background` | Theme-aware loading shell gradient | Skeleton shell background for skill detail loading states |
| `--skill-detail-loading-panel-background` | Theme-aware loading panel surface | Skeleton child panel background in skill detail loading states |
| `--skill-detail-loading-placeholder-background` | Theme-aware placeholder surface | Skeleton line/dot base background |
| `--skill-detail-loading-shimmer-background` | Theme-aware shimmer overlay | Skeleton shimmer overlay for skill detail loading states |

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

## 7. Motion Tokens

| Token | Value | Usage |
|---|---:|---|
| `--motion-duration-fast` | `160ms` | Hover, active, compact control feedback |
| `--motion-duration-medium` | `220ms` | Drawer/modal transitions, emphasized state changes |
| `--motion-duration-slow` | `420ms` | Large surface reveals when a longer settle is needed |
| `--motion-duration-enter` | `720ms` | Staged hero or auth entrance choreography |
| `--motion-duration-ambient` | `10000ms` | Slow ambient orbit or pulse loops |
| `--motion-duration-ambient-slow` | `16000ms` | Very slow decorative floating motion |
| `--motion-duration-loading-loop` | `1200ms` | Repeating loading pulse or directional hint |
| `--motion-duration-loading-spin` | `2200ms` | Slow spinner or orbit loop |
| `--motion-delay-none` | `0ms` | Explicit no-delay baseline for motion overrides |
| `--motion-delay-xs` | `120ms` | Early panel or compact choreographed entry delay |
| `--motion-delay-sm` | `140ms` | Short stagger for loading dots or compact repeated elements |
| `--motion-delay-md` | `160ms` | Standard staged reveal start offset |
| `--motion-delay-lg` | `180ms` | Form or card follow-up reveal offset |
| `--motion-delay-xl` | `260ms` | Later staged reveal for repeated feedback patterns |
| `--motion-delay-stagger-step` | `80ms` | Reusable increment for staggered sequences |
| `--motion-ease-standard` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default UI deceleration |
| `--motion-ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrance and stronger directional movement |
| `--motion-ease-linear` | `linear` | Continuous loops only |

## 8. Component Mapping

| Component | Required Tokens |
|---|---|
| Page root (dark) | `--bg-dark-app`, `--space-12` |
| Page root (light) | `--bg-light-app`, `--space-12` |
| Header bar (dark) | `--bg-dark-header`, `--layout-top-height` |
| Header bar (light) | `--bg-light-header`, `--layout-top-height` |
| Main card (dark) | `--bg-dark-card`, `--radius-16`, `--space-14` |
| Main card (light) | `--bg-light-card`, `--radius-16`, `--space-14` |
| Context panel | `--bg-dark-panel-muted` or `--bg-light-card-soft`, `--radius-16` |

## 9. Guardrails

1. Do not introduce unregistered high-saturation background colors for large areas.
2. Use `--accent-action-*` only for CTA and active controls.
3. Use semantic colors only for semantic meaning.
4. Keep dark/light hierarchy equivalent when switching themes.
5. Motion should default to the registered duration and easing tokens before introducing raw timing values.
6. If a new token is required, update this file and `agents/standards/prototype-design-standards.md` in the same change.
