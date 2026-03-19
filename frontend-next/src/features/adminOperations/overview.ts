import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { AdminOperationsMessages } from "@/src/lib/i18n/protectedPageMessages";

import { formatDateTime } from "../adminGovernance/shared";

import {
  averageMetric,
  averageRounded,
  buildOperationsLedgerOverview,
  countDistinctNonEmpty,
  countMatching,
  resolveMetricSeverity
} from "./shared";
import type {
  MetricCardItem,
  OperationsLedgerOverview,
  OpsAlertItem,
  OpsBackupPlanItem,
  OpsBackupRunItem,
  OpsChangeApprovalItem,
  OpsCollection,
  OpsMetricItem,
  OpsRecoveryDrillRecordItem,
  OpsReleaseGateSnapshot,
  OpsReleaseItem
} from "./types";

export function buildOpsMetricCards(
  payload: OpsMetricItem,
  messages: Pick<
    AdminOperationsMessages,
    | "metricOpenIncidentsLabel"
    | "metricOpenIncidentsDescription"
    | "metricPendingModerationLabel"
    | "metricPendingModerationDescription"
    | "metricUnresolvedJobsLabel"
    | "metricUnresolvedJobsDescription"
    | "metricFailedSyncRunsLabel"
    | "metricFailedSyncRunsDescription"
    | "metricDisabledAccountsLabel"
    | "metricDisabledAccountsDescription"
    | "metricStaleIntegrationsLabel"
    | "metricStaleIntegrationsDescription"
  >
): MetricCardItem[] {
  return [
    {
      label: messages.metricOpenIncidentsLabel,
      description: messages.metricOpenIncidentsDescription,
      value: payload.openIncidents,
      severity: resolveMetricSeverity(payload.openIncidents, 3, 7)
    },
    {
      label: messages.metricPendingModerationLabel,
      description: messages.metricPendingModerationDescription,
      value: payload.pendingModerationCases,
      severity: resolveMetricSeverity(payload.pendingModerationCases, 8, 20)
    },
    {
      label: messages.metricUnresolvedJobsLabel,
      description: messages.metricUnresolvedJobsDescription,
      value: payload.unresolvedJobs,
      severity: resolveMetricSeverity(payload.unresolvedJobs, 5, 12)
    },
    {
      label: messages.metricFailedSyncRunsLabel,
      description: messages.metricFailedSyncRunsDescription,
      value: payload.failedSyncRuns24h,
      severity: resolveMetricSeverity(payload.failedSyncRuns24h, 2, 6)
    },
    {
      label: messages.metricDisabledAccountsLabel,
      description: messages.metricDisabledAccountsDescription,
      value: payload.disabledAccounts,
      severity: resolveMetricSeverity(payload.disabledAccounts, 10, 25)
    },
    {
      label: messages.metricStaleIntegrationsLabel,
      description: messages.metricStaleIntegrationsDescription,
      value: payload.staleIntegrations,
      severity: resolveMetricSeverity(payload.staleIntegrations, 3, 8)
    }
  ];
}

export function buildOpsAlertsOverview(
  payload: OpsCollection<OpsAlertItem>,
  messages: Pick<AdminOperationsMessages, "alertsMetricTotalLabel" | "alertsMetricTriggeredLabel" | "alertsMetricCriticalLabel">
) {
  const triggeredCount = countMatching(payload.items, (item) => item.triggered);
  const criticalCount = countMatching(payload.items, (item) => ["critical", "high"].includes(item.severity.toLowerCase()));

  return buildOperationsLedgerOverview([
    { label: messages.alertsMetricTotalLabel, value: String(payload.total) },
    { label: messages.alertsMetricTriggeredLabel, value: String(triggeredCount) },
    { label: messages.alertsMetricCriticalLabel, value: String(criticalCount) }
  ]);
}

export function buildOpsReleaseGatesOverview(
  payload: OpsReleaseGateSnapshot,
  locale: PublicLocale,
  messages: Pick<
    AdminOperationsMessages,
    | "releaseGatesMetricChecksLabel"
    | "releaseGatesMetricPassedLabel"
    | "releaseGatesMetricBlockedLabel"
    | "valueNotAvailable"
    | "statePassed"
    | "stateBlocked"
  >
) {
  const passedCount = countMatching(payload.checks, (item) => item.passed);
  const blockedCount = payload.checks.length - passedCount;

  return {
    metrics: [
      { label: messages.releaseGatesMetricChecksLabel, value: String(payload.checks.length) },
      { label: messages.releaseGatesMetricPassedLabel, value: String(passedCount) },
      { label: messages.releaseGatesMetricBlockedLabel, value: String(blockedCount) }
    ],
    generatedAt: formatDateTime(payload.generatedAt, locale, messages.valueNotAvailable),
    overallState: payload.passed ? messages.statePassed : messages.stateBlocked
  };
}

