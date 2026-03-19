import type { AdminOperationsMessages } from "@/src/lib/i18n/protectedPageMessages.operations";

export type RecordsRoute =
  | "/admin/ops/audit-export"
  | "/admin/ops/recovery-drills"
  | "/admin/ops/releases"
  | "/admin/ops/change-approvals"
  | "/admin/ops/backup/plans"
  | "/admin/ops/backup/runs";

export interface RecordsRouteMeta {
  title: string;
  description: string;
  endpoint: string;
  createEndpoint?: string;
}

export interface RecordsFormField {
  key: string;
  label: string;
  placeholder: string;
  inputType: "text" | "number" | "checkbox" | "select";
  options?: Array<{ value: string; label: string }>;
  testId: string;
}

export type RecordsDraft = Record<string, string>;

export function getOperationsRecordsRouteMeta(
  route: RecordsRoute,
  messages: Pick<
    AdminOperationsMessages,
    | "routeAuditExportTitle"
    | "routeAuditExportDescription"
    | "routeRecoveryDrillsTitle"
    | "routeRecoveryDrillsDescription"
    | "routeReleasesTitle"
    | "routeReleasesDescription"
    | "routeChangeApprovalsTitle"
    | "routeChangeApprovalsDescription"
    | "routeBackupPlansTitle"
    | "routeBackupPlansDescription"
    | "routeBackupRunsTitle"
    | "routeBackupRunsDescription"
  >
): RecordsRouteMeta {
  switch (route) {
    case "/admin/ops/audit-export":
      return {
        title: messages.routeAuditExportTitle,
        description: messages.routeAuditExportDescription,
        endpoint: "/api/bff/admin/ops/audit-export?format=json"
      };
    case "/admin/ops/recovery-drills":
      return {
        title: messages.routeRecoveryDrillsTitle,
        description: messages.routeRecoveryDrillsDescription,
        endpoint: "/api/bff/admin/ops/recovery-drills",
        createEndpoint: "/api/bff/admin/ops/recovery-drills/run"
      };
    case "/admin/ops/releases":
      return {
        title: messages.routeReleasesTitle,
        description: messages.routeReleasesDescription,
        endpoint: "/api/bff/admin/ops/releases",
        createEndpoint: "/api/bff/admin/ops/releases"
      };
    case "/admin/ops/change-approvals":
      return {
        title: messages.routeChangeApprovalsTitle,
        description: messages.routeChangeApprovalsDescription,
        endpoint: "/api/bff/admin/ops/change-approvals",
        createEndpoint: "/api/bff/admin/ops/change-approvals"
      };
    case "/admin/ops/backup/plans":
      return {
        title: messages.routeBackupPlansTitle,
        description: messages.routeBackupPlansDescription,
        endpoint: "/api/bff/admin/ops/backup/plans",
        createEndpoint: "/api/bff/admin/ops/backup/plans"
      };
    case "/admin/ops/backup/runs":
    default:
      return {
        title: messages.routeBackupRunsTitle,
        description: messages.routeBackupRunsDescription,
        endpoint: "/api/bff/admin/ops/backup/runs",
        createEndpoint: "/api/bff/admin/ops/backup/runs"
      };
  }
}

