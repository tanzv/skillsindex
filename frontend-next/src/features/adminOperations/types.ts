export type {
  AdminOperationsDashboardRoute,
  AdminOperationsRecordsRoute,
  AdminOperationsRoute
} from "@/src/lib/routing/adminRouteRegistry";

export interface OpsMetricItem {
  openIncidents: number;
  pendingModerationCases: number;
  unresolvedJobs: number;
  failedSyncRuns24h: number;
  disabledAccounts: number;
  staleIntegrations: number;
  totalAuditLogs24h: number;
  totalSyncRuns24h: number;
  retentionDays: number;
}

export interface OpsAlertItem {
  code: string;
  severity: string;
  message: string;
  triggered: boolean;
}

export interface OpsReleaseGateCheckItem {
  code: string;
  severity: string;
  message: string;
  passed: boolean;
}

export interface OpsReleaseGateSnapshot {
  generatedAt: string;
  passed: boolean;
  checks: OpsReleaseGateCheckItem[];
}

export interface MetricCardItem {
  label: string;
  description: string;
  value: number;
  severity: "normal" | "warning" | "critical";
}

export interface OpsRecoveryDrillRecordItem {
  loggedAt: string;
  actorUserId: number;
  rpoHours: number;
  rtoHours: number;
  passed: boolean;
  note: string;
}

export interface OpsReleaseItem {
  releasedAt: string;
  actorUserId: number;
  version: string;
  environment: string;
  changeTicket: string;
  status: string;
  note: string;
}

export interface OpsChangeApprovalItem {
  occurredAt: string;
  actorUserId: number;
  ticketId: string;
  reviewer: string;
  status: string;
  note: string;
}

export interface OpsBackupPlanItem {
  loggedAt: string;
  actorUserId: number;
  planKey: string;
  backupType: string;
  schedule: string;
  retentionDays: number;
  enabled: boolean;
  note: string;
}

export interface OpsBackupRunItem {
  loggedAt: string;
  actorUserId: number;
  planKey: string;
  status: string;
  sizeMb: number;
  durationMinutes: number;
  note: string;
}

export interface OperationsLedgerOverview {
  metrics: Array<{ label: string; value: string }>;
}

export interface OpsCollection<TItem> {
  total: number;
  items: TItem[];
}
