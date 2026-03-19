# Skill Detail Navigation Preview Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public skill detail page into a two-layer navigation layout with a reusable preview stage, synchronized resource preview state, and a less distracting but always-available installation sidebar.

**Architecture:** Keep the existing public marketplace shell and route contract intact, inject a new skill-specific context bar through the topbar slot system, and centralize skill detail tab metadata in the feature folder. Unify `Overview`, `SKILL.md`, and `Resources` around a shared preview stage while keeping `PublicSkillInteractiveDetail.tsx` as the single owner of tab and selected-resource state.

**Tech Stack:** Next.js 16, React 19, TypeScript, global CSS in `frontend-next/app/*.css`, Vitest unit tests, Playwright E2E smoke verification.

---

## File Structure

### New files

- `frontend-next/src/features/public/skill-detail/skillDetailWorkspaceConfig.ts`
  - Single source of truth for tab order, tab ids, panel ids, and compact status labels used by the context bar and workbench.
- `frontend-next/src/features/public/skill-detail/SkillDetailContextBar.tsx`
  - Skill-level sticky context bar rendered below the marketplace topbar.
- `frontend-next/src/features/public/skill-detail/SkillDetailPreviewStage.tsx`
  - Shared preview shell with title, meta, badge, action slot, empty state, and stable scroll container.
- `frontend-next/tests/unit/skill-detail-workspace-config.test.ts`
  - Verifies workspace tab order, ids, and stable preview-status derivation.
- `frontend-next/tests/unit/skill-detail-context-bar.test.ts`
  - Verifies breadcrumb, active tab rendering, and preview-status output.
- `frontend-next/tests/unit/skill-detail-preview-stage.test.ts`
  - Verifies stable header/content/empty-state contracts for the new preview shell.

### Modified files

- `frontend-next/src/features/public/PublicSkillInteractiveDetail.tsx`
  - Own `selectedResourceName`, build context-bar props, and inject the context bar into the public shell slot.
- `frontend-next/src/features/public/skill-detail/SkillDetailWorkbench.tsx`
  - Consume shared tab config and render preview panels through `SkillDetailPreviewStage`.
- `frontend-next/src/features/public/skill-detail/SkillDetailOverviewPanel.tsx`
  - Replace inline preview shell usage with the shared preview stage.
- `frontend-next/src/features/public/skill-detail/SkillDetailWorkbenchTabs.tsx`
  - Convert to config-driven tab rendering or remove duplicated tab metadata.
- `frontend-next/src/features/public/skill-detail/SkillDetailResourceTree.tsx`
  - Keep row selection stable with explicit selected resource state and current-file status text.
- `frontend-next/src/features/public/skill-detail/SkillDetailSidebar.tsx`
  - Surface current tab/resource context in the install panel without taking ownership of preview state.
- `frontend-next/app/public-skill-detail.css`
  - Base structure for the new context bar, header spacing, and layout rhythm.
- `frontend-next/app/public-skill-detail-topbar.css`
  - Sticky skill-level context bar placement under the marketplace topbar.
- `frontend-next/app/public-skill-detail-content.css`
  - Shared preview stage sizing, fixed-height preview scrolling, and tab/workbench structure.
- `frontend-next/app/public-skill-detail-overview.css`
  - Overview-specific alignment after the preview shell becomes shared.
- `frontend-next/tests/unit/skill-detail-workbench.test.ts`
  - Expand render-contract coverage for shared preview stage and resource sync.
- `frontend-next/tests/unit/skill-detail-workbench-overview.test.ts`
  - Keep overview extraction logic covered after preview-stage adoption.
- `frontend-next/tests/unit/skill-detail-resource-tree.test.ts`
  - Verify selected-file rendering and resource order remain stable.
- `frontend-next/tests/unit/marketplace-topbar-slots.test.ts`
  - Confirm skill-detail topbar slots still expose the expected slot surfaces after below-content injection.

### Verification-only files

- `frontend-next/tests/e2e/public-routes.spec.ts`
  - Reuse if it already covers `/skills/[skillId]`; otherwise add a minimal skill-detail smoke test here instead of creating a broad new suite.

## Chunk 1: Navigation Contracts

