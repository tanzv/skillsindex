import type {
  AdminRouteDescriptorDefinition,
  AdminRouteGroupDefinition
} from "./adminRouteRegistry.contracts";
import {
  adminAlertsEndpoint,
  adminAPIKeysEndpoint,
  adminAuditExportEndpoint,
  adminBackupPlansEndpoint,
  adminBackupRunsEndpoint,
  adminChangeApprovalsEndpoint,
  adminIntegrationsEndpoint,
  adminJobsEndpoint,
  adminManualIntakeEndpoint,
  adminMetricsEndpoint,
  adminModerationEndpoint,
  adminOrganizationsEndpoint,
  adminOverviewEndpoint,
  adminRecoveryDrillsEndpoint,
  adminReleaseGatesEndpoint,
  adminReleasesEndpoint,
  adminRepositoryIntakeEndpoint,
  adminSkillsEndpoint,
  adminSyncJobsEndpoint,
  adminSyncPolicyEndpoint,
  adminAccountsEndpoint
} from "./protectedSurfaceEndpoints";
import {
  adminAccessRoute,
  adminAccountsNewRoute,
  adminAccountsRoute,
  adminAlertsRoute,
  adminAPIKeysRoute,
  adminAuditExportRoute,
  adminAuditRoute,
  adminBackupPlansRoute,
  adminBackupRunsRoute,
  adminChangeApprovalsRoute,
  adminImportsRoute,
  adminIntegrationsRoute,
  adminJobsRoute,
  adminManualIntakeRoute,
  adminMetricsRoute,
  adminModerationRoute,
  adminOrganizationsRoute,
  adminOverviewRoute,
  adminRecoveryDrillsRoute,
  adminReleaseGatesRoute,
  adminReleasesRoute,
  adminRepositoryIntakeRoute,
  adminRolesNewRoute,
  adminRolesRoute,
  adminSkillsRoute,
  adminSyncJobsRoute,
  adminSyncPolicyRoute
} from "./protectedSurfaceLinks";

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
    path: adminOverviewRoute,
    groupId: "overview",
    label: (messages) => messages.itemOverviewLabel,
    description: (messages) => messages.itemOverviewDescription,
    renderTarget: "overview",
    endpoint: adminOverviewEndpoint,
    quickLink: true
  },
  {
    path: adminManualIntakeRoute,
    groupId: "catalog",
    label: (messages) => messages.itemManualIntakeLabel,
    description: (messages) => messages.itemManualIntakeDescription,
    renderTarget: "ingestion",
    endpoint: adminManualIntakeEndpoint
  },
  {
    path: adminRepositoryIntakeRoute,
    groupId: "catalog",
    label: (messages) => messages.itemRepositoryIntakeLabel,
    description: (messages) => messages.itemRepositoryIntakeDescription,
    renderTarget: "ingestion",
    endpoint: adminRepositoryIntakeEndpoint,
    quickLink: true
  },
  {
    path: adminImportsRoute,
    groupId: "catalog",
    label: (messages) => messages.itemImportsLabel,
    description: (messages) => messages.itemImportsDescription,
    renderTarget: "ingestion",
    quickLink: true
  },
  {
    path: adminSkillsRoute,
    groupId: "catalog",
    label: (messages) => messages.itemSkillsLabel,
    description: (messages) => messages.itemSkillsDescription,
    renderTarget: "catalog",
    endpoint: adminSkillsEndpoint,
    quickLink: true
  },
  {
    path: adminJobsRoute,
    groupId: "catalog",
    label: (messages) => messages.itemJobsLabel,
    description: (messages) => messages.itemJobsDescription,
    renderTarget: "catalog",
    endpoint: adminJobsEndpoint
  },
  {
    path: adminSyncJobsRoute,
    groupId: "catalog",
    label: (messages) => messages.itemSyncJobsLabel,
    description: (messages) => messages.itemSyncJobsDescription,
    renderTarget: "catalog",
    endpoint: adminSyncJobsEndpoint,
    quickLink: true
  },
  {
    path: adminSyncPolicyRoute,
    groupId: "catalog",
    label: (messages) => messages.itemSyncPolicyLabel,
    description: (messages) => messages.itemSyncPolicyDescription,
    renderTarget: "catalog",
    endpoint: adminSyncPolicyEndpoint
  },
  {
    path: adminMetricsRoute,
    groupId: "operations",
    label: (messages) => messages.itemOpsMetricsLabel,
    description: (messages) => messages.itemOpsMetricsDescription,
    renderTarget: "ops-dashboard",
    requiredCapability: "view_all_admin",
    endpoint: adminMetricsEndpoint
  },
  {
    path: adminIntegrationsRoute,
    groupId: "operations",
    label: (messages) => messages.itemIntegrationsLabel,
    description: (messages) => messages.itemIntegrationsDescription,
    renderTarget: "integrations",
    requiredCapability: "view_all_admin",
    endpoint: adminIntegrationsEndpoint,
    quickLink: true
  },
  {
    path: adminAlertsRoute,
    groupId: "operations",
    label: (messages) => messages.itemOpsAlertsLabel,
    description: (messages) => messages.itemOpsAlertsDescription,
    renderTarget: "ops-dashboard",
    requiredCapability: "view_all_admin",
    endpoint: adminAlertsEndpoint
  },
  {
    path: adminAuditRoute,
    groupId: "security",
    label: (messages) => messages.itemAuditExportLabel,
    description: (messages) => messages.itemAuditExportDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: adminAuditExportEndpoint
  },
  {
    path: adminAuditExportRoute,
    groupId: "security",
    label: (messages) => messages.itemAuditExportLabel,
    description: (messages) => messages.itemAuditExportDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: adminAuditExportEndpoint,
    hiddenFromNavigation: true
  },
  {
    path: adminReleaseGatesRoute,
    groupId: "operations",
    label: (messages) => messages.itemReleaseGatesLabel,
    description: (messages) => messages.itemReleaseGatesDescription,
    renderTarget: "ops-dashboard",
    requiredCapability: "view_all_admin",
    endpoint: adminReleaseGatesEndpoint
  },
  {
    path: adminRecoveryDrillsRoute,
    groupId: "operations",
    label: (messages) => messages.itemRecoveryDrillsLabel,
    description: (messages) => messages.itemRecoveryDrillsDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: adminRecoveryDrillsEndpoint
  },
  {
    path: adminReleasesRoute,
    groupId: "operations",
    label: (messages) => messages.itemReleasesLabel,
    description: (messages) => messages.itemReleasesDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: adminReleasesEndpoint
  },
  {
    path: adminChangeApprovalsRoute,
    groupId: "operations",
    label: (messages) => messages.itemChangeApprovalsLabel,
    description: (messages) => messages.itemChangeApprovalsDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: adminChangeApprovalsEndpoint
  },
  {
    path: adminBackupPlansRoute,
    groupId: "operations",
    label: (messages) => messages.itemBackupPlansLabel,
    description: (messages) => messages.itemBackupPlansDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: adminBackupPlansEndpoint
  },
  {
    path: adminBackupRunsRoute,
    groupId: "operations",
    label: (messages) => messages.itemBackupRunsLabel,
    description: (messages) => messages.itemBackupRunsDescription,
    renderTarget: "ops-records",
    requiredCapability: "view_all_admin",
    endpoint: adminBackupRunsEndpoint
  },
  {
    path: adminAccountsRoute,
    groupId: "users",
    label: (messages) => messages.itemAccountsLabel,
    description: (messages) => messages.itemAccountsDescription,
    renderTarget: "accounts",
    requiredCapability: "manage_users",
    endpoint: adminAccountsEndpoint
  },
  {
    path: adminAccountsNewRoute,
    groupId: "users",
    label: (messages) => messages.itemAccountsLabel,
    description: (messages) => messages.itemAccountsDescription,
    renderTarget: "accounts",
    requiredCapability: "manage_users",
    hiddenFromNavigation: true
  },
  {
    path: adminRolesRoute,
    groupId: "users",
    label: (messages) => messages.itemRolesLabel,
    description: (messages) => messages.itemRolesDescription,
    renderTarget: "accounts",
    requiredCapability: "manage_users"
  },
  {
    path: adminRolesNewRoute,
    groupId: "users",
    label: (messages) => messages.itemRolesLabel,
    description: (messages) => messages.itemRolesDescription,
    renderTarget: "accounts",
    requiredCapability: "manage_users",
    hiddenFromNavigation: true
  },
  {
    path: adminAccessRoute,
    groupId: "users",
    label: (messages) => messages.itemAccessLabel,
    description: (messages) => messages.itemAccessDescription,
    renderTarget: "access",
    requiredCapability: "manage_users",
    quickLink: true
  },
  {
    path: adminOrganizationsRoute,
    groupId: "users",
    label: (messages) => messages.itemOrganizationsLabel,
    description: (messages) => messages.itemOrganizationsDescription,
    renderTarget: "organizations",
    requiredCapability: "view_all_admin",
    endpoint: adminOrganizationsEndpoint
  },
  {
    path: adminAPIKeysRoute,
    groupId: "security",
    label: (messages) => messages.itemApiKeysLabel,
    description: (messages) => messages.itemApiKeysDescription,
    renderTarget: "apikeys",
    endpoint: adminAPIKeysEndpoint
  },
  {
    path: adminModerationRoute,
    groupId: "security",
    label: (messages) => messages.itemModerationLabel,
    description: (messages) => messages.itemModerationDescription,
    renderTarget: "moderation",
    requiredCapability: "view_all_admin",
    endpoint: adminModerationEndpoint
  }
] as const satisfies readonly AdminRouteDescriptorDefinition[];
