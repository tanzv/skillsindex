import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { AdminOperationsMessages } from "@/src/lib/i18n/protectedPageMessages.operations";

import { formatDateTime } from "../adminGovernance/shared";
import type {
  OpsAlertItem,
  OpsBackupPlanItem,
  OpsBackupRunItem,
  OpsChangeApprovalItem,
  OpsRecoveryDrillRecordItem,
  OpsReleaseGateCheckItem,
  OpsReleaseItem
} from "./types";
import type { RecordsRoute } from "./records-config";

export interface OpsDisplayChip {
  label: string;
  value: string;
}

type OpsDisplayMessages = Pick<
  AdminOperationsMessages,
  | "severityNormal"
  | "severityWarning"
  | "severityCritical"
  | "severityHigh"
  | "severityBlocked"
  | "severityUnknown"
  | "statePassed"
  | "stateBlocked"
  | "valueNotAvailable"
  | "alertMessageFallback"
  | "releaseGateMessageFallback"
  | "recordFieldLoggedAt"
  | "recordFieldOccurredAt"
  | "recordFieldReleasedAt"
  | "recordFieldActorUserId"
  | "recordValueActorTemplate"
  | "recordFieldPassed"
  | "recordValueYes"
  | "recordValueNo"
  | "recordValueStatusApproved"
  | "recordValueStatusPending"
  | "recordValueStatusSuccess"
  | "recordValueStatusFailed"
  | "recordValueStatusRollback"
  | "recordValueStatusRunning"
  | "recordValueStatusCompleted"
  | "recordValueStatusUnknown"
  | "recordValueEnvironmentProduction"
  | "recordValueEnvironmentStaging"
  | "recordValueEnvironmentUnknown"
  | "recordValueBackupTypeFull"
  | "recordValueBackupTypeSnapshot"
  | "recordValueBackupTypeIncremental"
  | "recordValueBackupTypeUnknown"
  | "recoveryDrillRpoHoursLabel"
  | "recoveryDrillRtoHoursLabel"
  | "recoveryDrillNoteLabel"
  | "releaseVersionLabel"
  | "releaseEnvironmentLabel"
  | "releaseChangeTicketLabel"
  | "releaseStatusLabel"
  | "releaseNoteLabel"
  | "changeApprovalTicketIdLabel"
  | "changeApprovalReviewerLabel"
  | "changeApprovalStatusLabel"
  | "changeApprovalNoteLabel"
  | "backupPlanKeyLabel"
  | "backupTypeLabel"
  | "backupScheduleLabel"
  | "backupRetentionDaysLabel"
  | "backupPlanEnabledLabel"
  | "backupPlanNoteLabel"
  | "backupRunPlanKeyLabel"
  | "backupRunStatusLabel"
  | "backupRunSizeMbLabel"
  | "backupRunDurationMinutesLabel"
  | "backupRunNoteLabel"
>;

type RecordsRow =
  | OpsRecoveryDrillRecordItem
  | OpsReleaseItem
  | OpsChangeApprovalItem
  | OpsBackupPlanItem
  | OpsBackupRunItem;

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

function withFallback(value: string | number | boolean | null | undefined, fallback: string): string {
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  const normalized = String(value || "").trim();
  return normalized || fallback;
}

export function resolveOpsSeverityLabel(severity: string, messages: OpsDisplayMessages): string {
  const normalized = normalizeValue(severity);

  if (!normalized || normalized === "unknown") {
    return messages.severityUnknown;
  }
  if (normalized === "critical") {
    return messages.severityCritical;
  }
  if (normalized === "high") {
    return messages.severityHigh;
  }
  if (normalized === "warning") {
    return messages.severityWarning;
  }
  if (normalized === "blocked") {
    return messages.severityBlocked;
  }
  if (normalized === "passed") {
    return messages.statePassed;
  }
  if (normalized === "normal" || normalized === "active") {
    return messages.severityNormal;
  }

  return severity.trim();
}

export function resolveOpsAlertMessage(message: string, messages: OpsDisplayMessages): string {
  return message.trim() || messages.alertMessageFallback;
}

export function resolveOpsReleaseGateMessage(message: string, messages: OpsDisplayMessages): string {
  return message.trim() || messages.releaseGateMessageFallback;
}

function resolveBooleanLabel(value: boolean, messages: OpsDisplayMessages): string {
  return value ? messages.recordValueYes : messages.recordValueNo;
}

