import type { AdminNavigationMessages } from "@/src/lib/i18n/protectedMessages";
import type { AdminAccountsMessages } from "@/src/lib/i18n/protectedPageMessages.accounts";
import type { AdminCatalogMessages } from "@/src/lib/i18n/protectedPageMessages.catalog";
import type { AdminIngestionMessages } from "@/src/lib/i18n/protectedPageMessages.ingestion";
import type { AdminOperationsMessages } from "@/src/lib/i18n/protectedPageMessages.operations";

import type {
  AdminAccountManagementRoute,
  AdminCatalogRoute,
  AdminIngestionRoute,
  AdminOperationsDashboardRoute,
  AdminOperationsRecordsRoute
} from "./adminRouteRegistry";
import { buildAdminRouteDescriptors, resolveAdminRouteDefinition } from "./adminRouteRegistry";

export interface AdminPageRouteMeta {
  title: string;
  description: string;
}

export interface AdminDataRouteMeta extends AdminPageRouteMeta {
  endpoint: string;
}

export interface AdminActionRouteMeta extends AdminDataRouteMeta {
  createEndpoint?: string;
  runEndpoint?: string;
}

function toBffAdminEndpoint(endpoint: string): string {
  return endpoint.replace(/^\/api\/v1\//, "/api/bff/");
}

function resolveAdminBffEndpoint(route: string): string {
  const routeDefinition = resolveAdminRouteDefinition(route);

  if (!routeDefinition?.endpoint) {
    throw new Error(`Missing admin endpoint for route: ${route}`);
  }

  return toBffAdminEndpoint(routeDefinition.endpoint);
}

type AccountsRouteMetaMessages = Pick<
  AdminAccountsMessages,
  | "routeAccountsTitle"
  | "routeAccountsDescription"
  | "routeProvisioningTitle"
  | "routeProvisioningDescription"
  | "routeRolesTitle"
  | "routeRolesDescription"
  | "routeRoleConfigurationTitle"
  | "routeRoleConfigurationDescription"
>;

type IngestionRouteMetaMessages = Pick<
  AdminIngestionMessages,
  | "routeManualTitle"
  | "routeManualDescription"
  | "routeRepositoryTitle"
  | "routeRepositoryDescription"
  | "routeImportsTitle"
  | "routeImportsDescription"
>;

type CatalogRouteMetaMessages = Pick<
  AdminCatalogMessages,
  | "routeSkillsTitle"
  | "routeSkillsDescription"
  | "routeJobsTitle"
  | "routeJobsDescription"
  | "routeSyncJobsTitle"
  | "routeSyncJobsDescription"
  | "routePolicyTitle"
  | "routePolicyDescription"
>;

type OperationsRouteMetaMessages = Pick<
  AdminOperationsMessages,
  | "routeMetricsTitle"
  | "routeMetricsDescription"
  | "routeAlertsTitle"
  | "routeAlertsDescription"
  | "routeReleaseGatesTitle"
  | "routeReleaseGatesDescription"
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
>;

type AdminRouteMetaResolver<TMessages, TMeta extends AdminPageRouteMeta> = (messages: TMessages, route: string) => TMeta;

const adminAccountsRouteMetaResolvers: Record<
  AdminAccountManagementRoute,
  AdminRouteMetaResolver<AccountsRouteMetaMessages, AdminPageRouteMeta>
> = {
  "/admin/accounts": (messages) => ({
    title: messages.routeAccountsTitle,
    description: messages.routeAccountsDescription
  }),
  "/admin/accounts/new": (messages) => ({
    title: messages.routeProvisioningTitle,
    description: messages.routeProvisioningDescription
  }),
  "/admin/roles": (messages) => ({
    title: messages.routeRolesTitle,
    description: messages.routeRolesDescription
  }),
  "/admin/roles/new": (messages) => ({
    title: messages.routeRoleConfigurationTitle,
    description: messages.routeRoleConfigurationDescription
  })
};

const adminIngestionRouteMetaResolvers: Record<
  AdminIngestionRoute,
  AdminRouteMetaResolver<IngestionRouteMetaMessages, AdminPageRouteMeta>
> = {
  "/admin/ingestion/manual": (messages) => ({
    title: messages.routeManualTitle,
    description: messages.routeManualDescription
  }),
  "/admin/ingestion/repository": (messages) => ({
    title: messages.routeRepositoryTitle,
    description: messages.routeRepositoryDescription
  }),
  "/admin/records/imports": (messages) => ({
    title: messages.routeImportsTitle,
    description: messages.routeImportsDescription
  })
};

const adminCatalogRouteMetaResolvers: Record<
  AdminCatalogRoute,
  AdminRouteMetaResolver<CatalogRouteMetaMessages, AdminDataRouteMeta>
> = {
  "/admin/skills": (messages, route) => ({
    title: messages.routeSkillsTitle,
    description: messages.routeSkillsDescription,
    endpoint: resolveAdminBffEndpoint(route)
  }),
  "/admin/jobs": (messages, route) => ({
    title: messages.routeJobsTitle,
    description: messages.routeJobsDescription,
    endpoint: resolveAdminBffEndpoint(route)
  }),
  "/admin/sync-jobs": (messages, route) => ({
    title: messages.routeSyncJobsTitle,
    description: messages.routeSyncJobsDescription,
    endpoint: resolveAdminBffEndpoint(route)
  }),
  "/admin/sync-policy/repository": (messages, route) => ({
    title: messages.routePolicyTitle,
    description: messages.routePolicyDescription,
    endpoint: resolveAdminBffEndpoint(route)
  })
};

const adminOperationsDashboardRouteMetaResolvers: Record<
  AdminOperationsDashboardRoute,
  AdminRouteMetaResolver<OperationsRouteMetaMessages, AdminActionRouteMeta>
> = {
  "/admin/ops/metrics": (messages, route) => ({
    title: messages.routeMetricsTitle,
    description: messages.routeMetricsDescription,
    endpoint: resolveAdminBffEndpoint(route)
  }),
  "/admin/ops/alerts": (messages, route) => ({
    title: messages.routeAlertsTitle,
    description: messages.routeAlertsDescription,
    endpoint: resolveAdminBffEndpoint(route)
  }),
  "/admin/ops/release-gates": (messages, route) => {
    const endpoint = resolveAdminBffEndpoint(route);

    return {
      title: messages.routeReleaseGatesTitle,
      description: messages.routeReleaseGatesDescription,
      endpoint,
      runEndpoint: `${endpoint}/run`
    };
  }
};

const adminOperationsRecordsRouteMetaResolvers: Record<
  AdminOperationsRecordsRoute,
  AdminRouteMetaResolver<OperationsRouteMetaMessages, AdminActionRouteMeta>
> = {
  "/admin/audit": (messages) => ({
    title: messages.routeAuditExportTitle,
    description: messages.routeAuditExportDescription,
    endpoint: "/api/bff/admin/ops/audit-export?format=json"
  }),
  "/admin/ops/audit-export": (messages, route) => ({
    title: messages.routeAuditExportTitle,
    description: messages.routeAuditExportDescription,
    endpoint: `${resolveAdminBffEndpoint(route)}?format=json`
  }),
  "/admin/ops/recovery-drills": (messages, route) => {
    const endpoint = resolveAdminBffEndpoint(route);

    return {
      title: messages.routeRecoveryDrillsTitle,
      description: messages.routeRecoveryDrillsDescription,
      endpoint,
      createEndpoint: `${endpoint}/run`
    };
  },
  "/admin/ops/releases": (messages, route) => {
    const endpoint = resolveAdminBffEndpoint(route);

    return {
      title: messages.routeReleasesTitle,
      description: messages.routeReleasesDescription,
      endpoint,
      createEndpoint: endpoint
    };
  },
  "/admin/ops/change-approvals": (messages, route) => {
    const endpoint = resolveAdminBffEndpoint(route);

    return {
      title: messages.routeChangeApprovalsTitle,
      description: messages.routeChangeApprovalsDescription,
      endpoint,
      createEndpoint: endpoint
    };
  },
  "/admin/ops/backup/plans": (messages, route) => {
    const endpoint = resolveAdminBffEndpoint(route);

    return {
      title: messages.routeBackupPlansTitle,
      description: messages.routeBackupPlansDescription,
      endpoint,
      createEndpoint: endpoint
    };
  },
  "/admin/ops/backup/runs": (messages, route) => {
    const endpoint = resolveAdminBffEndpoint(route);

    return {
      title: messages.routeBackupRunsTitle,
      description: messages.routeBackupRunsDescription,
      endpoint,
      createEndpoint: endpoint
    };
  }
};

export function buildAdminDataPageRouteMetaMap(messages: AdminNavigationMessages): Record<string, AdminDataRouteMeta> {
  return Object.fromEntries(
    buildAdminRouteDescriptors(messages)
      .map((descriptor) => {
        if (!descriptor.endpoint || descriptor.hiddenFromNavigation) {
          return null;
        }

        return [
          descriptor.path,
          {
            title: descriptor.label,
            description: descriptor.description || descriptor.label,
            endpoint: descriptor.endpoint
          }
        ] satisfies [string, AdminDataRouteMeta];
      })
      .filter((entry): entry is [string, AdminDataRouteMeta] => Boolean(entry))
  );
}

export function resolveAdminAccountsPageRouteMeta(
  route: AdminAccountManagementRoute,
  messages: AccountsRouteMetaMessages
): AdminPageRouteMeta {
  return adminAccountsRouteMetaResolvers[route](messages, route);
}

export function resolveAdminIngestionPageRouteMeta(
  route: AdminIngestionRoute,
  messages: IngestionRouteMetaMessages
): AdminPageRouteMeta {
  return adminIngestionRouteMetaResolvers[route](messages, route);
}

export function resolveAdminCatalogPageRouteMeta(
  route: AdminCatalogRoute,
  messages: CatalogRouteMetaMessages
): AdminDataRouteMeta {
  return adminCatalogRouteMetaResolvers[route](messages, route);
}

export function resolveAdminOperationsDashboardRouteMeta(
  route: AdminOperationsDashboardRoute,
  messages: OperationsRouteMetaMessages
): AdminActionRouteMeta {
  return adminOperationsDashboardRouteMetaResolvers[route](messages, route);
}

export function resolveAdminOperationsRecordsRouteMeta(
  route: AdminOperationsRecordsRoute,
  messages: OperationsRouteMetaMessages
): AdminActionRouteMeta {
  return adminOperationsRecordsRouteMetaResolvers[route](messages, route);
}