export function getRecordsFormFields(
  route: RecordsRoute,
  messages: Pick<
    AdminOperationsMessages,
    | "recoveryDrillRpoHoursLabel"
    | "recoveryDrillRpoHoursPlaceholder"
    | "recoveryDrillRtoHoursLabel"
    | "recoveryDrillRtoHoursPlaceholder"
    | "recoveryDrillNoteLabel"
    | "recoveryDrillNotePlaceholder"
    | "releaseVersionLabel"
    | "releaseVersionPlaceholder"
    | "releaseEnvironmentLabel"
    | "releaseEnvironmentPlaceholder"
    | "releaseChangeTicketLabel"
    | "releaseChangeTicketPlaceholder"
    | "releaseStatusLabel"
    | "releaseStatusPlaceholder"
    | "recordValueEnvironmentProduction"
    | "recordValueEnvironmentStaging"
    | "recordValueStatusSuccess"
    | "recordValueStatusFailed"
    | "recordValueStatusRollback"
    | "releaseNoteLabel"
    | "releaseNotePlaceholder"
    | "changeApprovalTicketIdLabel"
    | "changeApprovalTicketIdPlaceholder"
    | "changeApprovalReviewerLabel"
    | "changeApprovalReviewerPlaceholder"
    | "changeApprovalStatusLabel"
    | "changeApprovalStatusPlaceholder"
    | "recordValueStatusApproved"
    | "recordValueStatusPending"
    | "changeApprovalNoteLabel"
    | "changeApprovalNotePlaceholder"
    | "backupPlanKeyLabel"
    | "backupPlanKeyPlaceholder"
    | "backupTypeLabel"
    | "backupTypePlaceholder"
    | "recordValueBackupTypeFull"
    | "recordValueBackupTypeSnapshot"
    | "recordValueBackupTypeIncremental"
    | "backupScheduleLabel"
    | "backupSchedulePlaceholder"
    | "backupRetentionDaysLabel"
    | "backupRetentionDaysPlaceholder"
    | "backupPlanEnabledLabel"
    | "backupPlanNoteLabel"
    | "backupPlanNotePlaceholder"
    | "backupRunPlanKeyLabel"
    | "backupRunPlanKeyPlaceholder"
    | "backupRunStatusLabel"
    | "backupRunStatusPlaceholder"
    | "recordValueStatusRunning"
    | "recordValueStatusCompleted"
    | "backupRunSizeMbLabel"
    | "backupRunSizeMbPlaceholder"
    | "backupRunDurationMinutesLabel"
    | "backupRunDurationMinutesPlaceholder"
    | "backupRunNoteLabel"
    | "backupRunNotePlaceholder"
  >
): RecordsFormField[] {
  if (route === "/admin/ops/recovery-drills") {
    return [
      {
        key: "rpo_hours",
        label: messages.recoveryDrillRpoHoursLabel,
        placeholder: messages.recoveryDrillRpoHoursPlaceholder,
        inputType: "number",
        testId: "ops-records-field-rpo-hours"
      },
      {
        key: "rto_hours",
        label: messages.recoveryDrillRtoHoursLabel,
        placeholder: messages.recoveryDrillRtoHoursPlaceholder,
        inputType: "number",
        testId: "ops-records-field-rto-hours"
      },
      {
        key: "note",
        label: messages.recoveryDrillNoteLabel,
        placeholder: messages.recoveryDrillNotePlaceholder,
        inputType: "text",
        testId: "ops-records-field-note"
      }
    ];
  }

  if (route === "/admin/ops/releases") {
    return [
      { key: "version", label: messages.releaseVersionLabel, placeholder: messages.releaseVersionPlaceholder, inputType: "text", testId: "ops-records-field-version" },
      {
        key: "environment",
        label: messages.releaseEnvironmentLabel,
        placeholder: messages.releaseEnvironmentPlaceholder,
        inputType: "select",
        options: [
          { value: "production", label: messages.recordValueEnvironmentProduction },
          { value: "staging", label: messages.recordValueEnvironmentStaging }
        ],
        testId: "ops-records-field-environment"
      },
      {
        key: "change_ticket",
        label: messages.releaseChangeTicketLabel,
        placeholder: messages.releaseChangeTicketPlaceholder,
        inputType: "text",
        testId: "ops-records-field-change-ticket"
      },
      {
        key: "status",
        label: messages.releaseStatusLabel,
        placeholder: messages.releaseStatusPlaceholder,
        inputType: "select",
        options: [
          { value: "success", label: messages.recordValueStatusSuccess },
          { value: "failed", label: messages.recordValueStatusFailed },
          { value: "rollback", label: messages.recordValueStatusRollback }
        ],
        testId: "ops-records-field-status"
      },
      { key: "note", label: messages.releaseNoteLabel, placeholder: messages.releaseNotePlaceholder, inputType: "text", testId: "ops-records-field-note" }
    ];
  }

  if (route === "/admin/ops/change-approvals") {
    return [
      {
        key: "ticket_id",
        label: messages.changeApprovalTicketIdLabel,
        placeholder: messages.changeApprovalTicketIdPlaceholder,
        inputType: "text",
        testId: "ops-records-field-ticket-id"
      },
      {
        key: "reviewer",
        label: messages.changeApprovalReviewerLabel,
        placeholder: messages.changeApprovalReviewerPlaceholder,
        inputType: "text",
        testId: "ops-records-field-reviewer"
      },
      {
        key: "status",
        label: messages.changeApprovalStatusLabel,
        placeholder: messages.changeApprovalStatusPlaceholder,
        inputType: "select",
        options: [
          { value: "approved", label: messages.recordValueStatusApproved },
          { value: "pending", label: messages.recordValueStatusPending }
        ],
        testId: "ops-records-field-status"
      },
      {
        key: "note",
        label: messages.changeApprovalNoteLabel,
        placeholder: messages.changeApprovalNotePlaceholder,
        inputType: "text",
        testId: "ops-records-field-note"
      }
    ];
  }

  if (route === "/admin/ops/backup/plans") {
    return [
      { key: "plan_key", label: messages.backupPlanKeyLabel, placeholder: messages.backupPlanKeyPlaceholder, inputType: "text", testId: "ops-records-field-plan-key" },
      {
        key: "backup_type",
        label: messages.backupTypeLabel,
        placeholder: messages.backupTypePlaceholder,
        inputType: "select",
        options: [
          { value: "full", label: messages.recordValueBackupTypeFull },
          { value: "snapshot", label: messages.recordValueBackupTypeSnapshot },
          { value: "incremental", label: messages.recordValueBackupTypeIncremental }
        ],
        testId: "ops-records-field-backup-type"
      },
      { key: "schedule", label: messages.backupScheduleLabel, placeholder: messages.backupSchedulePlaceholder, inputType: "text", testId: "ops-records-field-schedule" },
      {
        key: "retention_days",
        label: messages.backupRetentionDaysLabel,
        placeholder: messages.backupRetentionDaysPlaceholder,
        inputType: "number",
        testId: "ops-records-field-retention-days"
      },
      { key: "enabled", label: messages.backupPlanEnabledLabel, placeholder: messages.backupPlanEnabledLabel, inputType: "checkbox", testId: "ops-records-field-enabled" },
      { key: "note", label: messages.backupPlanNoteLabel, placeholder: messages.backupPlanNotePlaceholder, inputType: "text", testId: "ops-records-field-note" }
    ];
  }

  if (route === "/admin/ops/backup/runs") {
    return [
      {
        key: "plan_key",
        label: messages.backupRunPlanKeyLabel,
        placeholder: messages.backupRunPlanKeyPlaceholder,
        inputType: "text",
        testId: "ops-records-field-plan-key"
      },
      {
        key: "status",
        label: messages.backupRunStatusLabel,
        placeholder: messages.backupRunStatusPlaceholder,
        inputType: "select",
        options: [
          { value: "success", label: messages.recordValueStatusSuccess },
          { value: "failed", label: messages.recordValueStatusFailed },
          { value: "running", label: messages.recordValueStatusRunning },
          { value: "completed", label: messages.recordValueStatusCompleted }
        ],
        testId: "ops-records-field-status"
      },
      {
        key: "size_mb",
        label: messages.backupRunSizeMbLabel,
        placeholder: messages.backupRunSizeMbPlaceholder,
        inputType: "number",
        testId: "ops-records-field-size-mb"
      },
      {
        key: "duration_minutes",
        label: messages.backupRunDurationMinutesLabel,
        placeholder: messages.backupRunDurationMinutesPlaceholder,
        inputType: "number",
        testId: "ops-records-field-duration-minutes"
      },
      { key: "note", label: messages.backupRunNoteLabel, placeholder: messages.backupRunNotePlaceholder, inputType: "text", testId: "ops-records-field-note" }
    ];
  }

  return [];
}

