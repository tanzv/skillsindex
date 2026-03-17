# Admin Parity Checklist

## Purpose

Use this checklist when implementing or reviewing any `frontend-next/` admin route.
Every admin route must pass this checklist before it is considered migration-complete.

## Global Parity Gates

Each admin route must preserve:

1. entry point parity
2. first-level navigation section parity
3. second-level navigation placement parity
4. primary layout pattern parity
5. action placement parity

## Route Inventory

The following routes are in admin parity scope:

1. `/admin/overview`
2. `/admin/ingestion/manual`
3. `/admin/ingestion/repository`
4. `/admin/records/imports`
5. `/admin/skills`
6. `/admin/jobs`
7. `/admin/sync-jobs`
8. `/admin/sync-policy/repository`
9. `/admin/integrations`
10. `/admin/ops/metrics`
11. `/admin/ops/alerts`
12. `/admin/ops/audit-export`
13. `/admin/ops/release-gates`
14. `/admin/ops/recovery-drills`
15. `/admin/ops/releases`
16. `/admin/ops/change-approvals`
17. `/admin/ops/backup/plans`
18. `/admin/ops/backup/runs`
19. `/admin/accounts`
20. `/admin/accounts/new`
21. `/admin/roles`
22. `/admin/roles/new`
23. `/admin/access`
24. `/admin/organizations`
25. `/admin/apikeys`
26. `/admin/moderation`

## Review Checklist Per Route

For each migrated admin route, verify all items below.

### A. Entry And Navigation

- [ ] The route is reachable from the same first-level section as the current frontend.
- [ ] The route appears in the same second-level group position or an explicitly approved equivalent.
- [ ] The active first-level section is highlighted correctly.
- [ ] The active second-level item is highlighted correctly.
- [ ] Quick-jump links remain materially equivalent when applicable.

### B. Layout Pattern

- [ ] The page keeps the same dominant pattern:
  - dashboard
  - list-first
  - form-first
  - operations/control surface
  - governance surface
- [ ] The primary work region remains in the same relative position.
- [ ] The secondary/context region remains in the same relative position when present.
- [ ] The page does not collapse a two-region admin layout into a single undifferentiated column without approval.

### C. Action Placement

- [ ] Primary actions remain close to the record, form, or workflow they affect.
- [ ] Governance-sensitive actions remain isolated from passive metadata.
- [ ] Filters remain above or adjacent to lists where the current layout expects them.

### D. Functional Continuity

- [ ] The route can load its baseline dataset or fallback state.
- [ ] The route can trigger its primary action path.
- [ ] Any detail or context panel still supports the same operator decision flow.

## Sign-Off Rule

An admin route is accepted only when:

1. unit coverage for navigation/layout logic exists
2. targeted E2E or integration coverage exists
3. the route passes all parity checklist items above
4. any deviations are documented and explicitly approved
