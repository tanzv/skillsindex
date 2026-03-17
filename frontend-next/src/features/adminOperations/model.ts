import { asArray, asBoolean, asNumber, asObject, asString, formatDateTime } from "../adminGovernance/shared";

export type AdminOperationsRoute =
  | "/admin/ops/metrics"
  | "/admin/ops/alerts"
  | "/admin/ops/release-gates"
  | "/admin/ops/audit-export"
  | "/admin/ops/recovery-drills"
  | "/admin/ops/releases"
  | "/admin/ops/change-approvals"
  | "/admin/ops/backup/plans"
  | "/admin/ops/backup/runs";

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

export function normalizeOpsMetricsPayload(payload: unknown): OpsMetricItem {
  const item = asObject(asObject(payload).item);
  return {
    openIncidents: asNumber(item.open_incidents),
    pendingModerationCases: asNumber(item.pending_moderation_cases),
    unresolvedJobs: asNumber(item.unresolved_jobs),
    failedSyncRuns24h: asNumber(item.failed_sync_runs_24h),
    disabledAccounts: asNumber(item.disabled_accounts),
    staleIntegrations: asNumber(item.stale_integrations),
    totalAuditLogs24h: asNumber(item.total_audit_logs_24h),
    totalSyncRuns24h: asNumber(item.total_sync_runs_24h),
    retentionDays: asNumber(item.retention_days)
  };
}

export function normalizeOpsAlertsPayload(payload: unknown): { total: number; items: OpsAlertItem[] } {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);
  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      code: asString(item.code) || "unknown",
      severity: asString(item.severity) || "unknown",
      message: asString(item.message) || "No alert message",
      triggered: asBoolean(item.triggered)
    }))
  };
}

export function normalizeOpsReleaseGatesPayload(payload: unknown): OpsReleaseGateSnapshot {
  const item = asObject(asObject(payload).item);
  const checks = asArray<Record<string, unknown>>(item.checks);
  return {
    generatedAt: asString(item.generated_at),
    passed: asBoolean(item.passed),
    checks: checks.map((check) => ({
      code: asString(check.code) || "unknown",
      severity: asString(check.severity) || "unknown",
      message: asString(check.message) || "No release gate message",
      passed: asBoolean(check.passed)
    }))
  };
}

function getSeverity(value: number, warningAt: number, criticalAt: number): MetricCardItem["severity"] {
  if (value >= criticalAt) {
    return "critical";
  }
  if (value >= warningAt) {
    return "warning";
  }
  return "normal";
}

export function buildOpsMetricCards(payload: OpsMetricItem): MetricCardItem[] {
  return [
    {
      label: "Open Incidents",
      description: "Active incidents pending containment.",
      value: payload.openIncidents,
      severity: getSeverity(payload.openIncidents, 3, 7)
    },
    {
      label: "Pending Moderation",
      description: "Moderation backlog waiting for review.",
      value: payload.pendingModerationCases,
      severity: getSeverity(payload.pendingModerationCases, 8, 20)
    },
    {
      label: "Unresolved Jobs",
      description: "Background jobs needing intervention.",
      value: payload.unresolvedJobs,
      severity: getSeverity(payload.unresolvedJobs, 5, 12)
    },
    {
      label: "Failed Sync Runs",
      description: "Sync failures in the last 24 hours.",
      value: payload.failedSyncRuns24h,
      severity: getSeverity(payload.failedSyncRuns24h, 2, 6)
    },
    {
      label: "Disabled Accounts",
      description: "Accounts blocked by policy or anomaly.",
      value: payload.disabledAccounts,
      severity: getSeverity(payload.disabledAccounts, 10, 25)
    },
    {
      label: "Stale Integrations",
      description: "Connectors with delayed heartbeats.",
      value: payload.staleIntegrations,
      severity: getSeverity(payload.staleIntegrations, 3, 8)
    }
  ];
}

export function buildOpsAlertsOverview(payload: { total: number; items: OpsAlertItem[] }) {
  const triggeredCount = payload.items.filter((item) => item.triggered).length;
  const criticalCount = payload.items.filter((item) => ["critical", "high"].includes(item.severity.toLowerCase())).length;
  return {
    metrics: [
      { label: "Total Alerts", value: String(payload.total) },
      { label: "Triggered", value: String(triggeredCount) },
      { label: "Critical", value: String(criticalCount) }
    ]
  };
}

export function buildOpsReleaseGatesOverview(payload: OpsReleaseGateSnapshot) {
  const passedCount = payload.checks.filter((item) => item.passed).length;
  const blockedCount = payload.checks.length - passedCount;
  return {
    metrics: [
      { label: "Gate Checks", value: String(payload.checks.length) },
      { label: "Passed", value: String(passedCount) },
      { label: "Blocked", value: String(blockedCount) }
    ],
    generatedAt: formatDateTime(payload.generatedAt),
    overallState: payload.passed ? "passed" : "blocked"
  };
}

export function normalizeOpsAuditExportPayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => asObject(item));
  }

  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);
  if (items.length > 0) {
    return items;
  }
  return Object.keys(record).length > 0 ? [record] : [];
}

