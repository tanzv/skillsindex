import type {
  AdminRouteDescriptorDefinition,
  AdminRouteGroupDefinition
} from "./adminRouteRegistry.contracts";

export const adminRouteGroupDefinitions: AdminRouteGroupDefinition[] = [
  {
    id: "overview",
    label: (messages) => messages.groupOverviewLabel
  },
  {
    id: "catalog",
    label: (messages) => messages.groupCatalogLabel
  },
  {
    id: "operations",
    label: (messages) => messages.groupOperationsLabel
  },
  {
    id: "users",
    label: (messages) => messages.groupUsersLabel
  },
  {
    id: "security",
    label: (messages) => messages.groupSecurityLabel
  }
] as const;

export const adminRouteDefinitions = [
  {
    path: "/admin/overview",
    groupId: "overview",
    label: (messages) => messages.itemOverviewLabel,
    description: (messages) => messages.itemOverviewDescription,
    renderTarget: "overview",
    endpoint: "/api/v1/admin/overview",
    quickLink: true
  },
  {
    path: "/admin/ingestion/manual",
    groupId: "catalog",
    label: (messages) => messages.itemManualIntakeLabel,
    description: (messages) => messages.itemManualIntakeDescription,
    renderTarget: "ingestion",
    endpoint: "/api/v1/admin/ingestion/manual"
  },
  {
    path: "/admin/ingestion/repository",
    groupId: "catalog",
    label: (messages) => messages.itemRepositoryIntakeLabel,
    description: (messages) => messages.itemRepositoryIntakeDescription,
    renderTarget: "ingestion",
    endpoint: "/api/v1/admin/ingestion/repository",
    quickLink: true
  },
  {
    path: "/admin/records/imports",
    groupId: "catalog",
    label: (messages) => messages.itemImportsLabel,
    description: (messages) => messages.itemImportsDescription,
    renderTarget: "ingestion",
    quickLink: true
  },
  {
    path: "/admin/skills",
    groupId: "catalog",
    label: (messages) => messages.itemSkillsLabel,
    description: (messages) => messages.itemSkillsDescription,
    renderTarget: "catalog",
    endpoint: "/api/v1/admin/skills",
    quickLink: true
  },
  {
    path: "/admin/jobs",
    groupId: "catalog",
    label: (messages) => messages.itemJobsLabel,
    description: (messages) => messages.itemJobsDescription,
    renderTarget: "catalog",
    endpoint: "/api/v1/admin/jobs"
  },
  {
    path: "/admin/sync-jobs",
    groupId: "catalog",
    label: (messages) => messages.itemSyncJobsLabel,
    description: (messages) => messages.itemSyncJobsDescription,
    renderTarget: "catalog",
    endpoint: "/api/v1/admin/sync-jobs",
    quickLink: true
  },
  {
    path: "/admin/sync-policy/repository",
    groupId: "catalog",
    label: (messages) => messages.itemSyncPolicyLabel,
    description: (messages) => messages.itemSyncPolicyDescription,
    renderTarget: "catalog",
    endpoint: "/api/v1/admin/sync-policy/repository"
  },
  {
    path: "/admin/ops/metrics",
    groupId: "operations",
    label: (messages) => messages.itemOpsMetricsLabel,
    description: (messages) => messages.itemOpsMetricsDescription,
    renderTarget: "ops-dashboard",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/ops/metrics"
  },
  {
    path: "/admin/integrations",
    groupId: "operations",
    label: (messages) => messages.itemIntegrationsLabel,
    description: (messages) => messages.itemIntegrationsDescription,
    renderTarget: "integrations",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/integrations",
    quickLink: true
  },
  {
    path: "/admin/ops/alerts",
    groupId: "operations",
    label: (messages) => messages.itemOpsAlertsLabel,
    description: (messages) => messages.itemOpsAlertsDescription,
    renderTarget: "ops-dashboard",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/ops/alerts"
  },
  {
    path: "/admin/audit",
    groupId: "security",
    label: (messages) => messages.itemAuditExportLabel,
    description: (messages) => messages.itemAuditExportDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/ops/audit-export"
  },
  {
    path: "/admin/ops/audit-export",
    groupId: "security",
    label: (messages) => messages.itemAuditExportLabel,
    description: (messages) => messages.itemAuditExportDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/ops/audit-export",
    hiddenFromNavigation: true
  },
  {
    path: "/admin/ops/release-gates",
    groupId: "operations",
    label: (messages) => messages.itemReleaseGatesLabel,
    description: (messages) => messages.itemReleaseGatesDescription,
    renderTarget: "ops-dashboard",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/ops/release-gates"
  },
  {
    path: "/admin/ops/recovery-drills",
    groupId: "operations",
    label: (messages) => messages.itemRecoveryDrillsLabel,
    description: (messages) => messages.itemRecoveryDrillsDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/ops/recovery-drills"
  },
  {
    path: "/admin/ops/releases",
    groupId: "operations",
    label: (messages) => messages.itemReleasesLabel,
    description: (messages) => messages.itemReleasesDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/ops/releases"
  },
  {
    path: "/admin/ops/change-approvals",
    groupId: "operations",
    label: (messages) => messages.itemChangeApprovalsLabel,
    description: (messages) => messages.itemChangeApprovalsDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/ops/change-approvals"
  },
  {
    path: "/admin/ops/backup/plans",
    groupId: "operations",
    label: (messages) => messages.itemBackupPlansLabel,
    description: (messages) => messages.itemBackupPlansDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/ops/backup/plans"
  },
  {
    path: "/admin/ops/backup/runs",
    groupId: "operations",
    label: (messages) => messages.itemBackupRunsLabel,
    description: (messages) => messages.itemBackupRunsDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/ops/backup/runs"
  },
  {
    path: "/admin/accounts",
    groupId: "users",
    label: (messages) => messages.itemAccountsLabel,
    description: (messages) => messages.itemAccountsDescription,
    renderTarget: "accounts",
    requiredCapability: "manage_users",
    endpoint: "/api/v1/admin/accounts"
  },
  {
    path: "/admin/accounts/new",
    groupId: "users",
    label: (messages) => messages.itemAccountsLabel,
    description: (messages) => messages.itemAccountsDescription,
    renderTarget: "accounts",
    requiredCapability: "manage_users",
    hiddenFromNavigation: true
  },
  {
    path: "/admin/roles",
    groupId: "users",
    label: (messages) => messages.itemRolesLabel,
    description: (messages) => messages.itemRolesDescription,
    renderTarget: "accounts",
    requiredCapability: "manage_users"
  },
  {
    path: "/admin/roles/new",
    groupId: "users",
    label: (messages) => messages.itemRolesLabel,
    description: (messages) => messages.itemRolesDescription,
    renderTarget: "accounts",
    requiredCapability: "manage_users",
    hiddenFromNavigation: true
  },
  {
    path: "/admin/access",
    groupId: "users",
    label: (messages) => messages.itemAccessLabel,
    description: (messages) => messages.itemAccessDescription,
    renderTarget: "access",
    requiredCapability: "manage_users",
    quickLink: true
  },
  {
    path: "/admin/organizations",
    groupId: "users",
    label: (messages) => messages.itemOrganizationsLabel,
    description: (messages) => messages.itemOrganizationsDescription,
    renderTarget: "organizations",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/organizations"
  },
  {
    path: "/admin/apikeys",
    groupId: "security",
    label: (messages) => messages.itemApiKeysLabel,
    description: (messages) => messages.itemApiKeysDescription,
    renderTarget: "apikeys",
    endpoint: "/api/v1/admin/apikeys"
  },
  {
    path: "/admin/moderation",
    groupId: "security",
    label: (messages) => messages.itemModerationLabel,
    description: (messages) => messages.itemModerationDescription,
    renderTarget: "moderation",
    requiredCapability: "view_all_admin",
    endpoint: "/api/v1/admin/moderation"
  }
] as const satisfies readonly AdminRouteDescriptorDefinition[];