function resolveActorLabel(actorUserId: number, messages: OpsDisplayMessages): string {
  if (!Number.isFinite(actorUserId) || actorUserId <= 0) {
    return messages.valueNotAvailable;
  }

  return messages.recordValueActorTemplate.replace("{id}", String(actorUserId));
}

function resolveStatusLabel(status: string, messages: OpsDisplayMessages): string {
  const normalized = normalizeValue(status);

  if (!normalized || normalized === "unknown") {
    return messages.recordValueStatusUnknown;
  }
  if (normalized === "approved") {
    return messages.recordValueStatusApproved;
  }
  if (normalized === "pending") {
    return messages.recordValueStatusPending;
  }
  if (normalized === "success") {
    return messages.recordValueStatusSuccess;
  }
  if (normalized === "failed" || normalized === "error") {
    return messages.recordValueStatusFailed;
  }
  if (normalized === "rollback") {
    return messages.recordValueStatusRollback;
  }
  if (normalized === "running") {
    return messages.recordValueStatusRunning;
  }
  if (normalized === "completed") {
    return messages.recordValueStatusCompleted;
  }

  return status.trim();
}

function resolveEnvironmentLabel(environment: string, messages: OpsDisplayMessages): string {
  const normalized = normalizeValue(environment);

  if (!normalized || normalized === "unknown") {
    return messages.recordValueEnvironmentUnknown;
  }
  if (normalized === "production") {
    return messages.recordValueEnvironmentProduction;
  }
  if (normalized === "staging") {
    return messages.recordValueEnvironmentStaging;
  }

  return environment.trim();
}

function resolveBackupTypeLabel(backupType: string, messages: OpsDisplayMessages): string {
  const normalized = normalizeValue(backupType);

  if (!normalized || normalized === "unknown") {
    return messages.recordValueBackupTypeUnknown;
  }
  if (normalized === "full") {
    return messages.recordValueBackupTypeFull;
  }
  if (normalized === "snapshot") {
    return messages.recordValueBackupTypeSnapshot;
  }
  if (normalized === "incremental") {
    return messages.recordValueBackupTypeIncremental;
  }

  return backupType.trim();
}

function buildChip(label: string, value: string): OpsDisplayChip {
  return { label, value };
}

function buildRecoveryDrillChips(row: OpsRecoveryDrillRecordItem, locale: PublicLocale, messages: OpsDisplayMessages): OpsDisplayChip[] {
  return [
    buildChip(messages.recordFieldLoggedAt, formatDateTime(row.loggedAt, locale, messages.valueNotAvailable)),
    buildChip(messages.recordFieldActorUserId, resolveActorLabel(row.actorUserId, messages)),
    buildChip(messages.recoveryDrillRpoHoursLabel, withFallback(row.rpoHours, messages.valueNotAvailable)),
    buildChip(messages.recoveryDrillRtoHoursLabel, withFallback(row.rtoHours, messages.valueNotAvailable)),
    buildChip(messages.recordFieldPassed, row.passed ? messages.statePassed : messages.stateBlocked),
    buildChip(messages.recoveryDrillNoteLabel, withFallback(row.note, messages.valueNotAvailable))
  ];
}

function buildReleaseChips(row: OpsReleaseItem, locale: PublicLocale, messages: OpsDisplayMessages): OpsDisplayChip[] {
  return [
    buildChip(messages.recordFieldReleasedAt, formatDateTime(row.releasedAt, locale, messages.valueNotAvailable)),
    buildChip(messages.recordFieldActorUserId, resolveActorLabel(row.actorUserId, messages)),
    buildChip(messages.releaseVersionLabel, withFallback(row.version, messages.valueNotAvailable)),
    buildChip(messages.releaseEnvironmentLabel, resolveEnvironmentLabel(row.environment, messages)),
    buildChip(messages.releaseChangeTicketLabel, withFallback(row.changeTicket, messages.valueNotAvailable)),
    buildChip(messages.releaseStatusLabel, resolveStatusLabel(row.status, messages)),
    buildChip(messages.releaseNoteLabel, withFallback(row.note, messages.valueNotAvailable))
  ];
}