### Task 1: Centralize skill detail tab metadata

**Files:**
- Create: `frontend-next/src/features/public/skill-detail/skillDetailWorkspaceConfig.ts`
- Modify: `frontend-next/src/features/public/skill-detail/SkillDetailWorkbench.tsx`
- Modify: `frontend-next/src/features/public/skill-detail/SkillDetailWorkbenchTabs.tsx`
- Test: `frontend-next/tests/unit/skill-detail-workspace-config.test.ts`

- [ ] **Step 1: Write the failing config test**

```ts
import { describe, expect, it } from "vitest";

import {
  skillDetailWorkspaceTabs,
  buildSkillDetailPreviewStatus
} from "@/src/features/public/skill-detail/skillDetailWorkspaceConfig";

describe("skillDetailWorkspaceConfig", () => {
  it("keeps the tab order and ids stable", () => {
    expect(skillDetailWorkspaceTabs.map((item) => item.key)).toEqual([
      "overview",
      "installation",
      "skill",
      "resources",
      "related",
      "history"
    ]);
  });

  it("builds a compact preview status label", () => {
    expect(buildSkillDetailPreviewStatus({ activeTab: "resources", selectedFileName: "docs/README.md" })).toContain("README.md");
  });
});
```

- [ ] **Step 2: Run the focused test to confirm failure**

Run: `cd frontend-next && npm run test:unit -- tests/unit/skill-detail-workspace-config.test.ts`  
Expected: FAIL because the config module does not exist yet.

- [ ] **Step 3: Implement the shared workspace config**

```ts
export const skillDetailWorkspaceTabs = [
  { key: "overview", tabId: "skill-detail-tab-overview", panelId: "skill-detail-panel-overview" },
  { key: "installation", tabId: "skill-detail-tab-installation", panelId: "skill-detail-panel-installation" }
] as const;

export function buildSkillDetailPreviewStatus(input: {
  activeTab: SkillDetailWorkspaceTab;
  selectedFileName?: string;
  versionCount?: number;
}) {
  if (input.activeTab === "resources" && input.selectedFileName) {
    return input.selectedFileName.split("/").pop() || input.selectedFileName;
  }

  return input.activeTab;
}
```

- [ ] **Step 4: Replace duplicated tab metadata with the shared config**

Run through:
- `frontend-next/src/features/public/skill-detail/SkillDetailWorkbench.tsx`
- `frontend-next/src/features/public/skill-detail/SkillDetailWorkbenchTabs.tsx`

Expected code shape:

```ts
import { skillDetailWorkspaceTabs } from "./skillDetailWorkspaceConfig";
```

- [ ] **Step 5: Re-run the focused test**

Run: `cd frontend-next && npm run test:unit -- tests/unit/skill-detail-workspace-config.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit the metadata extraction**

```bash
git add \
  frontend-next/src/features/public/skill-detail/skillDetailWorkspaceConfig.ts \
  frontend-next/src/features/public/skill-detail/SkillDetailWorkbench.tsx \
  frontend-next/src/features/public/skill-detail/SkillDetailWorkbenchTabs.tsx \
  frontend-next/tests/unit/skill-detail-workspace-config.test.ts
git commit -m "refactor(skill-detail): centralize workspace tab config"
```

### Task 2: Add a sticky skill context bar

**Files:**
- Create: `frontend-next/src/features/public/skill-detail/SkillDetailContextBar.tsx`
- Modify: `frontend-next/src/features/public/PublicSkillInteractiveDetail.tsx`
- Modify: `frontend-next/tests/unit/marketplace-topbar-slots.test.ts`
- Test: `frontend-next/tests/unit/skill-detail-context-bar.test.ts`

- [ ] **Step 1: Write the failing context-bar render test**

```ts
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SkillDetailContextBar } from "@/src/features/public/skill-detail/SkillDetailContextBar";

