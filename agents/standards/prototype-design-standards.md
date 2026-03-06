# Prototype Design Standards

Version: 1.1
Last Updated: 2026-03-02
Owner: Product Design + Engineering
Applies To: SkillsIndex web prototype (user side and admin side)

## 1. Purpose

This standard defines a unified design baseline for all prototype pages to ensure:

1. High readability under dense information.
2. Stable visual hierarchy across modules.
3. Consistent interaction and state language.
4. Fast transition from prototype to implementation.

## 2. Scope

Included:

1. Homepage and marketplace browsing pages.
2. Skill detail, search, and listing pages.
3. Admin governance pages (ingestion, sync, account, roles, SSO, moderation, API key, operations, release, backup).
4. Auth pages (role select, user login, admin login).

Excluded:

1. Native app patterns.
2. Non-web experiment canvases.

## 3. Design Principles

1. Clarity first: prioritize task completion over decoration.
2. One primary focus: each screen has one dominant task region.
3. Progressive disclosure: details appear near the action context.
4. Semantic consistency: same status means same color and structure.
5. Theme parity: dark/light variants keep equivalent hierarchy.

## 4. Information Hierarchy Model

Each screen must follow four levels:

1. L1: page identity (title, route context, critical KPI).
2. L2: primary work area (main list, main form, main timeline).
3. L3: context panel (details, quick actions, help, logs).
4. L4: auxiliary metadata (technical IDs, background hints, references).

Rules:

1. L2 must visually dominate L3.
2. L3 must never use stronger emphasis than L2 by default.
3. L4 must use subdued contrast and smaller typography.

## 5. Layout and Grid

Base desktop canvas:

1. Content width: 1360.
2. Two-column admin layout:
- Primary column: 932.
- Context column: 412.
3. Column gap: 16.
4. Section card corner radius: 16.
5. Card internal spacing: 14 to 16.

Top structure:

1. Header bar height: 86.
2. Main content block height target: 850 for dashboard-like pages.
3. Vertical screen rhythm: 12 to 16 spacing increments.

## 6. Color System

### 6.1 Core Neutrals

Dark:

1. App background: `#0B1326`
2. Header background: `#12213F`
3. Card background: `#1B2E57`
4. Context accent panel base: `#1F3B62`

Light:

1. App background: `#F8FAFC`
2. Header and hero soft background: `#E2EAF6` to `#EAF0FA`
3. Primary card background: `#FFFFFF`
4. Secondary card background: `#F8FAFC` and `#E2EAF6`
5. Context accent panel base: `#1F3B62` (limited usage)

### 6.2 Semantic Colors

1. Success: green family (`#15803D` / `#16A34A`).
2. Warning: amber family (`#B45309` / `#D97706`).
3. Error: red family (`#B91C1C` / `#DC2626`).
4. Info action: blue family (`#1D4ED8` / `#2563EB`) for CTA only.

Restrictions:

1. Do not use semantic colors as full-page backgrounds.
2. High-saturation blue is reserved for CTA and selected state.
3. Context panels should use muted blue, not bright electric blue.

## 7. Typography

1. Primary UI font: `Noto Sans SC`.
2. Monospace for technical values/logs: `JetBrains Mono`.
3. Title scale:
- Screen title: 31 / 700
- Card title: 14 / 700
- Body: 11 to 13 / 500-600
4. Text contrast:
- Main text: high contrast to background.
- Secondary text: one level lower contrast only.
- Avoid low-contrast text on low-contrast card backgrounds.

## 8. Component Standards

### 8.1 Page Header

1. Left: title block with icon.
2. Right: route hint, role state, or compact controls.
3. Avoid long explanatory paragraphs in header.

### 8.2 Primary Work Cards

1. Main list/form cards must appear in the left column.
2. Keep action buttons close to the item they affect.
3. Large blank regions are not allowed inside primary cards.

### 8.3 Context Panel Cards

1. Use for detail summary, quick operations, guidance, and event stream.
2. Max 3 context cards before scrolling.
3. Distinguish quick action block from pure info block.

### 8.4 Status Tags and Pills

1. Keep status pills short and scannable.
2. Use semantic colors only for status meaning.
3. Never mix warning color and success semantics.