export function buildAuditExportOverview(
  rows: Record<string, unknown>[],
  messages: Pick<AdminOperationsMessages, "recordsMetricExportedRecordsLabel" | "recordsMetricDistinctActorsLabel" | "recordsMetricActionTypesLabel">
): OperationsLedgerOverview {
  return buildOperationsLedgerOverview([
    { label: messages.recordsMetricExportedRecordsLabel, value: String(rows.length) },
    { label: messages.recordsMetricDistinctActorsLabel, value: String(countDistinctNonEmpty(rows, ["actor_user_id", "actor_id", "actor"])) },
    { label: messages.recordsMetricActionTypesLabel, value: String(countDistinctNonEmpty(rows, ["action", "event", "operation"])) }
  ]);
}

export function buildRecoveryDrillsOverview(
  payload: OpsCollection<OpsRecoveryDrillRecordItem>,
  messages: Pick<AdminOperationsMessages, "recordsMetricRecordedDrillsLabel" | "recordsMetricPassedLabel" | "recordsMetricAverageRpoLabel">
): OperationsLedgerOverview {
  const passed = countMatching(payload.items, (item) => item.passed);

  return buildOperationsLedgerOverview([
    { label: messages.recordsMetricRecordedDrillsLabel, value: String(payload.total) },
    { label: messages.recordsMetricPassedLabel, value: String(passed) },
    { label: messages.recordsMetricAverageRpoLabel, value: averageMetric(payload.items.map((item) => item.rpoHours)) }
  ]);
}

export function buildReleasesOverview(
  payload: OpsCollection<OpsReleaseItem>,
  messages: Pick<AdminOperationsMessages, "recordsMetricReleaseRecordsLabel" | "recordsMetricSuccessfulLabel" | "recordsMetricFailedLabel">
): OperationsLedgerOverview {
  const successful = countMatching(payload.items, (item) => item.status.toLowerCase() === "success");
  const failed = countMatching(payload.items, (item) => ["failed", "rollback", "error"].includes(item.status.toLowerCase()));

  return buildOperationsLedgerOverview([
    { label: messages.recordsMetricReleaseRecordsLabel, value: String(payload.total) },
    { label: messages.recordsMetricSuccessfulLabel, value: String(successful) },
    { label: messages.recordsMetricFailedLabel, value: String(failed) }
  ]);
}

export function buildChangeApprovalsOverview(
  payload: OpsCollection<OpsChangeApprovalItem>,
  messages: Pick<AdminOperationsMessages, "recordsMetricApprovalRecordsLabel" | "recordsMetricApprovedLabel" | "recordsMetricPendingLabel">
): OperationsLedgerOverview {
  const approved = countMatching(payload.items, (item) => item.status.toLowerCase() === "approved");
  const pending = countMatching(payload.items, (item) => item.status.toLowerCase() === "pending");

  return buildOperationsLedgerOverview([
    { label: messages.recordsMetricApprovalRecordsLabel, value: String(payload.total) },
    { label: messages.recordsMetricApprovedLabel, value: String(approved) },
    { label: messages.recordsMetricPendingLabel, value: String(pending) }
  ]);
}

export function buildBackupPlansOverview(
  payload: OpsCollection<OpsBackupPlanItem>,
  messages: Pick<AdminOperationsMessages, "recordsMetricBackupPlansLabel" | "recordsMetricEnabledLabel" | "recordsMetricAverageRetentionLabel">
): OperationsLedgerOverview {
  const enabled = countMatching(payload.items, (item) => item.enabled);

  return buildOperationsLedgerOverview([
    { label: messages.recordsMetricBackupPlansLabel, value: String(payload.total) },
    { label: messages.recordsMetricEnabledLabel, value: String(enabled) },
    { label: messages.recordsMetricAverageRetentionLabel, value: averageRounded(payload.items.map((item) => item.retentionDays)) }
  ]);
}

export function buildBackupRunsOverview(
  payload: OpsCollection<OpsBackupRunItem>,
  messages: Pick<AdminOperationsMessages, "recordsMetricBackupRunsLabel" | "recordsMetricSuccessfulLabel" | "recordsMetricFailedLabel">
): OperationsLedgerOverview {
  const success = countMatching(payload.items, (item) => item.status.toLowerCase() === "success");
  const failed = countMatching(payload.items, (item) => item.status.toLowerCase() === "failed");

  return buildOperationsLedgerOverview([
    { label: messages.recordsMetricBackupRunsLabel, value: String(payload.total) },
    { label: messages.recordsMetricSuccessfulLabel, value: String(success) },
    { label: messages.recordsMetricFailedLabel, value: String(failed) }
  ]);
}