function buildChangeApprovalChips(row: OpsChangeApprovalItem, locale: PublicLocale, messages: OpsDisplayMessages): OpsDisplayChip[] {
  return [
    buildChip(messages.recordFieldOccurredAt, formatDateTime(row.occurredAt, locale, messages.valueNotAvailable)),
    buildChip(messages.recordFieldActorUserId, resolveActorLabel(row.actorUserId, messages)),
    buildChip(messages.changeApprovalTicketIdLabel, withFallback(row.ticketId, messages.valueNotAvailable)),
    buildChip(messages.changeApprovalReviewerLabel, withFallback(row.reviewer, messages.valueNotAvailable)),
    buildChip(messages.changeApprovalStatusLabel, resolveStatusLabel(row.status, messages)),
    buildChip(messages.changeApprovalNoteLabel, withFallback(row.note, messages.valueNotAvailable))
  ];
}

function buildBackupPlanChips(row: OpsBackupPlanItem, locale: PublicLocale, messages: OpsDisplayMessages): OpsDisplayChip[] {
  return [
    buildChip(messages.recordFieldLoggedAt, formatDateTime(row.loggedAt, locale, messages.valueNotAvailable)),
    buildChip(messages.recordFieldActorUserId, resolveActorLabel(row.actorUserId, messages)),
    buildChip(messages.backupPlanKeyLabel, withFallback(row.planKey, messages.valueNotAvailable)),
    buildChip(messages.backupTypeLabel, resolveBackupTypeLabel(row.backupType, messages)),
    buildChip(messages.backupScheduleLabel, withFallback(row.schedule, messages.valueNotAvailable)),
    buildChip(messages.backupRetentionDaysLabel, withFallback(row.retentionDays, messages.valueNotAvailable)),
    buildChip(messages.backupPlanEnabledLabel, resolveBooleanLabel(row.enabled, messages)),
    buildChip(messages.backupPlanNoteLabel, withFallback(row.note, messages.valueNotAvailable))
  ];
}

function buildBackupRunChips(row: OpsBackupRunItem, locale: PublicLocale, messages: OpsDisplayMessages): OpsDisplayChip[] {
  return [
    buildChip(messages.recordFieldLoggedAt, formatDateTime(row.loggedAt, locale, messages.valueNotAvailable)),
    buildChip(messages.recordFieldActorUserId, resolveActorLabel(row.actorUserId, messages)),
    buildChip(messages.backupRunPlanKeyLabel, withFallback(row.planKey, messages.valueNotAvailable)),
    buildChip(messages.backupRunStatusLabel, resolveStatusLabel(row.status, messages)),
    buildChip(messages.backupRunSizeMbLabel, withFallback(row.sizeMb, messages.valueNotAvailable)),
    buildChip(messages.backupRunDurationMinutesLabel, withFallback(row.durationMinutes, messages.valueNotAvailable)),
    buildChip(messages.backupRunNoteLabel, withFallback(row.note, messages.valueNotAvailable))
  ];
}

export function buildOpsRecordChips(
  route: RecordsRoute,
  row: RecordsRow,
  locale: PublicLocale,
  messages: OpsDisplayMessages
): OpsDisplayChip[] {
  switch (route) {
    case "/admin/ops/recovery-drills":
      return buildRecoveryDrillChips(row as OpsRecoveryDrillRecordItem, locale, messages);
    case "/admin/ops/releases":
      return buildReleaseChips(row as OpsReleaseItem, locale, messages);
    case "/admin/ops/change-approvals":
      return buildChangeApprovalChips(row as OpsChangeApprovalItem, locale, messages);
    case "/admin/ops/backup/plans":
      return buildBackupPlanChips(row as OpsBackupPlanItem, locale, messages);
    case "/admin/ops/backup/runs":
      return buildBackupRunChips(row as OpsBackupRunItem, locale, messages);
    default:
      return [];
  }
}

export function resolveReleaseGateBadgeLabel(check: OpsReleaseGateCheckItem, messages: OpsDisplayMessages): string {
  return check.passed ? messages.statePassed : resolveOpsSeverityLabel(check.severity, messages);
}

export function resolveAlertCodeLabel(alert: OpsAlertItem, messages: OpsDisplayMessages): string {
  return alert.code.trim() || messages.valueNotAvailable;
}

export function resolveReleaseGateCodeLabel(check: OpsReleaseGateCheckItem, messages: OpsDisplayMessages): string {
  return check.code.trim() || messages.valueNotAvailable;
}
