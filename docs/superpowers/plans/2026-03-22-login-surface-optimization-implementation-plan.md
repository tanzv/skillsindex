# Login Surface Optimization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the login page left panel configuration-driven, improve the visual hierarchy, and add accessible entrance animation without changing authentication behavior.

**Architecture:** Keep the route entry and server rendering flow unchanged. Add a small feature-local view-model builder for the left information panel, upgrade the panel component to render configurable cards, and layer motion only in the presentation styles with reduced-motion fallbacks.

**Tech Stack:** Next.js App Router, React 19, TypeScript, SCSS Modules, Vitest, Playwright

---

## Chunk 1: Login Info Panel Model

### Task 1: Add a pure builder for left-panel content

**Files:**
- Create: `frontend-next/src/features/auth/loginInfoPanelModel.ts`
- Modify: `frontend-next/src/features/auth/LoginForm.tsx`
- Test: `frontend-next/tests/unit/login-info-panel-model.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { buildLoginInfoPanelModel } from "@/src/features/auth/loginInfoPanelModel";

describe("buildLoginInfoPanelModel", () => {
  it("maps auth messages into a stable left-panel card model", () => {
    const model = buildLoginInfoPanelModel({
      redirectTarget: "/admin/overview",
      messages: {
        infoEyebrow: "Private Access",
        infoTitle: "Welcome Back",
        infoLead: "Use one secure entry point.",
        infoPointOne: "Use your existing local account credentials.",
        infoPointTwo: "Third-party providers follow the current admin configuration.",
        infoPointThree: "After sign in, you will be redirected to the requested route."
      } as never
    });

    expect(model.cards).toHaveLength(3);
    expect(model.cards[0]?.accent).toBe("primary");
    expect(model.cards[0]?.title).toContain("existing local account");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend-next && npm run test:unit -- tests/unit/login-info-panel-model.test.ts`
Expected: FAIL because the model file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface LoginInfoPanelCardModel {
  id: string;
  accent: "primary" | "secondary";
  eyebrow: string;
  title: string;
  description: string;
}

export function buildLoginInfoPanelModel(...) {
  return {
    eyebrow: messages.infoEyebrow,
    title: messages.infoTitle,
    lead: messages.infoLead,
    cards: [...]
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend-next && npm run test:unit -- tests/unit/login-info-panel-model.test.ts`
Expected: PASS

## Chunk 2: Configurable Panel And Motion

### Task 2: Upgrade the left panel component to render cards from the model

**Files:**
- Modify: `frontend-next/src/features/auth/LoginInfoPanel.tsx`
- Modify: `frontend-next/src/features/auth/LoginInfoPanel.module.scss`
- Modify: `frontend-next/src/features/auth/LoginForm.tsx`

- [ ] **Step 1: Replace the fixed bullet list contract**

Update the panel props from `items: string[]` to a structured model with top copy and card descriptors.

- [ ] **Step 2: Render configurable cards**

Add semantic card markup with stable `data-testid` hooks for the panel region and per-card list.

- [ ] **Step 3: Add entrance animation**

Use SCSS-only staged motion for:
- the top bar
- the left panel shell
- the individual left cards with staggered delays
- the right form card

Use `transform` and `opacity` only. Keep `@media (prefers-reduced-motion: reduce)` support.

- [ ] **Step 4: Preserve responsiveness**

Keep the existing desktop split and mobile stacking behavior while ensuring the new card layout compresses cleanly.

## Chunk 3: Verification Coverage

### Task 3: Add regression tests for the new model and route behavior

**Files:**
- Create: `frontend-next/tests/unit/login-info-panel-model.test.ts`
- Modify: `frontend-next/tests/e2e/public-routes.spec.ts`

- [ ] **Step 1: Add the unit test for the builder**

Verify the returned model shape, card ordering, and route-target hint.

- [ ] **Step 2: Extend login route E2E assertions**

Assert that:
- the configurable info panel still renders
- the left card collection is visible
- the login form remains usable

- [ ] **Step 3: Run focused tests**

Run:
- `cd frontend-next && npm run test:unit -- tests/unit/login-info-panel-model.test.ts tests/unit/login-route-model.test.ts tests/unit/login-error-message.test.ts`
- `cd frontend-next && npx playwright test tests/e2e/public-routes.spec.ts --grep "renders the login route with the prototype-aligned auth layout|renders localized login errors after switching the login page to Chinese"`

Expected: PASS

## Chunk 4: Final Verification

### Task 4: Run repository-required checks for changed scope

**Files:**
- Modify only files listed in previous tasks

- [ ] **Step 1: Run lint**

Run: `cd frontend-next && npm run lint`
Expected: PASS

- [ ] **Step 2: Run unit tests**

Run: `cd frontend-next && npm run test:unit`
Expected: PASS

- [ ] **Step 3: Run E2E tests**

Run: `cd frontend-next && npm run test:e2e`
Expected: PASS

- [ ] **Step 4: Run production build**

Run: `cd frontend-next && npm run build`
Expected: PASS

- [ ] **Step 5: Run max-lines check**

Run: `./scripts/check_max_lines.sh`
Expected: PASS