function parseNumber(value: string | undefined) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildCreatePayload(route: RecordsRoute, draft: RecordsDraft): Record<string, unknown> {
  if (route === "/admin/ops/recovery-drills") {
    return {
      rpo_hours: parseNumber(draft.rpo_hours),
      rto_hours: parseNumber(draft.rto_hours),
      note: draft.note || ""
    };
  }

  if (route === "/admin/ops/releases") {
    return {
      version: draft.version || "",
      environment: draft.environment || "production",
      change_ticket: draft.change_ticket || "",
      status: draft.status || "success",
      note: draft.note || ""
    };
  }

  if (route === "/admin/ops/change-approvals") {
    return {
      ticket_id: draft.ticket_id || "",
      reviewer: draft.reviewer || "",
      status: draft.status || "approved",
      note: draft.note || ""
    };
  }

  if (route === "/admin/ops/backup/plans") {
    return {
      plan_key: draft.plan_key || "",
      backup_type: draft.backup_type || "full",
      schedule: draft.schedule || "",
      retention_days: parseNumber(draft.retention_days),
      enabled: draft.enabled === "true",
      note: draft.note || ""
    };
  }

  if (route === "/admin/ops/backup/runs") {
    return {
      plan_key: draft.plan_key || "",
      status: draft.status || "success",
      size_mb: parseNumber(draft.size_mb),
      duration_minutes: parseNumber(draft.duration_minutes),
      note: draft.note || ""
    };
  }

  return {};
}
