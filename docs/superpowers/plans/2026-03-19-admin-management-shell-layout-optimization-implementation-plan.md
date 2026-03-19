# Admin Management Shell Layout Optimization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the protected management shell so `workspace`, `admin`, and `account` share a left-attached desktop workbench layout, a unified topbar contract, and a drawer-based mobile sidebar without changing route or business-page contracts.

**Architecture:** Keep `ProtectedConsoleShell` as the single protected shell skeleton and move ownership of layout, gutter, drawer, and topbar interaction rules into shared shell layers. Route-specific shell wrappers continue to provide navigation content and copy, while `workspace`, `admin`, and `account` CSS files are reduced to theme-level responsibilities instead of redefining structural behavior.

**Tech Stack:** Next.js 16, React 19, TypeScript, global CSS in `frontend-next/app/*.css`, Vitest unit tests, Playwright E2E authenticated route coverage.

---

## File Structure

### Modified files

- `frontend-next/src/components/shared/ProtectedConsoleShell.tsx`
  - Add mobile drawer state, drawer trigger plumbing, overlay, and responsive shell landmarks.
- `frontend-next/src/components/shared/ProtectedTopbar.tsx`
  - Inject a shared mobile menu trigger, stabilize topbar row ordering, and keep overflow behavior consistent across routes.
- `frontend-next/src/components/shared/WorkspaceShell.tsx`
  - Wire workspace sidebar content into the shared drawer-enabled shell without redefining structure.
- `frontend-next/src/components/shared/AdminShell.tsx`
  - Wire admin sidebar content into the shared drawer-enabled shell and preserve admin route group behavior.
- `frontend-next/src/components/shared/AccountShell.tsx`
  - Align account shell with the same shared drawer-enabled shell contract.
- `frontend-next/app/protected-shell-layout.css`
  - Own frame width, gutter, grid, sticky offsets, drawer, overlay, and breakpoint rules.
- `frontend-next/app/protected-shell.css`
  - Own shared topbar contract, menu trigger, utility layout, drawer panel surface, and interactive states.
- `frontend-next/app/workspace-shell.css`
  - Remove duplicate structural rules and keep only workspace-specific tone and minor surface styling.
- `frontend-next/app/admin-shell.css`
  - Remove duplicate structural rules and keep only admin-specific tone and minor surface styling.
- `frontend-next/app/account-shell.css`
  - Remove duplicate structural rules and keep only account-specific tone and minor surface styling.
- `frontend-next/app/workspace-topbar.css`
  - Trim or adapt workspace-only topbar rules so they no longer fight the shared protected topbar contract.
- `frontend-next/app/workspace-topbar-shell.css`
  - Keep only shared-compatible primitives that still apply after topbar ownership is centralized.
- `frontend-next/app/workspace-topbar-controls.css`
  - Remove obsolete visual overrides that conflict with the protected topbar rules.
- `frontend-next/tests/unit/protected-topbar-model.test.ts`
  - Preserve overflow and responsive visible-count contracts if helper behavior changes.
- `frontend-next/tests/e2e/authenticated-routes.spec.ts`
  - Extend authenticated smoke coverage with shared shell visibility and desktop navigation expectations.
- `frontend-next/tests/e2e/authenticated-management.spec.ts`
  - Extend workspace/account coverage for topbar overflow and shell navigation stability.

### New files

- `frontend-next/tests/unit/protected-console-shell.test.tsx`
  - Verifies drawer trigger rendering, overlay state, and responsive shell landmarks for the shared shell.
- `frontend-next/tests/unit/protected-topbar-layout.test.tsx`
  - Verifies the shared topbar renders a mobile menu trigger, utility cluster, and overflow panel contract correctly.

### Verification-only files

- `frontend-next/test-results/**`
  - Playwright artifacts if any authenticated shell spec fails.
- `frontend-next/tmp-screens/**`
  - Optional manual screenshots if additional responsive evidence is needed.

