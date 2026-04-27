import type { AdminNavigationMessages } from "@/src/lib/i18n/protectedMessages";
import type { AdminAccountsMessages } from "@/src/lib/i18n/protectedPageMessages.accounts";
import type { AdminCatalogMessages } from "@/src/lib/i18n/protectedPageMessages.catalog";
import type { AdminIngestionMessages } from "@/src/lib/i18n/protectedPageMessages.ingestion";
import type { AdminOperationsMessages } from "@/src/lib/i18n/protectedPageMessages.operations";
import {
  adminAccountsNewRoute,
  adminAccountsRoute,
  adminAuditExportRoute,
  adminAuditRoute,
  adminBackupPlansRoute,
  adminBackupRunsRoute,
  adminChangeApprovalsRoute,
  adminJobsRoute,
  adminManualIntakeRoute,
  adminMetricsRoute,
  adminRecoveryDrillsRoute,
  adminReleaseGatesRoute,
  adminReleasesRoute,
  adminRepositoryIntakeRoute,
  adminRolesNewRoute,
  adminRolesRoute,
  adminSkillsRoute,
  adminSyncJobsRoute,
  adminSyncPolicyRoute,
  adminAlertsRoute,
  adminImportsRoute
} from "./protectedSurfaceLinks";
import {
  buildAdminAuditExportBFFEndpoint,
  buildBFFPath
} from "./protectedSurfaceEndpoints";

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

function resolveAdminBffEndpoint(route: string): string {
  const routeDefinition = resolveAdminRouteDefinition(route);

  if (!routeDefinition?.endpoint) {
    throw new Error(`Missing admin endpoint for route: ${route}`);
  }

  return buildBFFPath(routeDefinition.endpoint);
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
  [adminAccountsRoute]: (messages) => ({
    title: messages.routeAccountsTitle,
    description: messages.routeAccountsDescription
  }),
  [adminAccountsNewRoute]: (messages) => ({
    title: messages.routeProvisioningTitle,
    description: messages.routeProvisioningDescription
  }),
  [adminRolesRoute]: (messages) => ({
    title: messages.routeRolesTitle,
    description: messages.routeRolesDescription
  }),
  [adminRolesNewRoute]: (messages) => ({
    title: messages.routeRoleConfigurationTitle,
    description: messages.routeRoleConfigurationDescription
  })
};

const adminIngestionRouteMetaResolvers: Record<
  AdminIngestionRoute,
  AdminRouteMetaResolver<IngestionRouteMetaMessages, AdminPageRouteMeta>
> = {
  [adminManualIntakeRoute]: (messages) => ({
    title: messages.routeManualTitle,
    description: messages.routeManualDescription
  }),
  [adminRepositoryIntakeRoute]: (messages) => ({
    title: messages.routeRepositoryTitle,
    description: messages.routeRepositoryDescription
  }),
  [adminImportsRoute]: (messages) => ({
    title: messages.routeImportsTitle,
    description: messages.routeImportsDescription
  })
};

const adminCatalogRouteMetaResolvers: Record<
  AdminCatalogRoute,
  AdminRouteMetaResolver<CatalogRouteMetaMessages, AdminDataRouteMeta>
> = {
  [adminSkillsRoute]: (messages, route) => ({
    title: messages.routeSkillsTitle,
    description: messages.routeSkillsDescription,
    endpoint: resolveAdminBffEndpoint(route)
  }),
  [adminJobsRoute]: (messages, route) => ({
    title: messages.routeJobsTitle,
    description: messages.routeJobsDescription,
    endpoint: resolveAdminBffEndpoint(route)
  }),
  [adminSyncJobsRoute]: (messages, route) => ({
    title: messages.routeSyncJobsTitle,
    description: messages.routeSyncJobsDescription,
    endpoint: resolveAdminBffEndpoint(route)
  }),
  [adminSyncPolicyRoute]: (messages, route) => ({
    title: messages.routePolicyTitle,
    description: messages.routePolicyDescription,
    endpoint: resolveAdminBffEndpoint(route)
  })
};

const adminOperationsDashboardRouteMetaResolvers: Record<
  AdminOperationsDashboardRoute,
  AdminRouteMetaResolver<OperationsRouteMetaMessages, AdminActionRouteMeta>
> = {
  [adminMetricsRoute]: (messages, route) => ({
    title: messages.routeMetricsTitle,
    description: messages.routeMetricsDescription,
    endpoint: resolveAdminBffEndpoint(route)
  }),
  [adminAlertsRoute]: (messages, route) => ({
    title: messages.routeAlertsTitle,
    description: messages.routeAlertsDescription,
    endpoint: resolveAdminBffEndpoint(route)
  }),
  [adminReleaseGatesRoute]: (messages, route) => {
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
  [adminAuditRoute]: (messages) => ({
    title: messages.routeAuditExportTitle,
    description: messages.routeAuditExportDescription,
    endpoint: buildAdminAuditExportBFFEndpoint("json")
  }),
  [adminAuditExportRoute]: (messages) => ({
    title: messages.routeAuditExportTitle,
    description: messages.routeAuditExportDescription,
    endpoint: buildAdminAuditExportBFFEndpoint("json")
  }),
  [adminRecoveryDrillsRoute]: (messages, route) => {
    const endpoint = resolveAdminBffEndpoint(route);

    return {
      title: messages.routeRecoveryDrillsTitle,
      description: messages.routeRecoveryDrillsDescription,
      endpoint,
      createEndpoint: `${endpoint}/run`
    };
  },
  [adminReleasesRoute]: (messages, route) => {
    const endpoint = resolveAdminBffEndpoint(route);

    return {
      title: messages.routeReleasesTitle,
      description: messages.routeReleasesDescription,
      endpoint,
      createEndpoint: endpoint
    };
  },
  [adminChangeApprovalsRoute]: (messages, route) => {
    const endpoint = resolveAdminBffEndpoint(route);

    return {
      title: messages.routeChangeApprovalsTitle,
      description: messages.routeChangeApprovalsDescription,
      endpoint,
      createEndpoint: endpoint
    };
  },
  [adminBackupPlansRoute]: (messages, route) => {
    const endpoint = resolveAdminBffEndpoint(route);

    return {
      title: messages.routeBackupPlansTitle,
      description: messages.routeBackupPlansDescription,
      endpoint,
      createEndpoint: endpoint
    };
  },
  [adminBackupRunsRoute]: (messages, route) => {
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