describe("SkillDetailContextBar", () => {
  it("renders the breadcrumb, active tab, and preview status", () => {
    const markup = renderToStaticMarkup(
      createElement(SkillDetailContextBar, {
        activeTab: "resources",
        activeTabTitle: "Resources",
        breadcrumbItems: [
          { href: "/", label: "Home" },
          { href: "/skills/101", label: "Next.js UX Audit Agent" },
          { label: "Resources", isCurrent: true }
        ],
        previewStatus: "README.md",
        onTabChange: vi.fn()
      })
    );

    expect(markup).toContain("skill-detail-context-bar");
    expect(markup).toContain("README.md");
    expect(markup).toContain("aria-selected=\"true\"");
  });
});
```

- [ ] **Step 2: Run the focused test to confirm failure**

Run: `cd frontend-next && npm run test:unit -- tests/unit/skill-detail-context-bar.test.ts`  
Expected: FAIL because the component does not exist yet.

- [ ] **Step 3: Implement the context bar component**

```tsx
export function SkillDetailContextBar(props: SkillDetailContextBarProps) {
  return (
    <div className="skill-detail-context-bar" data-testid="skill-detail-context-bar">
      <div className="skill-detail-context-bar-breadcrumbs">{/* breadcrumb */}</div>
      <div className="skill-detail-context-bar-tabs" role="tablist">{/* tabs */}</div>
      <div className="skill-detail-context-bar-status">{props.previewStatus}</div>
    </div>
  );
}
```

- [ ] **Step 4: Inject the context bar through the public shell slot**

Update `frontend-next/src/features/public/PublicSkillInteractiveDetail.tsx` so the skill-detail topbar slots receive:

```tsx
const shellSlots = useMarketplaceTopbarSlots({
  variant: "skill-detail",
  belowContent: (
    <SkillDetailContextBar
      activeTab={workspaceTab}
      previewStatus={previewStatus}
      onTabChange={setWorkspaceTab}
      /* ... */
    />
  )
});
```

Also remove the old standalone breadcrumb block once the context bar is live to avoid duplicate hierarchy.

- [ ] **Step 5: Extend the topbar slot test for below-content stability**

Add an assertion in `frontend-next/tests/unit/marketplace-topbar-slots.test.ts` that skill-detail slots still provide brand, primary-navigation, and actions even when page-level `belowContent` is injected separately by `PublicShellRegistration`.

- [ ] **Step 6: Re-run the focused tests**

Run:  
`cd frontend-next && npm run test:unit -- tests/unit/skill-detail-context-bar.test.ts tests/unit/marketplace-topbar-slots.test.ts`  
Expected: PASS

- [ ] **Step 7: Commit the context-bar wiring**

```bash
git add \
  frontend-next/src/features/public/skill-detail/SkillDetailContextBar.tsx \
  frontend-next/src/features/public/PublicSkillInteractiveDetail.tsx \
  frontend-next/tests/unit/skill-detail-context-bar.test.ts \
  frontend-next/tests/unit/marketplace-topbar-slots.test.ts
git commit -m "feat(skill-detail): add sticky skill context bar"
```

## Chunk 2: Shared Preview Stage

### Task 3: Introduce a reusable preview stage shell

**Files:**
- Create: `frontend-next/src/features/public/skill-detail/SkillDetailPreviewStage.tsx`
- Test: `frontend-next/tests/unit/skill-detail-preview-stage.test.ts`

- [ ] **Step 1: Write the failing preview-stage render test**

```ts
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SkillDetailPreviewStage } from "@/src/features/public/skill-detail/SkillDetailPreviewStage";

describe("SkillDetailPreviewStage", () => {
  it("renders a stable header and scroll container", () => {
    const markup = renderToStaticMarkup(
      createElement(SkillDetailPreviewStage, {
        title: "SKILL.md",
        meta: "Markdown",
        badge: "Updated Mar 18, 2026",
        children: createElement("pre", null, "# Skill content")
      })
    );

    expect(markup).toContain("skill-detail-preview-stage");
    expect(markup).toContain("skill-detail-preview-stage-head");
    expect(markup).toContain("skill-detail-preview-stage-body");
  });
});
```

- [ ] **Step 2: Run the focused test to confirm failure**

Run: `cd frontend-next && npm run test:unit -- tests/unit/skill-detail-preview-stage.test.ts`  
Expected: FAIL because the component does not exist yet.

- [ ] **Step 3: Implement the preview stage**

```tsx
export function SkillDetailPreviewStage({
  title,
  meta,
  badge,
  children,
  empty
}: SkillDetailPreviewStageProps) {
  return (
    <section className="skill-detail-preview-stage">
      <header className="skill-detail-preview-stage-head">{/* title, meta, badge */}</header>
      <div className="skill-detail-preview-stage-body">{empty ?? children}</div>
    </section>
  );
}
```

- [ ] **Step 4: Re-run the focused test**

Run: `cd frontend-next && npm run test:unit -- tests/unit/skill-detail-preview-stage.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit the new preview shell**

