# Workspace Header Optimization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the `/workspace` header by removing ineffective logo-area copy, simplifying avatar presentation, and improving the user menu visual hierarchy without breaking protected shell behavior.

**Architecture:** Keep ownership inside the shared protected shell and account menu modules. Adjust token-first styling in shared CSS and only change component structure where the current dropdown/trigger composition creates unnecessary visual noise.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules, shared protected theme CSS, Vitest, Playwright

---

## Chunk 1: Scope mapping

### Task 1: Identify header ownership

**Files:**
- Modify: `frontend-next/src/components/shared/WorkspaceShell.tsx`
- Modify: `frontend-next/src/components/shared/AccountCenterMenu.tsx`
- Modify: `frontend-next/app/protected-shell.css`
- Modify: `frontend-next/app/workspace-topbar-controls.css`
- Modify: `frontend-next/src/components/shared/AccountCenterMenu.module.scss`

- [ ] Inspect the current workspace shell layout and account menu trigger structure.
- [ ] Identify which copy in the logo area is decorative or low-value.
- [ ] Confirm whether avatar-only trigger can preserve logout/account access affordance.

## Chunk 2: Header refinement

### Task 2: Simplify topbar information density

**Files:**
- Modify: `frontend-next/src/components/shared/WorkspaceShell.tsx`
- Modify: `frontend-next/app/protected-shell.css`

- [ ] Remove or reduce ineffective logo-area auxiliary text while preserving product identity.
- [ ] Rebalance spacing and alignment of brand, navigation, and account areas.
- [ ] Keep keyboard/focus semantics intact.

### Task 3: Optimize account trigger and menu styling

**Files:**
- Modify: `frontend-next/src/components/shared/AccountCenterMenu.tsx`
- Modify: `frontend-next/src/components/shared/AccountCenterMenu.module.scss`
- Modify: `frontend-next/app/workspace-topbar-controls.css`

- [ ] Remove unnecessary visible dropdown container around the avatar trigger if the avatar alone can act as the entry.
- [ ] Improve menu panel spacing, contrast, grouping, and hover/focus states.
- [ ] Preserve logout flow and menu actions.

## Chunk 3: Verification

### Task 4: Validate changed scope

**Files:**
- Test: `frontend-next` verification commands

- [ ] Run `cd frontend-next && npm run lint`.
- [ ] Run `cd frontend-next && npm run test:unit`.
- [ ] Run relevant `cd frontend-next && npm run test:e2e`.
- [ ] Run `cd frontend-next && npm run build`.
- [ ] Run `./scripts/check_max_lines.sh`.
