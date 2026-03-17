export interface AdminRouteMeta {
  title: string;
  description: string;
  endpoint: string;
}

export const adminRouteMeta: Record<string, AdminRouteMeta> = {
  "/admin/skills": {
    title: "Skills",
    description: "Governed skill inventory.",
    endpoint: "/api/v1/admin/skills"
  },
  "/admin/jobs": {
    title: "Jobs",
    description: "Async job queue inspection.",
    endpoint: "/api/v1/admin/jobs"
  },
  "/admin/sync-jobs": {
    title: "Sync Jobs",
    description: "Synchronization run history.",
    endpoint: "/api/v1/admin/sync-jobs"
  },
  "/admin/sync-policy/repository": {
    title: "Repository Sync Policy",
    description: "Repository sync policy management.",
    endpoint: "/api/v1/admin/sync-policy/repository"
  },
  "/admin/integrations": {
    title: "Integrations",
    description: "Connector and webhook delivery administration.",
    endpoint: "/api/v1/admin/integrations"
  },
  "/admin/ops/metrics": {
    title: "Ops Metrics",
    description: "Reliability baseline and active operational posture.",
    endpoint: "/api/v1/admin/ops/metrics"
  },
  "/admin/ops/alerts": {
    title: "Ops Alerts",
    description: "Operational alert stream.",
    endpoint: "/api/v1/admin/ops/alerts"
  },
  "/admin/ops/audit-export": {
    title: "Audit Export",
    description: "Export controls for operational evidence.",
    endpoint: "/api/v1/admin/ops/audit-export"
  },
  "/admin/ops/release-gates": {
    title: "Release Gates",
    description: "Release readiness checks.",
    endpoint: "/api/v1/admin/ops/release-gates"
  },
  "/admin/ops/recovery-drills": {
    title: "Recovery Drills",
    description: "Recovery rehearsal records.",
    endpoint: "/api/v1/admin/ops/recovery-drills"
  },
  "/admin/ops/releases": {
    title: "Releases",
    description: "Release execution history.",
    endpoint: "/api/v1/admin/ops/releases"
  },
  "/admin/ops/change-approvals": {
    title: "Change Approvals",
    description: "Approval decision records.",
    endpoint: "/api/v1/admin/ops/change-approvals"
  },
  "/admin/ops/backup/plans": {
    title: "Backup Plans",
    description: "Backup policy definitions.",
    endpoint: "/api/v1/admin/ops/backup/plans"
  },
  "/admin/ops/backup/runs": {
    title: "Backup Runs",
    description: "Backup run evidence.",
    endpoint: "/api/v1/admin/ops/backup/runs"
  },
  "/admin/accounts": {
    title: "Accounts",
    description: "Account governance and provisioning.",
    endpoint: "/api/v1/admin/overview"
  },
  "/admin/accounts/new": {
    title: "New Account",
    description: "Account creation flow placeholder aligned with current admin structure.",
    endpoint: "/api/v1/admin/overview"
  },
  "/admin/roles": {
    title: "Roles",
    description: "Role governance and assignment management.",
    endpoint: "/api/v1/admin/overview"
  },
  "/admin/roles/new": {
    title: "New Role",
    description: "Role creation flow placeholder aligned with current admin structure.",
    endpoint: "/api/v1/admin/overview"
  },
  "/admin/access": {
    title: "Access",
    description: "Access governance and registration settings.",
    endpoint: "/api/v1/admin/access"
  },
  "/admin/organizations": {
    title: "Organizations",
    description: "Organization membership and role administration.",
    endpoint: "/api/v1/admin/organizations"
  },
  "/admin/apikeys": {
    title: "API Keys",
    description: "API key governance surface.",
    endpoint: "/api/v1/admin/apikeys"
  },
  "/admin/moderation": {
    title: "Moderation",
    description: "Moderation queue and resolution controls.",
    endpoint: "/api/v1/admin/moderation"
  }
};