```bash
git add \
  frontend-next/src/features/public/skill-detail/SkillDetailPreviewStage.tsx \
  frontend-next/tests/unit/skill-detail-preview-stage.test.ts
git commit -m "feat(skill-detail): add shared preview stage"
```

### Task 4: Refactor the workbench and overview to use the preview stage

**Files:**
- Modify: `frontend-next/src/features/public/skill-detail/SkillDetailWorkbench.tsx`
- Modify: `frontend-next/src/features/public/skill-detail/SkillDetailOverviewPanel.tsx`
- Modify: `frontend-next/src/features/public/skill-detail/SkillDetailWorkbenchTabs.tsx`
- Test: `frontend-next/tests/unit/skill-detail-workbench.test.ts`
- Test: `frontend-next/tests/unit/skill-detail-workbench-overview.test.ts`

- [ ] **Step 1: Add failing assertions for the shared preview stage**

Extend `frontend-next/tests/unit/skill-detail-workbench.test.ts` with expectations like:

```ts
expect(markup).toContain("skill-detail-preview-stage");
expect(markup).toContain("skill-detail-preview-stage-head");
expect(markup).toContain("skill-detail-preview-stage-body");
```

For overview mode, assert the document preview block still renders before related/score/comments.

- [ ] **Step 2: Run the focused tests to confirm failure**

Run:  
`cd frontend-next && npm run test:unit -- tests/unit/skill-detail-workbench.test.ts tests/unit/skill-detail-workbench-overview.test.ts`  
Expected: FAIL because the workbench still renders the old ad-hoc preview shell.

- [ ] **Step 3: Replace ad-hoc preview wrappers with `SkillDetailPreviewStage`**

Apply the shared shell in:

- `SkillDetailWorkbench.tsx` for `skill`, `installation`, and `resources`-adjacent preview content
- `SkillDetailOverviewPanel.tsx` for the overview document preview

Minimal target shape:

```tsx
<SkillDetailPreviewStage
  title={resourceTitle}
  meta={resourceLanguage}
  badge={updatedBadge}
>
  <pre className="skill-detail-preview-content">{content}</pre>
</SkillDetailPreviewStage>
```

- [ ] **Step 4: Keep the workbench tab strip config-driven**

Move any remaining hardcoded tab metadata to `skillDetailWorkspaceConfig.ts` and let `SkillDetailWorkbenchTabs.tsx` consume the shared config instead of keeping its own list.

- [ ] **Step 5: Re-run the focused tests**

Run:  
`cd frontend-next && npm run test:unit -- tests/unit/skill-detail-workbench.test.ts tests/unit/skill-detail-workbench-overview.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit the preview-stage refactor**

```bash
git add \
  frontend-next/src/features/public/skill-detail/SkillDetailWorkbench.tsx \
  frontend-next/src/features/public/skill-detail/SkillDetailOverviewPanel.tsx \
  frontend-next/src/features/public/skill-detail/SkillDetailWorkbenchTabs.tsx \
  frontend-next/tests/unit/skill-detail-workbench.test.ts \
  frontend-next/tests/unit/skill-detail-workbench-overview.test.ts
