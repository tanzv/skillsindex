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
  inputType: "text" | "number" | "checkbox";
  testId: string;
}

export type RecordsDraft = Record<string, string>;

export const operationsRecordsRouteMeta: Record<RecordsRoute, RecordsRouteMeta> = {
  "/admin/ops/audit-export": {
    title: "Audit Export",
    description: "Review structured compliance export data from the operations plane.",
    endpoint: "/api/bff/admin/ops/audit-export?format=json"
  },
  "/admin/ops/recovery-drills": {
    title: "Recovery Drills",
    description: "Track recovery evidence and record new RPO/RTO drill results.",
    endpoint: "/api/bff/admin/ops/recovery-drills",
    createEndpoint: "/api/bff/admin/ops/recovery-drills/run"
  },
  "/admin/ops/releases": {
    title: "Releases",
    description: "Review release history and append new release evidence.",
    endpoint: "/api/bff/admin/ops/releases",
    createEndpoint: "/api/bff/admin/ops/releases"
  },
  "/admin/ops/change-approvals": {
    title: "Change Approvals",
    description: "Review change governance records and create new approval evidence.",
    endpoint: "/api/bff/admin/ops/change-approvals",
    createEndpoint: "/api/bff/admin/ops/change-approvals"
  },
  "/admin/ops/backup/plans": {
    title: "Backup Plans",
    description: "Inspect backup policies and upsert plan definitions.",
    endpoint: "/api/bff/admin/ops/backup/plans",
    createEndpoint: "/api/bff/admin/ops/backup/plans"
  },
  "/admin/ops/backup/runs": {
    title: "Backup Runs",
    description: "Inspect backup run history and record new run evidence.",
    endpoint: "/api/bff/admin/ops/backup/runs",
    createEndpoint: "/api/bff/admin/ops/backup/runs"
  }
};

const routeFields: Partial<Record<RecordsRoute, RecordsFormField[]>> = {
  "/admin/ops/recovery-drills": [
    { key: "rpo_hours", label: "Recovery drill RPO hours", placeholder: "RPO hours", inputType: "number", testId: "ops-records-field-rpo-hours" },
    { key: "rto_hours", label: "Recovery drill RTO hours", placeholder: "RTO hours", inputType: "number", testId: "ops-records-field-rto-hours" },
    { key: "note", label: "Recovery drill note", placeholder: "Note", inputType: "text", testId: "ops-records-field-note" }
  ],
  "/admin/ops/releases": [
    { key: "version", label: "Release version", placeholder: "Version", inputType: "text", testId: "ops-records-field-version" },
    { key: "environment", label: "Release environment", placeholder: "Environment", inputType: "text", testId: "ops-records-field-environment" },
    { key: "change_ticket", label: "Release change ticket", placeholder: "Change ticket", inputType: "text", testId: "ops-records-field-change-ticket" },
    { key: "status", label: "Release status", placeholder: "Status", inputType: "text", testId: "ops-records-field-status" },
    { key: "note", label: "Release note", placeholder: "Note", inputType: "text", testId: "ops-records-field-note" }
  ],
  "/admin/ops/change-approvals": [
    { key: "ticket_id", label: "Change approval ticket ID", placeholder: "Ticket ID", inputType: "text", testId: "ops-records-field-ticket-id" },
    { key: "reviewer", label: "Change approval reviewer", placeholder: "Reviewer", inputType: "text", testId: "ops-records-field-reviewer" },
    { key: "status", label: "Change approval status", placeholder: "Status", inputType: "text", testId: "ops-records-field-status" },
    { key: "note", label: "Change approval note", placeholder: "Note", inputType: "text", testId: "ops-records-field-note" }
  ],
  "/admin/ops/backup/plans": [
    { key: "plan_key", label: "Backup plan key", placeholder: "Plan key", inputType: "text", testId: "ops-records-field-plan-key" },
    { key: "backup_type", label: "Backup type", placeholder: "Backup type", inputType: "text", testId: "ops-records-field-backup-type" },
    { key: "schedule", label: "Backup schedule", placeholder: "Schedule", inputType: "text", testId: "ops-records-field-schedule" },
    { key: "retention_days", label: "Backup retention days", placeholder: "Retention days", inputType: "number", testId: "ops-records-field-retention-days" },
    { key: "enabled", label: "Backup plan enabled", placeholder: "Enabled", inputType: "checkbox", testId: "ops-records-field-enabled" },
    { key: "note", label: "Backup plan note", placeholder: "Note", inputType: "text", testId: "ops-records-field-note" }
  ],
  "/admin/ops/backup/runs": [
    { key: "plan_key", label: "Backup run plan key", placeholder: "Plan key", inputType: "text", testId: "ops-records-field-plan-key" },
    { key: "status", label: "Backup run status", placeholder: "Status", inputType: "text", testId: "ops-records-field-status" },
    { key: "size_mb", label: "Backup run size MB", placeholder: "Size MB", inputType: "number", testId: "ops-records-field-size-mb" },
    { key: "duration_minutes", label: "Backup run duration minutes", placeholder: "Duration minutes", inputType: "number", testId: "ops-records-field-duration-minutes" },
    { key: "note", label: "Backup run note", placeholder: "Note", inputType: "text", testId: "ops-records-field-note" }
  ]
};

export function getRecordsFormFields(route: RecordsRoute): RecordsFormField[] {
  return routeFields[route] ?? [];
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
