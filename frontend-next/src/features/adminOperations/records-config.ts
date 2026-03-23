import type { AdminOperationsMessages } from "@/src/lib/i18n/protectedPageMessages.operations";
import type { AdminOperationsRecordsRoute } from "@/src/lib/routing/adminRouteRegistry";

export type RecordsRoute = AdminOperationsRecordsRoute;

export interface RecordsFormField {
  key: string;
  label: string;
  placeholder: string;
  inputType: "text" | "number" | "checkbox" | "select";
  options?: Array<{ value: string; label: string }>;
  testId: string;
}

export type RecordsDraft = Record<string, string>;

type RecordsConfigMessages = Pick<
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
>;

type MutableRecordsRoute =
  | "/admin/ops/recovery-drills"
  | "/admin/ops/releases"
  | "/admin/ops/change-approvals"
  | "/admin/ops/backup/plans"
  | "/admin/ops/backup/runs";

type RecordsFieldOptionSpec = {
  value: string;
  label: (messages: RecordsConfigMessages) => string;
};

interface RecordsFieldSpec {
  key: string;
  label: (messages: RecordsConfigMessages) => string;
  placeholder: (messages: RecordsConfigMessages) => string;
  inputType: RecordsFormField["inputType"];
  testId: string;
  options?: RecordsFieldOptionSpec[];
  serialize?: (value: string | undefined, field: RecordsFieldSpec) => unknown;
}

interface RecordsRouteConfig {
  fields: RecordsFieldSpec[];
}

function parseNumber(value: string | undefined) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildSelectOptions(field: RecordsFieldSpec, messages: RecordsConfigMessages): RecordsFormField["options"] {
  return field.options?.map((option) => ({
    value: option.value,
    label: option.label(messages)
  }));
}

function buildFieldMetadata(field: RecordsFieldSpec, messages: RecordsConfigMessages): RecordsFormField {
  return {
    key: field.key,
    label: field.label(messages),
    placeholder: field.placeholder(messages),
    inputType: field.inputType,
    options: buildSelectOptions(field, messages),
    testId: field.testId
  };
}

function buildDefaultFieldValue(field: RecordsFieldSpec, value: string | undefined): unknown {
  if (field.inputType === "number") {
    return parseNumber(value);
  }

  if (field.inputType === "checkbox") {
    return value === "true";
  }

  if (field.inputType === "select") {
    return value || field.options?.[0]?.value || "";
  }

  return value || "";
}

function buildFieldPayloadValue(field: RecordsFieldSpec, draft: RecordsDraft): unknown {
  const value = draft[field.key];
  return field.serialize ? field.serialize(value, field) : buildDefaultFieldValue(field, value);
}