git commit -m "refactor(skill-detail): unify workbench preview layout"
```

### Task 5: Synchronize resource selection with preview state

**Files:**
- Modify: `frontend-next/src/features/public/PublicSkillInteractiveDetail.tsx`
- Modify: `frontend-next/src/features/public/skill-detail/SkillDetailWorkbench.tsx`
- Modify: `frontend-next/src/features/public/skill-detail/SkillDetailResourceTree.tsx`
- Test: `frontend-next/tests/unit/skill-detail-resource-tree.test.ts`
- Test: `frontend-next/tests/unit/skill-detail-workbench.test.ts`

- [ ] **Step 1: Add failing tests for explicit selected-resource sync**

Add assertions such as:

```ts
expect(markup).toContain("aria-selected=\"true\"");
expect(markup).toContain("skill-detail-preview-stage");
expect(markup).toContain("README.md");
```

The workbench test should verify that the selected file name also appears in the preview header or compact preview status.

- [ ] **Step 2: Run the focused tests to confirm failure**

Run:  
`cd frontend-next && npm run test:unit -- tests/unit/skill-detail-resource-tree.test.ts tests/unit/skill-detail-workbench.test.ts`  
Expected: FAIL because current selection is inferred indirectly from `resourceContent` or first file only.

- [ ] **Step 3: Add explicit selected-resource state at the page level**

Update `PublicSkillInteractiveDetail.tsx`:

```ts
const [selectedResourceName, setSelectedResourceName] = useState(
  initialResourceContent?.path || resources?.files[0]?.name || ""
);
```

On file open:

```ts
setSelectedResourceName(fileName);
setWorkspaceTab("skill");
```

- [ ] **Step 4: Update the workbench and resource tree to consume the explicit selection**

Use `selectedResourceName` instead of recomputing from `resourceContent` alone so the highlighted row, preview header, and context bar status all point at the same file.

- [ ] **Step 5: Re-run the focused tests**

Run:  
`cd frontend-next && npm run test:unit -- tests/unit/skill-detail-resource-tree.test.ts tests/unit/skill-detail-workbench.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit the resource-sync changes**

```bash
git add \
  frontend-next/src/features/public/PublicSkillInteractiveDetail.tsx \
  frontend-next/src/features/public/skill-detail/SkillDetailWorkbench.tsx \
  frontend-next/src/features/public/skill-detail/SkillDetailResourceTree.tsx \
  frontend-next/tests/unit/skill-detail-resource-tree.test.ts \
  frontend-next/tests/unit/skill-detail-workbench.test.ts
git commit -m "feat(skill-detail): sync resource selection with preview state"
```

## Chunk 3: Sidebar Coordination, Styling, and Verification

### Task 6: Surface preview context in the install sidebar

**Files:**
- Modify: `frontend-next/src/features/public/skill-detail/SkillDetailSidebar.tsx`
- Modify: `frontend-next/src/features/public/PublicSkillInteractiveDetail.tsx`
- Test: `frontend-next/tests/unit/skill-detail-workbench.test.ts`

- [ ] **Step 1: Add a failing sidebar-context assertion**

Extend an existing render test or add one to check that the install panel can render current-tab or current-file context text without changing its core actions.

Example target markup:

```ts
expect(markup).toContain("skill-detail-installation-card");
expect(markup).toContain("README.md");
```

- [ ] **Step 2: Run the focused test to confirm failure**

Run: `cd frontend-next && npm run test:unit -- tests/unit/skill-detail-workbench.test.ts`  
Expected: FAIL because sidebar copy does not yet reflect current preview context.

- [ ] **Step 3: Add read-only preview context props to the sidebar**

Pass minimal props such as:

```ts
currentPreviewLabel={selectedResourceName || activeWorkspaceLabel}
currentTab={workspaceTab}
```

Render them as supporting context only; do not move action ownership into the sidebar.

- [ ] **Step 4: Re-run the focused test**

Run: `cd frontend-next && npm run test:unit -- tests/unit/skill-detail-workbench.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit the sidebar coordination**

```bash
git add \
  frontend-next/src/features/public/skill-detail/SkillDetailSidebar.tsx \
  frontend-next/src/features/public/PublicSkillInteractiveDetail.tsx \
  frontend-next/tests/unit/skill-detail-workbench.test.ts
