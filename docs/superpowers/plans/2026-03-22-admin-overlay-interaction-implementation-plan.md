# Admin Overlay Interaction Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为后台管理型页面建立统一的 drawer / modal 交互机制，并优先完成 admin ingestion 改造，同时让已有 admin 子页面向统一 overlay 状态模型收敛。

**Architecture:** 在保留 `DetailFormSurface` 为基础承载层的前提下，新增 admin overlay 组合层与本地状态 hook。feature 继续拥有业务副作用和选中记录逻辑；共享层只负责承载容器、统一 header/footer 结构、确认弹层和 token-first 视觉契约。

**Tech Stack:** Next.js 16, React 19, TypeScript, SCSS modules, Vitest, Playwright.

---

## File Structure

### New files

- `frontend-next/src/components/admin/AdminOverlaySurface.tsx`
  - 提供 admin 语义化 drawer / modal 组合层。
- `frontend-next/src/components/admin/AdminOverlaySurface.module.scss`
  - overlay 组合层样式节奏、header/body/footer 结构。
- `frontend-next/src/lib/admin/useAdminOverlayState.ts`
  - 统一的本地 overlay 状态 hook。
- `frontend-next/tests/unit/admin-overlay-state.test.ts`
  - hook 行为测试。
- `frontend-next/tests/unit/admin-overlay-surface.test.tsx`
  - drawer / modal contract 测试。
- `frontend-next/tests/e2e/authenticated-admin-ingestion-overlay.spec.ts`
  - ingestion overlay 关键流验证。

### Modified files

- `docs/superpowers/specs/2026-03-22-admin-overlay-interaction-design.md`
  - 交互规范文档。
- `frontend-next/src/features/adminIngestion/AdminIngestionPage.tsx`
  - 收敛 overlay 状态与动作编排。
- `frontend-next/src/features/adminIngestion/AdminIngestionContent.tsx`
  - 主页面只保留列表/指标/入口，overlay 由外层统一挂载。
- `frontend-next/src/features/adminIngestion/AdminIngestionViewProps.ts`
  - 明确 overlay 相关 props 契约。
- `frontend-next/src/features/adminIngestion/AdminIngestionViews.tsx`
  - 移除页面内嵌大表单，改为入口 + 列表 + detail 触发结构。
- `frontend-next/src/features/adminIngestion/AdminIngestionFormCards.tsx`
  - 转为 overlay 内表单内容片段。
- `frontend-next/src/features/adminIngestion/AdminIngestionPanels.tsx`
  - 为 sync run / import job 提供 detail trigger。
- `frontend-next/src/features/adminIngestion/shared.tsx`
  - 统一 detail summary 和记录卡片入口。
- `frontend-next/src/features/adminIngestion/model.ts`
  - 增加 overlay entity helper / selected item resolver。
- `frontend-next/src/features/adminApiKeys/AdminAPIKeysPage.tsx`
  - 收敛 create/detail/confirm 为统一 overlay state 模型。
- `frontend-next/src/features/adminGovernance/AdminModerationPage.tsx`
  - 收敛 create/detail/confirm 状态。
- `frontend-next/src/features/adminGovernance/AdminOrganizationsPage.tsx`
  - 收敛 create/detail/member detail/confirm 状态。
- `frontend-next/src/features/adminAccounts/AdminAccountsPage.tsx`
  - 接入统一 overlay state 模型。
- `frontend-next/tests/unit/admin-ingestion-content.test.ts`
  - 更新主页面行为与 overlay 入口断言。
- `frontend-next/tests/unit/admin-apikeys-page.test.ts`
  - 验证统一 overlay 状态。
- `frontend-next/tests/unit/admin-moderation-content.test.ts`
  - 验证 detail / confirm 入口。
- `frontend-next/tests/unit/admin-organizations-content.test.ts`
  - 验证统一 overlay 接口。

## Chunk 1: Shared Overlay Contract

### Task 1: 锁定共享 overlay 状态与 surface contract

**Files:**
- Create: `frontend-next/tests/unit/admin-overlay-state.test.ts`
- Create: `frontend-next/tests/unit/admin-overlay-surface.test.tsx`
- Modify: `frontend-next/tests/unit/detail-form-surface.test.tsx`

- [ ] **Step 1: Write the failing state test**
- [ ] **Step 2: Run the focused unit test and verify RED**
- [ ] **Step 3: Write the failing surface test for drawer vs modal semantics**
- [ ] **Step 4: Run the focused surface test and verify RED**
- [ ] **Step 5: Commit the failing overlay contract tests**

### Task 2: 实现 admin overlay 组合层与本地状态 hook

**Files:**
- Create: `frontend-next/src/lib/admin/useAdminOverlayState.ts`
- Create: `frontend-next/src/components/admin/AdminOverlaySurface.tsx`
- Create: `frontend-next/src/components/admin/AdminOverlaySurface.module.scss`

- [ ] **Step 1: Implement minimal overlay state hook**
- [ ] **Step 2: Implement admin drawer/modal wrapper on top of DetailFormSurface**
- [ ] **Step 3: Keep focus, close, footer, and token contracts explicit**
- [ ] **Step 4: Run focused unit tests and verify GREEN**
- [ ] **Step 5: Commit the shared overlay implementation**

