import type { WorkbenchDefinition } from "../accountWorkbench/ConsoleWorkbench";

export type AdminRoute =
  | "/admin/overview"
  | "/admin/skills"
  | "/admin/integrations"
  | "/admin/ops/metrics"
  | "/admin/ops/alerts"
  | "/admin/ops/audit-export"
  | "/admin/ops/release-gates"
  | "/admin/ops/recovery-drills"
  | "/admin/ops/releases"
  | "/admin/ops/change-approvals"
  | "/admin/ops/backup/plans"
  | "/admin/ops/backup/runs"
  | "/admin/jobs"
  | "/admin/sync-jobs"
  | "/admin/sync-policy/repository"
  | "/admin/apikeys"
  | "/admin/access"
  | "/admin/organizations"
  | "/admin/moderation";

export type AdminOpsRoute = Extract<AdminRoute, `/admin/ops/${string}`>;

export type AdminCatalogRoute =
  | "/admin/overview"
  | "/admin/skills"
  | "/admin/integrations"
  | "/admin/jobs"
  | "/admin/sync-jobs"
  | "/admin/sync-policy/repository";

export type AdminGovernanceRoute = Exclude<AdminRoute, AdminOpsRoute | AdminCatalogRoute>;

export type AdminWorkbenchDefinitionMap = Record<AdminRoute, WorkbenchDefinition>;
