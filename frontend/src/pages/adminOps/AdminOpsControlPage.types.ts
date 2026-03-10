export type AdminOpsControlRoute =
  | "/admin/ops/alerts"
  | "/admin/ops/audit-export"
  | "/admin/ops/release-gates"
  | "/admin/ops/recovery-drills"
  | "/admin/ops/releases"
  | "/admin/ops/change-approvals"
  | "/admin/ops/backup/plans"
  | "/admin/ops/backup/runs";

export interface AdminOpsControlPageProps {
  route: AdminOpsControlRoute;
}

export type Primitive = string | number | boolean | null;
export type Row = Record<string, Primitive>;

export interface Metric {
  label: string;
  value: string;
  help: string;
}

export interface ViewData {
  metrics: Metric[];
  rows: Row[];
  emptyHint: string;
}

export interface RouteDefinition {
  title: string;
  subtitle: string;
  endpoint: string;
  runEndpoint?: string;
  buildView: (payload: unknown) => ViewData;
}
