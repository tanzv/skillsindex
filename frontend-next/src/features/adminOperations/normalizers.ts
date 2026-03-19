import { asArray, asBoolean, asNumber, asObject, asString } from "../adminGovernance/shared";

import type {
  OpsAlertItem,
  OpsBackupPlanItem,
  OpsBackupRunItem,
  OpsChangeApprovalItem,
  OpsMetricItem,
  OpsRecoveryDrillRecordItem,
  OpsReleaseGateSnapshot,
  OpsReleaseItem
} from "./types";

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
      code: asString(item.code),
      severity: asString(item.severity),
      message: asString(item.message),
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
      code: asString(check.code),
      severity: asString(check.severity),
      message: asString(check.message),
      passed: asBoolean(check.passed)
    }))
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
