import type { WorkbenchDefinition } from "./types";
import { buildPathWithQuery, parseScopes, requiredID } from "./utils";

export const adminOperationsWorkbenchDefinitions: Record<string, WorkbenchDefinition> = {
  "/admin/ops/release-gates": {
    title: "Release Gates",
    subtitle: "Review gate checks and trigger on-demand gate run.",
    resources: [{ key: "releaseGates", title: "Release Gate Snapshot", buildPath: () => "/api/v1/admin/ops/release-gates" }],
    actions: [
      {
        key: "runReleaseGates",
        title: "Run Release Gates",
        submitText: "Run",
        buildPath: () => "/api/v1/admin/ops/release-gates/run",
        refreshResources: ["releaseGates"]
      }
    ]
  },
  "/admin/ops/metrics": {
    title: "Operations Metrics",
    subtitle: "Latency, throughput, error rates, and sync health baseline.",
    resources: [{ key: "metrics", title: "Metrics Snapshot", buildPath: () => "/api/v1/admin/ops/metrics" }]
  },
  "/admin/ops/alerts": {
    title: "Operations Alerts",
    subtitle: "Derived alerts from reliability and governance thresholds.",
    resources: [{ key: "alerts", title: "Alert Snapshot", buildPath: () => "/api/v1/admin/ops/alerts" }]
  },
  "/admin/ops/audit-export": {
    title: "Audit Export",
    subtitle: "Query audit export payload in a JSON window for compliance checks.",
    resources: [
      {
        key: "auditExport",
        title: "Audit Export JSON",
        fields: [
          { key: "from", label: "From", type: "text", placeholder: "2026-01-01" },
          { key: "to", label: "To", type: "text", placeholder: "2026-01-31" }
        ],
        buildPath: (values) => buildPathWithQuery("/api/v1/admin/ops/audit-export", values)
      }
    ]
  },
  "/admin/ops/recovery-drills": {
    title: "Recovery Drills",
    subtitle: "Track RPO/RTO drill results and append new evidence.",
    resources: [
      { key: "recoveryDrills", title: "Recovery Drill Records", buildPath: (values) => buildPathWithQuery("/api/v1/admin/ops/recovery-drills", values) }
    ],
    actions: [
      {
        key: "recordRecoveryDrill",
        title: "Record Drill",
        submitText: "Create Record",
        fields: [
          { key: "rpo_hours", label: "RPO Hours", type: "number", required: true, min: 0.1, step: 0.1 },
          { key: "rto_hours", label: "RTO Hours", type: "number", required: true, min: 0.1, step: 0.1 },
          { key: "note", label: "Note", type: "textarea" }
        ],
        buildPath: () => "/api/v1/admin/ops/recovery-drills/run",
        refreshResources: ["recoveryDrills"]
      }
    ]
  },
  "/admin/ops/releases": {
    title: "Release Timeline",
    subtitle: "List release records and create new release entries.",
    resources: [{ key: "releases", title: "Release Records", buildPath: (values) => buildPathWithQuery("/api/v1/admin/ops/releases", values) }],
    actions: [
      {
        key: "createRelease",
        title: "Create Release Record",
        submitText: "Create",
        fields: [
          { key: "version", label: "Version", type: "text", required: true, placeholder: "v1.2.3" },
          { key: "environment", label: "Environment", type: "text", defaultValue: "production" },
          { key: "status", label: "Status", type: "text", placeholder: "success, partial, failed" }
        ],
        buildPath: () => "/api/v1/admin/ops/releases",
        refreshResources: ["releases"]
      }
    ]
  },
  "/admin/ops/change-approvals": {
    title: "Change Approvals",
    subtitle: "Track change governance decisions and reviewer outcomes.",
    resources: [
      { key: "changeApprovals", title: "Change Approval Records", buildPath: (values) => buildPathWithQuery("/api/v1/admin/ops/change-approvals", values) }
    ],
    actions: [
      {
        key: "createChangeApproval",
        title: "Create Approval Record",
        submitText: "Create",
        fields: [
          { key: "ticket_id", label: "Ticket ID", type: "text", required: true, placeholder: "CHG-234" },
          { key: "status", label: "Status", type: "text", defaultValue: "approved" },
          { key: "note", label: "Note", type: "textarea" }
        ],
        buildPath: () => "/api/v1/admin/ops/change-approvals",
        refreshResources: ["changeApprovals"]
      }
    ]
  },
  "/admin/ops/backup/plans": {
    title: "Backup Plans",
    subtitle: "Manage backup plan policies and retention configuration.",
    resources: [{ key: "backupPlans", title: "Backup Plan Records", buildPath: (values) => buildPathWithQuery("/api/v1/admin/ops/backup/plans", values) }],
    actions: [
      {
        key: "upsertBackupPlan",
        title: "Create or Update Backup Plan",
        submitText: "Upsert",
        fields: [
          { key: "plan_key", label: "Plan Key", type: "text", required: true, placeholder: "daily-core" },
          { key: "backup_type", label: "Backup Type", type: "text", defaultValue: "full" },
          { key: "schedule", label: "Schedule", type: "text", required: true, placeholder: "0 */6 * * *" },
          { key: "retention_days", label: "Retention Days", type: "number", required: true, min: 1, max: 3650 },
          { key: "enabled", label: "Enabled", type: "switch", defaultValue: true }
        ],
        buildPath: () => "/api/v1/admin/ops/backup/plans",
        refreshResources: ["backupPlans"]
      }
    ]
  },
  "/admin/ops/backup/runs": {
    title: "Backup Runs",
    subtitle: "Capture backup execution status with size and duration evidence.",
    resources: [{ key: "backupRuns", title: "Backup Run Records", buildPath: (values) => buildPathWithQuery("/api/v1/admin/ops/backup/runs", values) }],
    actions: [
      {
        key: "createBackupRun",
        title: "Create Backup Run",
        submitText: "Create",
        fields: [
          { key: "plan_key", label: "Plan Key", type: "text", required: true, placeholder: "daily-core" },
          { key: "status", label: "Status", type: "text", required: true, placeholder: "success" },
          { key: "size_bytes", label: "Size Bytes", type: "number", min: 0 },
          { key: "duration_ms", label: "Duration (ms)", type: "number", min: 0 }
        ],
        buildPath: () => "/api/v1/admin/ops/backup/runs",
        refreshResources: ["backupRuns"]
      }
    ]
  },
  "/admin/apikeys": {
    title: "API Key Management",
    subtitle: "Create, revoke, and rotate API keys for eligible owners.",
    resources: [{ key: "apiKeys", title: "API Key List", buildPath: (values) => buildPathWithQuery("/api/v1/admin/apikeys", values) }],
    actions: [
      {
        key: "createApiKey",
        title: "Create API Key",
        submitText: "Create",
        fields: [
          { key: "name", label: "Name", type: "text", placeholder: "service-key" },
          { key: "expires_in_days", label: "Expires In Days", type: "number", min: 0 },
          { key: "owner_user_id", label: "Owner User ID", type: "number", min: 1 },
          { key: "scopes", label: "Scopes", type: "textarea", placeholder: "skills.search.read,skills.ai_search.read" }
        ],
        buildPath: () => "/api/v1/admin/apikeys",
        buildPayload: (values) => ({
          name: String(values.name || "").trim(),
          expires_in_days: Number(values.expires_in_days || 0) || 0,
          owner_user_id: requiredID(values.owner_user_id),
          scopes: parseScopes(values.scopes)
        }),
        refreshResources: ["apiKeys"]
      },
      {
        key: "revokeApiKey",
        title: "Revoke API Key",
        fields: [{ key: "key_id", label: "Key ID", type: "number", required: true }],
        buildPath: (values) => {
          const keyID = requiredID(values.key_id);
          return keyID ? `/api/v1/admin/apikeys/${keyID}/revoke` : null;
        },
        refreshResources: ["apiKeys"]
      }
    ]
  },
  "/admin/organizations": {
    title: "Organization Governance",
    subtitle: "Create organizations, inspect member lists, and manage member roles.",
    resources: [
      { key: "organizations", title: "Organization List", buildPath: () => "/api/v1/admin/organizations" },
      {
        key: "organizationMembers",
        title: "Organization Members",
        autoLoad: false,
        fields: [{ key: "org_id", label: "Organization ID", type: "number", required: true }],
        buildPath: (values) => {
          const orgID = requiredID(values.org_id);
          return orgID ? `/api/v1/admin/organizations/${orgID}/members` : null;
        }
      }
    ],
    actions: [
      {
        key: "createOrganization",
        title: "Create Organization",
        fields: [{ key: "name", label: "Name", type: "text", required: true, placeholder: "Platform Engineering" }],
        buildPath: () => "/api/v1/admin/organizations",
        refreshResources: ["organizations"]
      }
    ]
  },
  "/admin/moderation": {
    title: "Moderation Workspace",
    subtitle: "Read moderation queue and execute resolve or reject actions.",
    resources: [{ key: "moderationCases", title: "Moderation Cases", buildPath: (values) => buildPathWithQuery("/api/v1/admin/moderation", values) }],
    actions: [
      {
        key: "createModerationCase",
        title: "Create Case",
        fields: [
          { key: "target_type", label: "Target Type", type: "text", required: true, defaultValue: "skill" },
          { key: "skill_id", label: "Skill ID", type: "number", min: 1 },
          { key: "comment_id", label: "Comment ID", type: "number", min: 1 },
          { key: "reason_code", label: "Reason Code", type: "text", required: true, placeholder: "abuse" },
          { key: "reason_detail", label: "Reason Detail", type: "textarea" }
        ],
        buildPath: () => "/api/v1/admin/moderation",
        refreshResources: ["moderationCases"]
      },
      {
        key: "resolveCase",
        title: "Resolve Case",
        fields: [{ key: "case_id", label: "Case ID", type: "number", required: true }],
        buildPath: (values) => {
          const caseID = requiredID(values.case_id);
          return caseID ? `/api/v1/admin/moderation/${caseID}/resolve` : null;
        },
        refreshResources: ["moderationCases"]
      },
      {
        key: "rejectCase",
        title: "Reject Case",
        fields: [{ key: "case_id", label: "Case ID", type: "number", required: true }],
        buildPath: (values) => {
          const caseID = requiredID(values.case_id);
          return caseID ? `/api/v1/admin/moderation/${caseID}/reject` : null;
        },
        refreshResources: ["moderationCases"]
      }
    ]
  }
};