const recordsRouteConfigs: Record<MutableRecordsRoute, RecordsRouteConfig> = {
  "/admin/ops/recovery-drills": {
    fields: [
      {
        key: "rpo_hours",
        label: (messages) => messages.recoveryDrillRpoHoursLabel,
        placeholder: (messages) => messages.recoveryDrillRpoHoursPlaceholder,
        inputType: "number",
        testId: "ops-records-field-rpo-hours"
      },
      {
        key: "rto_hours",
        label: (messages) => messages.recoveryDrillRtoHoursLabel,
        placeholder: (messages) => messages.recoveryDrillRtoHoursPlaceholder,
        inputType: "number",
        testId: "ops-records-field-rto-hours"
      },
      {
        key: "note",
        label: (messages) => messages.recoveryDrillNoteLabel,
        placeholder: (messages) => messages.recoveryDrillNotePlaceholder,
        inputType: "text",
        testId: "ops-records-field-note"
      }
    ]
  },
  "/admin/ops/releases": {
    fields: [
      {
        key: "version",
        label: (messages) => messages.releaseVersionLabel,
        placeholder: (messages) => messages.releaseVersionPlaceholder,
        inputType: "text",
        testId: "ops-records-field-version"
      },
      {
        key: "environment",
        label: (messages) => messages.releaseEnvironmentLabel,
        placeholder: (messages) => messages.releaseEnvironmentPlaceholder,
        inputType: "select",
        testId: "ops-records-field-environment",
        options: [
          { value: "production", label: (messages) => messages.recordValueEnvironmentProduction },
          { value: "staging", label: (messages) => messages.recordValueEnvironmentStaging }
        ]
      },
      {
        key: "change_ticket",
        label: (messages) => messages.releaseChangeTicketLabel,
        placeholder: (messages) => messages.releaseChangeTicketPlaceholder,
        inputType: "text",
        testId: "ops-records-field-change-ticket"
      },
      {
        key: "status",
        label: (messages) => messages.releaseStatusLabel,
        placeholder: (messages) => messages.releaseStatusPlaceholder,
        inputType: "select",
        testId: "ops-records-field-status",
        options: [
          { value: "success", label: (messages) => messages.recordValueStatusSuccess },
          { value: "failed", label: (messages) => messages.recordValueStatusFailed },
          { value: "rollback", label: (messages) => messages.recordValueStatusRollback }
        ]
      },
      {
        key: "note",
        label: (messages) => messages.releaseNoteLabel,
        placeholder: (messages) => messages.releaseNotePlaceholder,
        inputType: "text",
        testId: "ops-records-field-note"
      }
    ]
  },
  "/admin/ops/change-approvals": {
    fields: [
      {
        key: "ticket_id",
        label: (messages) => messages.changeApprovalTicketIdLabel,
        placeholder: (messages) => messages.changeApprovalTicketIdPlaceholder,
        inputType: "text",
        testId: "ops-records-field-ticket-id"
      },
      {
        key: "reviewer",
        label: (messages) => messages.changeApprovalReviewerLabel,
        placeholder: (messages) => messages.changeApprovalReviewerPlaceholder,
        inputType: "text",
        testId: "ops-records-field-reviewer"
      },
      {
        key: "status",
        label: (messages) => messages.changeApprovalStatusLabel,
        placeholder: (messages) => messages.changeApprovalStatusPlaceholder,
        inputType: "select",
        testId: "ops-records-field-status",
        options: [
          { value: "approved", label: (messages) => messages.recordValueStatusApproved },
          { value: "pending", label: (messages) => messages.recordValueStatusPending }
        ]
      },
      {
        key: "note",
        label: (messages) => messages.changeApprovalNoteLabel,
        placeholder: (messages) => messages.changeApprovalNotePlaceholder,
        inputType: "text",
        testId: "ops-records-field-note"
      }
    ]
  },
  "/admin/ops/backup/plans": {
    fields: [
      {
        key: "plan_key",
        label: (messages) => messages.backupPlanKeyLabel,
        placeholder: (messages) => messages.backupPlanKeyPlaceholder,
        inputType: "text",
        testId: "ops-records-field-plan-key"
      },
      {
        key: "backup_type",
        label: (messages) => messages.backupTypeLabel,
        placeholder: (messages) => messages.backupTypePlaceholder,
        inputType: "select",
        testId: "ops-records-field-backup-type",
        options: [
          { value: "full", label: (messages) => messages.recordValueBackupTypeFull },
          { value: "snapshot", label: (messages) => messages.recordValueBackupTypeSnapshot },
          { value: "incremental", label: (messages) => messages.recordValueBackupTypeIncremental }
        ]
      },
      {
        key: "schedule",
        label: (messages) => messages.backupScheduleLabel,
        placeholder: (messages) => messages.backupSchedulePlaceholder,
        inputType: "text",
        testId: "ops-records-field-schedule"
      },
      {
        key: "retention_days",
        label: (messages) => messages.backupRetentionDaysLabel,
        placeholder: (messages) => messages.backupRetentionDaysPlaceholder,
        inputType: "number",
        testId: "ops-records-field-retention-days"
      },
      {
        key: "enabled",
        label: (messages) => messages.backupPlanEnabledLabel,
        placeholder: (messages) => messages.backupPlanEnabledLabel,
        inputType: "checkbox",
        testId: "ops-records-field-enabled"
      },
      {
        key: "note",
        label: (messages) => messages.backupPlanNoteLabel,
        placeholder: (messages) => messages.backupPlanNotePlaceholder,
        inputType: "text",
        testId: "ops-records-field-note"
      }
    ]
  },
  "/admin/ops/backup/runs": {
    fields: [
      {
        key: "plan_key",
        label: (messages) => messages.backupRunPlanKeyLabel,
        placeholder: (messages) => messages.backupRunPlanKeyPlaceholder,
        inputType: "text",
        testId: "ops-records-field-plan-key"
      },
      {
        key: "status",
        label: (messages) => messages.backupRunStatusLabel,
        placeholder: (messages) => messages.backupRunStatusPlaceholder,
        inputType: "select",
        testId: "ops-records-field-status",
        options: [
          { value: "success", label: (messages) => messages.recordValueStatusSuccess },
          { value: "failed", label: (messages) => messages.recordValueStatusFailed },
          { value: "running", label: (messages) => messages.recordValueStatusRunning },
          { value: "completed", label: (messages) => messages.recordValueStatusCompleted }
        ]
      },
      {
        key: "size_mb",
        label: (messages) => messages.backupRunSizeMbLabel,
        placeholder: (messages) => messages.backupRunSizeMbPlaceholder,
        inputType: "number",
        testId: "ops-records-field-size-mb"
      },
      {
        key: "duration_minutes",
        label: (messages) => messages.backupRunDurationMinutesLabel,
        placeholder: (messages) => messages.backupRunDurationMinutesPlaceholder,
        inputType: "number",
        testId: "ops-records-field-duration-minutes"
      },
      {
        key: "note",
        label: (messages) => messages.backupRunNoteLabel,
        placeholder: (messages) => messages.backupRunNotePlaceholder,
        inputType: "text",
        testId: "ops-records-field-note"
      }
    ]
  }
};

function resolveRecordsRouteConfig(route: RecordsRoute): RecordsRouteConfig | null {
  return route in recordsRouteConfigs ? recordsRouteConfigs[route as MutableRecordsRoute] : null;
}

export function getRecordsFormFields(route: RecordsRoute, messages: RecordsConfigMessages): RecordsFormField[] {
  const config = resolveRecordsRouteConfig(route);
  return config ? config.fields.map((field) => buildFieldMetadata(field, messages)) : [];
}

export function buildCreatePayload(route: RecordsRoute, draft: RecordsDraft): Record<string, unknown> {
  const config = resolveRecordsRouteConfig(route);
  if (!config) {
    return {};
  }

  return Object.fromEntries(config.fields.map((field) => [field.key, buildFieldPayloadValue(field, draft)]));
}