## 9. Density and Readability Rules

1. Max 5 major cards in a single vertical scan path per column.
2. Prefer grouped bullets over dense paragraphs for operational text.
3. Event/log lines should be monospace and time-leading.
4. If a panel exceeds 12 short lines, split into two cards.

## 10. Interaction Patterns

1. Primary CTA: filled style.
2. Secondary action: subtle filled or tonal style.
3. Danger action: isolated visually and requires confirmation intent.
4. Filters first, list second, details third.
5. Keep route and navigation feedback visible on every admin page.

## 11. Accessibility Baseline

1. Maintain readable contrast for all body text.
2. Do not rely on color alone to encode status.
3. Actionable controls must be visually distinct from static labels.
4. Maintain predictable tab and reading order in layout structure.

## 12. Responsive Rules

1. Desktop: two-column layout.
2. Tablet: preserve hierarchy, reduce side panel weight.
3. Mobile: convert to single-column with stacked order:
- header
- filter/search
- primary list/form
- context actions

## 13. Admin Module Specific Guidance

1. Ingestion pages: source input and validation on the left, execution context on the right.
2. Sync pages: policy and run ledger must be visually distinguishable by title + core card arrangement.
3. Account and RBAC pages: status and role data in top scan region.
4. SSO pages: provider list, mapping, callback/log separated by card groups.
5. Moderation pages: case summary before action controls.
6. Ops and compliance pages: metrics and controls should be balanced, with concise operational notes.

## 14. Naming and Structure Conventions (.pen)

1. Screen names: `SkillsIndex / <Module Name>`.
2. Core containers:
- `<module>Top`
- `<module>Main`
- `<module>LeftCol`
- `<module>RightCol`
3. Action panel naming: `*ActionPanelCard`.
4. Avoid ambiguous IDs in reusable layout patterns.

## 15. Review Checklist

A page passes review only if all are true:

1. Main task area is identifiable in 1 second.
2. User can scan key state and next action in 3 seconds.
3. No visual conflict between left primary region and right context region.
4. No clipped, overlapped, or broken blocks.
5. Theme parity verified in dark and light variants.

## 16. Change Control

1. Any color token change must include dark/light screenshot verification.
2. Any layout ratio change must verify at least one page per module.
3. Major pattern changes require update to this standard and version bump.

## 17. Homepage Canonical Contract (Baseline for All Marketplace Deck Variants)

The homepage is the primary contract source for all marketplace command deck pages. Any variant page must preserve feature parity with this structure:

1. `TopNav`
2. `homeTopStatsCard`
3. `homeSearch` (with utility + query controls)
4. `homeBodyWrap` (results)
5. `homePagination` (scroll-driven loading hint, no click-only pagination control)

Mandatory rules:

1. White and dark themes must have one-to-one feature parity, not only visual resemblance.
2. `homeTopStatsCard` must be a standalone card below top navigation, never nested inside search.
3. Stats card must display real numeric summary semantics (`statsMain`, `statsSub`, `statsPromo`) and a structured chart region.
4. Search utility row order must be `homeSearchInputRow -> homeUtilityRow`.
5. Footer loading behavior must communicate auto-load on scroll and must not rely on page-number pagination.

## 18. Prototype Constraints (Hard Rules)

1. No clipping or overlap is allowed for stats, search, result grid, or footer blocks.
2. Root and body heights must be adjusted whenever top card height changes.
3. The first card in a section must not use a special background unless explicitly defined by semantics.
4. Dark theme controls must not use white-primary CTA visual weight unless required by contrast rules.
5. Utility texts must be concise and task-relevant; remove explanatory noise.
6. Placeholder image-based chart simulation is prohibited when structured chart data blocks are required.

## 19. MCP-Only Prototype Editing Policy

When editing `.pen` prototype files in this repository:

1. Use `mcp__pencil` tools as the primary and mandatory editing path.
2. Do not perform direct JSON rewrite of `.pen` files for normal prototype updates.
3. Every MCP edit batch must include post-change verification reads.
4. For large remediations, split into dependency-safe batches and log touched node IDs.

---

This document is the single source of truth for prototype UI consistency.