git commit -m "feat(skill-detail): surface preview context in sidebar"
```

### Task 7: Apply the layout and responsive styling pass

**Files:**
- Modify: `frontend-next/app/public-skill-detail.css`
- Modify: `frontend-next/app/public-skill-detail-topbar.css`
- Modify: `frontend-next/app/public-skill-detail-content.css`
- Modify: `frontend-next/app/public-skill-detail-overview.css`
- Optional modify: `frontend-next/app/public-skill-detail-resources-browser.css`

- [ ] **Step 1: Add CSS contract notes to the failing test list**

Before editing styles, capture the CSS targets in comments inside the task branch or dev notes:

```text
- sticky context bar under topbar
- fixed-height preview stage body
- stable workbench header spacing
- mobile fallback without duplicate sticky layers
```

- [ ] **Step 2: Implement the minimal style pass for the new structure**

Expected selectors include:

```css
.skill-detail-context-bar {}
.skill-detail-preview-stage {}
.skill-detail-preview-stage-head {}
.skill-detail-preview-stage-body {}
```

Required outcomes:

- context bar is visually subordinate to the main topbar but clearly separate
- preview stage has a fixed-height body with internal scrolling
- workbench header and tab strip maintain stable spacing across tabs
- mobile layout collapses sticky behavior safely

- [ ] **Step 3: Manually verify in the running dev server**

Open `/skills/101` and inspect:

1. topbar + context bar layering
2. overview preview readability
3. `Resources` row selection + preview sync
4. sidebar staying useful without overpowering the preview stage

- [ ] **Step 4: Commit the style pass**

```bash
git add \
  frontend-next/app/public-skill-detail.css \
  frontend-next/app/public-skill-detail-topbar.css \
  frontend-next/app/public-skill-detail-content.css \
  frontend-next/app/public-skill-detail-overview.css \
  frontend-next/app/public-skill-detail-resources-browser.css
git commit -m "style(skill-detail): polish context bar and preview stage"
```

### Task 8: Run the regression and shipping checks

**Files:**
- Modify only if required by failing tests
- Verify: `frontend-next/tests/unit/*skill-detail*`
- Verify: `frontend-next/tests/unit/marketplace-topbar-slots.test.ts`
- Verify: `frontend-next/tests/e2e/public-routes.spec.ts` or the existing skill-detail smoke path

- [ ] **Step 1: Run the full unit slice for skill detail**

Run:

```bash
cd frontend-next && npm run test:unit -- \
  tests/unit/skill-detail-workspace-config.test.ts \
  tests/unit/skill-detail-context-bar.test.ts \
  tests/unit/skill-detail-preview-stage.test.ts \
  tests/unit/skill-detail-header.test.ts \
  tests/unit/skill-detail-resource-tree.test.ts \
  tests/unit/skill-detail-workbench-overview.test.ts \
  tests/unit/skill-detail-workbench.test.ts \
  tests/unit/marketplace-topbar-slots.test.ts
```

Expected: PASS

- [ ] **Step 2: Run the E2E smoke verification**

Run:

```bash
cd frontend-next && npm run test:e2e
```

Expected: PASS, or if the suite is broad/flaky, document the exact skill-detail coverage that ran and any residual risk.

- [ ] **Step 3: Run the production build**

Run:

```bash
cd frontend-next && npm run build
```

Expected: PASS

- [ ] **Step 4: Run the repository line-count guard**

Run:

```bash
cd /Users/tanzv/Development/Git/skillsindex && ./scripts/check_max_lines.sh
```

Expected: PASS

- [ ] **Step 5: Commit any final fixes from verification**

```bash
git add -A
git commit -m "test(skill-detail): finalize navigation preview regressions"
```

## Notes for the Implementer

- Prefer small focused helpers over adding more conditional branches inside `SkillDetailWorkbench.tsx`.
- Do not reintroduce duplicate breadcrumb rendering in both page body and topbar below-content.
- Keep `PublicSkillInteractiveDetail.tsx` as the only owner of selected-resource state.
- Do not let `SkillDetailSidebar.tsx` mutate preview state directly.
- Reuse existing marketplace and skill-detail variables before adding any new raw color or spacing values.
- Keep all code and code comments in English.

## Handoff Checklist

- [ ] Shared tab metadata exists and is reused
- [ ] Sticky context bar is injected via topbar below-content
- [ ] Shared preview stage wraps overview/document/resource reading surfaces
- [ ] Explicit selected-resource state drives row highlight and preview header
- [ ] Sidebar reflects current preview context without stealing focus
- [ ] Unit tests, E2E, build, and max-lines checks are all recorded
