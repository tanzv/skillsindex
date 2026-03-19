# Admin Route Map Baseline

## Purpose

This file captures the current `Admin` route inventory and navigation grouping in the active `frontend-next/` implementation.
It remains the operator-facing route map for ongoing admin shell and parity work.

## Source References

- `frontend-next/src/lib/routing/adminNavigation.ts`
- `frontend-next/src/components/shared/protectedTopbarConfigs.ts`
- `frontend-next/src/features/admin/renderAdminRoute.tsx`
- `frontend-next/src/features/admin/adminRouteMeta.ts`

## First-Level Navigation Sections

Current backend primary navigation is driven by `protectedWorkbenchSections`.

### Overview

- Landing route: `/admin/overview`
- Match routes:
  - `/admin/overview`
- Secondary routes:
  - `/admin/overview`

### Catalog

- Landing route: `/admin/ingestion/manual`
- Match routes:
  - `/admin/ingestion/manual`
  - `/admin/ingestion/repository`
  - `/admin/records/imports`
  - `/admin/skills`
  - `/admin/jobs`
  - `/admin/sync-jobs`
  - `/admin/sync-policy/repository`
- Secondary routes:
  - `/admin/ingestion/manual`
  - `/admin/ingestion/repository`
  - `/admin/records/imports`
  - `/admin/skills`
  - `/admin/jobs`
  - `/admin/sync-jobs`
  - `/admin/sync-policy/repository`

### Operations

- Landing route: `/admin/ops/metrics`
- Match routes:
  - `/admin/ops/metrics`
  - `/admin/integrations`
  - `/admin/ops/alerts`
  - `/admin/ops/audit-export`
  - `/admin/ops/release-gates`
  - `/admin/ops/recovery-drills`
  - `/admin/ops/releases`
  - `/admin/ops/change-approvals`
  - `/admin/ops/backup/plans`
  - `/admin/ops/backup/runs`
- Secondary routes:
  - `/admin/ops/metrics`
  - `/admin/integrations`
  - `/admin/ops/alerts`
  - `/admin/ops/audit-export`
  - `/admin/ops/release-gates`
  - `/admin/ops/recovery-drills`
  - `/admin/ops/releases`
  - `/admin/ops/change-approvals`
  - `/admin/ops/backup/plans`
  - `/admin/ops/backup/runs`

### Users

- Landing route: `/admin/accounts`
- Match routes:
  - `/admin/accounts`
  - `/admin/accounts/new`
  - `/admin/roles`
  - `/admin/roles/new`
  - `/admin/access`
  - `/admin/organizations`
- Secondary routes:
  - `/admin/accounts`
  - `/admin/roles`
  - `/admin/access`
  - `/admin/organizations`

### Security

- Landing route: `/admin/apikeys`
- Match routes:
  - `/admin/apikeys`
  - `/admin/moderation`
- Secondary routes:
  - `/admin/apikeys`
  - `/admin/moderation`

## Route-To-Page Mapping

The current protected route view dispatches admin routes as follows.

### Overview

- `/admin/overview` -> `AdminOverviewPage`

### Catalog And Records

- `/admin/ingestion/manual` -> `SkillOperationsPage`
- `/admin/ingestion/repository` -> `SkillOperationsPage`
- `/admin/records/imports` -> `SkillOperationsPage`
- `/admin/skills` -> `AdminCatalogPage`
- `/admin/jobs` -> `AdminRepositoryCatalogPage`
- `/admin/sync-jobs` -> `AdminRepositoryCatalogPage`
- `/admin/sync-policy/repository` -> `AdminRepositoryCatalogPage`

### Operations

- `/admin/integrations` -> `AdminIntegrationsPage`
- `/admin/ops/metrics` -> `AdminOpsMetricsPage`
- `/admin/ops/alerts` -> `AdminOpsControlPage`
- `/admin/ops/audit-export` -> `AdminOpsControlPage`
- `/admin/ops/release-gates` -> `AdminOpsControlPage`
- `/admin/ops/recovery-drills` -> `AdminOpsControlPage`
- `/admin/ops/releases` -> `AdminOpsControlPage`
- `/admin/ops/change-approvals` -> `AdminOpsControlPage`
- `/admin/ops/backup/plans` -> `AdminOpsControlPage`
- `/admin/ops/backup/runs` -> `AdminOpsControlPage`

### Users And Governance

- `/admin/accounts` -> `OrganizationManagementRoutePage`
- `/admin/accounts/new` -> `OrganizationManagementRoutePage`
- `/admin/roles` -> `OrganizationManagementRoutePage`
- `/admin/roles/new` -> `OrganizationManagementRoutePage`
- `/admin/access` -> `AdminAccessGovernancePage`
- `/admin/organizations` -> `OrganizationCenterPage`

### Security

- `/admin/apikeys` -> `AdminSecurityPage`
- `/admin/moderation` -> `AdminSecurityPage`

## Quick Routes In The Current Shell

Current admin quick-jump buttons are:

- `/admin/overview`
- `/admin/ingestion/repository`
- `/admin/records/imports`
- `/admin/skills`
- `/admin/sync-jobs`
- `/admin/integrations`
- `/admin/access`

## Preservation Rules For `frontend-next/`

1. First-level section labels must remain recognizable:
   - `Overview`
   - `Catalog`
   - `Operations`
   - `Users`
   - `Security`
2. The route families listed above must remain reachable from the same section.
3. Secondary route ordering must remain aligned unless a documented exception is approved.
4. Quick-route availability should remain materially equivalent.