## Chunk 1: Shared Shell Structure

### Task 1: Reproduce the shell defect and lock the shared shell contract with tests

**Files:**
- Create: `frontend-next/tests/unit/protected-console-shell.test.tsx`
- Create: `frontend-next/tests/unit/protected-topbar-layout.test.tsx`
- Modify: `frontend-next/tests/e2e/authenticated-routes.spec.ts`
- Modify: `frontend-next/tests/e2e/authenticated-management.spec.ts`

- [ ] **Step 1: Write the failing shared-shell unit test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProtectedConsoleShell } from "@/src/components/shared/ProtectedConsoleShell";

describe("ProtectedConsoleShell", () => {
  it("renders a drawer trigger and keeps the sidebar mounted behind a mobile drawer contract", () => {
    render(
      <ProtectedConsoleShell
        scope="workspace-shell"
        shellTestId="workspace-shell"
        sideNavTestId="workspace-side-nav"
        drawerToggleLabel="Open navigation"
        header={<div>header</div>}
        sidebar={<div>sidebar</div>}
      >
        <div>content</div>
      </ProtectedConsoleShell>
    );

    expect(screen.getByRole("button", { name: "Open navigation" })).toBeInTheDocument();
    expect(screen.getByTestId("workspace-side-nav")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Write the failing shared-topbar layout test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProtectedTopbar } from "@/src/components/shared/ProtectedTopbar";

describe("ProtectedTopbar", () => {
  it("renders the mobile menu trigger before the brand and keeps the account trigger visible", () => {
    render(/* minimal protected topbar props with menu trigger enabled */);

    expect(screen.getByRole("button", { name: /open navigation/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/open account center/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the focused unit tests to verify failure**

Run: `cd frontend-next && npm run test:unit -- tests/unit/protected-console-shell.test.tsx tests/unit/protected-topbar-layout.test.tsx`  
Expected: FAIL because the shared shell does not expose the new drawer trigger contract yet.

- [ ] **Step 4: Add failing authenticated shell assertions**

Add the smallest failing checks to:
- `frontend-next/tests/e2e/authenticated-routes.spec.ts`
- `frontend-next/tests/e2e/authenticated-management.spec.ts`

Expected assertions:

```ts
await expect(page.getByTestId("workspace-shell").getByRole("button", { name: /open navigation/i })).toBeVisible();
await expect(page.getByTestId("admin-shell").getByRole("button", { name: /open navigation/i })).toBeVisible();
await expect(page.getByTestId("account-shell").getByRole("button", { name: /open navigation/i })).toBeVisible();
```

- [ ] **Step 5: Run the focused authenticated E2E specs to verify failure**

Run: `cd frontend-next && npm run test:e2e -- authenticated-routes.spec.ts authenticated-management.spec.ts`  
Expected: FAIL because the new shared drawer-trigger contract is not implemented yet.

- [ ] **Step 6: Commit the failing shell contract tests**

```bash
git add \
  frontend-next/tests/unit/protected-console-shell.test.tsx \
  frontend-next/tests/unit/protected-topbar-layout.test.tsx \
  frontend-next/tests/e2e/authenticated-routes.spec.ts \
  frontend-next/tests/e2e/authenticated-management.spec.ts
git commit -m "test(shell): lock protected shell responsive contract"
```

### Task 2: Implement the shared drawer-enabled shell skeleton

**Files:**
- Modify: `frontend-next/src/components/shared/ProtectedConsoleShell.tsx`
- Modify: `frontend-next/app/protected-shell-layout.css`
- Modify: `frontend-next/app/protected-shell.css`

- [ ] **Step 1: Implement minimal shared shell state and markup**

Target code shape:

```tsx
const [isDrawerOpen, setIsDrawerOpen] = useState(false);

return (
  <div className="protected-console-root">
    <header>{header}</header>
    <div className="protected-console-body">
      <div className="protected-console-grid">
        <aside className="protected-console-sidebar protected-console-sidebar-desktop">{sidebar}</aside>
        <main className="protected-console-main">{children}</main>
      </div>
    </div>
    <div className={cn("protected-console-drawer-backdrop", isDrawerOpen && "is-open")} />
    <aside className={cn("protected-console-drawer", isDrawerOpen && "is-open")}>{sidebar}</aside>
  </div>
);
```

- [ ] **Step 2: Add the shared layout CSS for left-attached desktop spacing**

Required changes in `frontend-next/app/protected-shell-layout.css`:
- reduce oversized desktop gutter
- keep a capped max width without strong centered-page feel
- make sidebar fixed-width on desktop
- switch to single-column content on narrower screens
- add drawer/backdrop rules and sticky offsets

- [ ] **Step 3: Add shared shell interaction styles**

Required changes in `frontend-next/app/protected-shell.css`:
- menu trigger styling
- drawer panel surface and shadow
- backdrop visibility states
- topbar utility wrap rules
- focus-visible and hover states for the new shell controls

- [ ] **Step 4: Re-run the focused unit tests**

Run: `cd frontend-next && npm run test:unit -- tests/unit/protected-console-shell.test.tsx tests/unit/protected-topbar-layout.test.tsx`  
Expected: still FAIL or partially fail until the topbar wiring is added in the next task, but the shell markup assertions should now be closer to green.

- [ ] **Step 5: Commit the shared shell skeleton**

```bash
git add \
  frontend-next/src/components/shared/ProtectedConsoleShell.tsx \
  frontend-next/app/protected-shell-layout.css \
  frontend-next/app/protected-shell.css
git commit -m "feat(shell): add shared protected drawer layout"
```

## Chunk 2: Unified Topbar Contract

### Task 3: Centralize topbar ownership and add the mobile menu trigger

**Files:**
- Modify: `frontend-next/src/components/shared/ProtectedTopbar.tsx`
- Modify: `frontend-next/app/protected-shell.css`
- Modify: `frontend-next/app/workspace-topbar.css`
- Modify: `frontend-next/app/workspace-topbar-shell.css`
- Modify: `frontend-next/app/workspace-topbar-controls.css`

- [ ] **Step 1: Implement the failing topbar behavior minimally**

Target code shape in `ProtectedTopbar.tsx`:

```tsx
<button
  type="button"
  className="protected-topbar-menu-trigger"
  aria-label={messages.openNavigationLabel}
  onClick={onOpenSidebar}
>
  <PanelLeft />
</button>
```

Insert the trigger before the brand on small and medium shells while keeping desktop visual order stable.

- [ ] **Step 2: Keep utility and overflow ordering stable**

Adjust the topbar container so:
- brand stays visible
- primary navigation remains the main desktop control band
- utility cluster keeps account trigger visible
- overflow toggle still works when width shrinks

- [ ] **Step 3: Remove conflicting workspace-only visual overrides**

In the `workspace-topbar*.css` files:
- strip any dark-background hover/active rules that override the protected theme
- keep only generic primitives that remain valid under the shared protected topbar contract

- [ ] **Step 4: Re-run the focused unit tests and topbar model tests**

Run: `cd frontend-next && npm run test:unit -- tests/unit/protected-console-shell.test.tsx tests/unit/protected-topbar-layout.test.tsx tests/unit/protected-topbar-model.test.ts tests/unit/workspace-topbar-model.test.ts`  
Expected: PASS

- [ ] **Step 5: Re-run the focused authenticated E2E specs**

Run: `cd frontend-next && npm run test:e2e -- authenticated-routes.spec.ts authenticated-management.spec.ts`  
Expected: PASS with the new shared topbar and menu trigger visible across shells.

- [ ] **Step 6: Commit the unified topbar contract**

```bash
git add \
  frontend-next/src/components/shared/ProtectedTopbar.tsx \
  frontend-next/app/protected-shell.css \
  frontend-next/app/workspace-topbar.css \
  frontend-next/app/workspace-topbar-shell.css \
  frontend-next/app/workspace-topbar-controls.css \
  frontend-next/tests/unit/protected-console-shell.test.tsx \
  frontend-next/tests/unit/protected-topbar-layout.test.tsx \
  frontend-next/tests/unit/protected-topbar-model.test.ts \
  frontend-next/tests/unit/workspace-topbar-model.test.ts \
  frontend-next/tests/e2e/authenticated-routes.spec.ts \
  frontend-next/tests/e2e/authenticated-management.spec.ts
git commit -m "feat(topbar): unify protected management navigation"
```

## Chunk 3: Route Shell Cleanup and Full Verification

### Task 4: Remove duplicated route-shell structure and keep only route themes

**Files:**
- Modify: `frontend-next/src/components/shared/WorkspaceShell.tsx`
- Modify: `frontend-next/src/components/shared/AdminShell.tsx`
- Modify: `frontend-next/src/components/shared/AccountShell.tsx`
- Modify: `frontend-next/app/workspace-shell.css`
- Modify: `frontend-next/app/admin-shell.css`
- Modify: `frontend-next/app/account-shell.css`

- [ ] **Step 1: Simplify route shell wrappers to the shared contract**

Make each route shell pass only:
- header/topbar configuration
- sidebar content
- route-level copy
- optional main class names

Do not let route wrappers reintroduce duplicate layout assumptions.

- [ ] **Step 2: Remove duplicate structural CSS from route files**

Required cleanup:
- remove duplicate frame width rules
- remove duplicate grid definitions
- remove duplicate sticky sidebar rules
- keep only route-specific tone and minor local surfaces

- [ ] **Step 3: Re-run focused unit and E2E verification**

Run:
- `cd frontend-next && npm run test:unit -- tests/unit/protected-shell-dictionary.test.ts tests/unit/protected-console-shell.test.tsx tests/unit/protected-topbar-layout.test.tsx tests/unit/workspace-route-page.test.ts`
- `cd frontend-next && npm run test:e2e -- authenticated-routes.spec.ts authenticated-management.spec.ts authenticated-admin-contracts.spec.ts`

Expected: PASS

- [ ] **Step 4: Commit the route-shell cleanup**

```bash
git add \
  frontend-next/src/components/shared/WorkspaceShell.tsx \
  frontend-next/src/components/shared/AdminShell.tsx \
  frontend-next/src/components/shared/AccountShell.tsx \
  frontend-next/app/workspace-shell.css \
  frontend-next/app/admin-shell.css \
  frontend-next/app/account-shell.css
git commit -m "refactor(shell): reduce route-specific layout duplication"
```

### Task 5: Run full changed-scope verification and collect evidence

**Files:**
- Verify only

- [ ] **Step 1: Run lint**

Run: `cd frontend-next && npm run lint`  
Expected: PASS

- [ ] **Step 2: Run the full unit suite**

Run: `cd frontend-next && npm run test:unit`  
Expected: PASS

- [ ] **Step 3: Run the authenticated and shell-sensitive E2E suite**

Run: `cd frontend-next && npm run test:e2e -- authenticated-routes.spec.ts authenticated-management.spec.ts authenticated-admin-contracts.spec.ts authenticated-governance.spec.ts`  
Expected: PASS

- [ ] **Step 4: Run production build**

Run: `cd frontend-next && npm run build`  
Expected: PASS

- [ ] **Step 5: Run repository max-lines gate**

Run: `./scripts/check_max_lines.sh`  
Expected: PASS

- [ ] **Step 6: Capture residual evidence if any UI verification fails**

If Playwright fails:
- note failing spec names
- preserve `frontend-next/test-results/` artifact paths
- capture supplemental screenshots under `frontend-next/tmp-screens/` if needed

- [ ] **Step 7: Commit the verified shell rollout**

```bash
git add frontend-next
git commit -m "feat(shell): optimize admin management layout responsiveness"
```