## Chunk 2: Admin Ingestion Migration

### Task 3: 先用测试锁定 ingestion 的新交互模式

**Files:**
- Modify: `frontend-next/tests/unit/admin-ingestion-content.test.ts`
- Create: `frontend-next/tests/e2e/authenticated-admin-ingestion-overlay.spec.ts`

- [ ] **Step 1: Add failing unit assertions for create/detail entry points**
- [ ] **Step 2: Add failing unit assertions for sync run/import job detail open actions**
- [ ] **Step 3: Run focused unit tests and verify RED**
- [ ] **Step 4: Add focused ingestion e2e checks for drawer open/close flows**
- [ ] **Step 5: Run focused e2e spec and verify RED**
- [ ] **Step 6: Commit the failing ingestion interaction tests**

### Task 4: 将 admin ingestion 从页面内嵌表单迁移到 overlay workflow

**Files:**
- Modify: `frontend-next/src/features/adminIngestion/AdminIngestionPage.tsx`
- Modify: `frontend-next/src/features/adminIngestion/AdminIngestionContent.tsx`
- Modify: `frontend-next/src/features/adminIngestion/AdminIngestionViewProps.ts`
- Modify: `frontend-next/src/features/adminIngestion/AdminIngestionViews.tsx`
- Modify: `frontend-next/src/features/adminIngestion/AdminIngestionFormCards.tsx`
- Modify: `frontend-next/src/features/adminIngestion/AdminIngestionPanels.tsx`
- Modify: `frontend-next/src/features/adminIngestion/shared.tsx`
- Modify: `frontend-next/src/features/adminIngestion/model.ts`

- [ ] **Step 1: Introduce one overlay state per ingestion route family**
- [ ] **Step 2: Move create forms into create drawers**
- [ ] **Step 3: Add detail drawers for skills, sync runs, and import jobs**
- [ ] **Step 4: Add confirm modal for retry/cancel actions**
- [ ] **Step 5: Re-run focused ingestion unit tests**
- [ ] **Step 6: Re-run focused ingestion e2e test**
- [ ] **Step 7: Commit the ingestion migration**

## Chunk 3: Existing Admin Pages Convergence

### Task 5: 收敛 admin api keys 到统一 overlay state

**Files:**
- Modify: `frontend-next/src/features/adminApiKeys/AdminAPIKeysPage.tsx`
- Modify: `frontend-next/tests/unit/admin-apikeys-page.test.ts`

- [ ] **Step 1: Write failing test for unified overlay state transitions**
- [ ] **Step 2: Run focused test and verify RED**
- [ ] **Step 3: Replace scattered drawer/detail flags with unified overlay state**
- [ ] **Step 4: Add confirm modal handling for revoke/rotate if missing**
- [ ] **Step 5: Re-run focused test and verify GREEN**
- [ ] **Step 6: Commit the api keys convergence**

### Task 6: 收敛 moderation / organizations / accounts 到统一 overlay state

**Files:**
- Modify: `frontend-next/src/features/adminGovernance/AdminModerationPage.tsx`
- Modify: `frontend-next/src/features/adminGovernance/AdminOrganizationsPage.tsx`
- Modify: `frontend-next/src/features/adminAccounts/AdminAccountsPage.tsx`
- Modify: `frontend-next/tests/unit/admin-moderation-content.test.ts`
- Modify: `frontend-next/tests/unit/admin-organizations-content.test.ts`
- Modify: `frontend-next/tests/unit/admin-accounts-content.test.ts`

- [ ] **Step 1: Write failing tests for shared overlay semantics**
- [ ] **Step 2: Run focused tests and verify RED**
- [ ] **Step 3: Refactor page-level boolean flags into unified overlay state**
- [ ] **Step 4: Preserve existing feature behavior while normalizing open/close semantics**
- [ ] **Step 5: Re-run focused tests and verify GREEN**
- [ ] **Step 6: Commit the admin page convergence**

## Chunk 4: Verification

### Task 7: Run full changed-scope verification and collect evidence

**Files:**
- Verification only

- [ ] **Step 1: Run lint**
  - `cd frontend-next && npm run lint`
- [ ] **Step 2: Run changed-scope unit tests**
  - `cd frontend-next && npm run test:unit -- tests/unit/admin-overlay-state.test.ts tests/unit/admin-overlay-surface.test.tsx tests/unit/admin-ingestion-content.test.ts tests/unit/admin-apikeys-page.test.ts tests/unit/admin-moderation-content.test.ts tests/unit/admin-organizations-content.test.ts tests/unit/admin-accounts-content.test.ts`
- [ ] **Step 3: Run focused e2e specs**
  - `cd frontend-next && npm run test:e2e -- authenticated-admin-ingestion-overlay.spec.ts authenticated-management.spec.ts authenticated-governance.spec.ts`
- [ ] **Step 4: Run production build**
  - `cd frontend-next && npm run build`
- [ ] **Step 5: Run max-lines check**
  - `cd /Users/tanzv/Development/Git/skillsindex && ./scripts/check_max_lines.sh`
- [ ] **Step 6: Record any Playwright artifacts under `frontend-next/test-results/` if failures occur**
- [ ] **Step 7: Summarize residual risks before claiming completion**