export function normalizeOpsRecoveryDrillsPayload(payload: unknown): { total: number; items: OpsRecoveryDrillRecordItem[] } {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);
  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      loggedAt: asString(item.logged_at),
      actorUserId: asNumber(item.actor_user_id),
      rpoHours: asNumber(item.rpo_hours),
      rtoHours: asNumber(item.rto_hours),
      passed: asBoolean(item.passed),
      note: asString(item.note)
    }))
  };
}

export function normalizeOpsReleasesPayload(payload: unknown): { total: number; items: OpsReleaseItem[] } {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);
  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      releasedAt: asString(item.released_at),
      actorUserId: asNumber(item.actor_user_id),
      version: asString(item.version),
      environment: asString(item.environment),
      changeTicket: asString(item.change_ticket),
      status: asString(item.status),
      note: asString(item.note)
    }))
  };
}

export function normalizeOpsChangeApprovalsPayload(payload: unknown): { total: number; items: OpsChangeApprovalItem[] } {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);
  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      occurredAt: asString(item.occurred_at),
      actorUserId: asNumber(item.actor_user_id),
      ticketId: asString(item.ticket_id),
      reviewer: asString(item.reviewer),
      status: asString(item.status),
      note: asString(item.note)
    }))
  };
}

export function normalizeOpsBackupPlansPayload(payload: unknown): { total: number; items: OpsBackupPlanItem[] } {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);
  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      loggedAt: asString(item.logged_at),
      actorUserId: asNumber(item.actor_user_id),
      planKey: asString(item.plan_key),
      backupType: asString(item.backup_type),
      schedule: asString(item.schedule),
      retentionDays: asNumber(item.retention_days),
      enabled: asBoolean(item.enabled),
      note: asString(item.note)
    }))
  };
}

export function normalizeOpsBackupRunsPayload(payload: unknown): { total: number; items: OpsBackupRunItem[] } {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);
  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      loggedAt: asString(item.logged_at),
      actorUserId: asNumber(item.actor_user_id),
      planKey: asString(item.plan_key),
      status: asString(item.status),
      sizeMb: asNumber(item.size_mb),
      durationMinutes: asNumber(item.duration_minutes),
      note: asString(item.note)
    }))
  };
}

export function buildAuditExportOverview(rows: Record<string, unknown>[]): OperationsLedgerOverview {
  const distinctActors = new Set(rows.map((row) => asString(row.actor_user_id || row.actor_id || row.actor))).size;
  const distinctActions = new Set(rows.map((row) => asString(row.action || row.event || row.operation))).size;
  return {
    metrics: [
      { label: "Exported Records", value: String(rows.length) },
      { label: "Distinct Actors", value: String(distinctActors) },
      { label: "Action Types", value: String(distinctActions) }
    ]
  };
}

export function buildRecoveryDrillsOverview(payload: { total: number; items: OpsRecoveryDrillRecordItem[] }): OperationsLedgerOverview {
  const passed = payload.items.filter((item) => item.passed).length;
  return {
    metrics: [
      { label: "Recorded Drills", value: String(payload.total) },
      { label: "Passed", value: String(passed) },
      { label: "Average RPO", value: payload.items.length ? (payload.items.reduce((sum, item) => sum + item.rpoHours, 0) / payload.items.length).toFixed(1) : "0.0" }
    ]
  };
}

export function buildReleasesOverview(payload: { total: number; items: OpsReleaseItem[] }): OperationsLedgerOverview {
  const successful = payload.items.filter((item) => item.status.toLowerCase() === "success").length;
  const failed = payload.items.filter((item) => ["failed", "rollback", "error"].includes(item.status.toLowerCase())).length;
  return {
    metrics: [
      { label: "Release Records", value: String(payload.total) },
      { label: "Successful", value: String(successful) },
      { label: "Failed", value: String(failed) }
    ]
  };
}

export function buildChangeApprovalsOverview(payload: { total: number; items: OpsChangeApprovalItem[] }): OperationsLedgerOverview {
  const approved = payload.items.filter((item) => item.status.toLowerCase() === "approved").length;
  const pending = payload.items.filter((item) => item.status.toLowerCase() === "pending").length;
  return {
    metrics: [
      { label: "Approval Records", value: String(payload.total) },
      { label: "Approved", value: String(approved) },
      { label: "Pending", value: String(pending) }
    ]
  };
}

export function buildBackupPlansOverview(payload: { total: number; items: OpsBackupPlanItem[] }): OperationsLedgerOverview {
  const enabled = payload.items.filter((item) => item.enabled).length;
  return {
    metrics: [
      { label: "Backup Plans", value: String(payload.total) },
      { label: "Enabled", value: String(enabled) },
      { label: "Average Retention", value: payload.items.length ? String(Math.round(payload.items.reduce((sum, item) => sum + item.retentionDays, 0) / payload.items.length)) : "0" }
    ]
  };
}

export function buildBackupRunsOverview(payload: { total: number; items: OpsBackupRunItem[] }): OperationsLedgerOverview {
  const success = payload.items.filter((item) => item.status.toLowerCase() === "success").length;
  const failed = payload.items.filter((item) => item.status.toLowerCase() === "failed").length;
  return {
    metrics: [
      { label: "Backup Runs", value: String(payload.total) },
      { label: "Successful", value: String(success) },
      { label: "Failed", value: String(failed) }
    ]
  };
}
