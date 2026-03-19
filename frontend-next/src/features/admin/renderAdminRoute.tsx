import { headers } from "next/headers";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Button } from "@/src/components/ui/button";
import { fetchAdminCollection } from "@/src/lib/api/admin";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import { loadProtectedMessages } from "@/src/lib/i18n/protectedMessages.server";
import { resolveServerLocale } from "@/src/lib/i18n/serverLocale";

import { AdminAccessPage } from "../adminAccess/AdminAccessPage";
import { AdminAccountsPage } from "../adminAccounts/AdminAccountsPage";
import { AdminAPIKeysPage } from "../adminApiKeys/AdminAPIKeysPage";
import { AdminCatalogPage } from "../adminCatalog/AdminCatalogPage";
import { AdminIntegrationsPage } from "../adminGovernance/AdminIntegrationsPage";
import { AdminModerationPage } from "../adminGovernance/AdminModerationPage";
import { AdminOrganizationsPage } from "../adminGovernance/AdminOrganizationsPage";
import { AdminIngestionPage } from "../adminIngestion/AdminIngestionPage";
import { AdminOverviewPage } from "../adminOverview/AdminOverviewPage";
import { AdminOperationsPage } from "../adminOperations/AdminOperationsPage";
import { AdminOperationsRecordsPage } from "../adminOperations/AdminOperationsRecordsPage";
import { AdminWorkbenchPage } from "../workbench/AdminWorkbenchPage";
import { adminWorkbenchDefinitions } from "../workbench/definitions";

import { AdminDataPage } from "./AdminDataPage";
import { buildAdminRouteMeta } from "./adminRouteMeta";

export async function renderAdminRoute(pathname: string) {
  if (pathname === "/admin/overview") {
    return <AdminOverviewPage />;
  }

  if (
    pathname === "/admin/ingestion/manual" ||
    pathname === "/admin/ingestion/repository" ||
    pathname === "/admin/records/imports"
  ) {
    return <AdminIngestionPage route={pathname} />;
  }

  if (
    pathname === "/admin/skills" ||
    pathname === "/admin/jobs" ||
    pathname === "/admin/sync-jobs" ||
    pathname === "/admin/sync-policy/repository"
  ) {
    return <AdminCatalogPage route={pathname} />;
  }

  if (pathname === "/admin/integrations") {
    return <AdminIntegrationsPage />;
  }

  if (pathname === "/admin/organizations") {
    return <AdminOrganizationsPage />;
  }

  if (pathname === "/admin/moderation") {
    return <AdminModerationPage />;
  }

  if (pathname === "/admin/access") {
    return <AdminAccessPage />;
  }

  if (
    pathname === "/admin/accounts" ||
    pathname === "/admin/accounts/new" ||
    pathname === "/admin/roles" ||
    pathname === "/admin/roles/new"
  ) {
    return <AdminAccountsPage route={pathname} />;
  }

  if (pathname === "/admin/apikeys") {
    return <AdminAPIKeysPage />;
  }

  if (
    pathname === "/admin/ops/metrics" ||
    pathname === "/admin/ops/alerts" ||
    pathname === "/admin/ops/release-gates"
  ) {
    return <AdminOperationsPage route={pathname} />;
  }

  if (
    pathname === "/admin/ops/audit-export" ||
    pathname === "/admin/ops/recovery-drills" ||
    pathname === "/admin/ops/releases" ||
    pathname === "/admin/ops/change-approvals" ||
    pathname === "/admin/ops/backup/plans" ||
    pathname === "/admin/ops/backup/runs"
  ) {
    return <AdminOperationsRecordsPage route={pathname} />;
  }

  const workbenchDefinition = adminWorkbenchDefinitions[pathname];
  if (workbenchDefinition) {
    return <AdminWorkbenchPage route={pathname} />;
  }

  const locale = await resolveServerLocale();
  const protectedMessages = await loadProtectedMessages(locale);
  const routeMessages = protectedMessages.adminRoute;
  const meta = buildAdminRouteMeta(protectedMessages.adminNavigation)[pathname];

  if (!meta) {
    return (
      <ErrorState
        title={routeMessages.unknownRouteTitle}
        description={formatProtectedMessage(routeMessages.unknownRouteDescriptionTemplate, { pathname })}
      />
    );
  }

  try {
    const requestHeaders = new Headers(await headers());
    const payload = await fetchAdminCollection(requestHeaders, meta.endpoint);

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={routeMessages.eyebrow}
          title={meta.title}
          description={meta.description}
          actions={
            <Button asChild variant="outline">
              <a href={meta.endpoint} target="_blank" rel="noreferrer">
                {routeMessages.openEndpointAction}
              </a>
            </Button>
          }
        />
        <AdminDataPage
          title={meta.title}
          description={meta.description}
          endpoint={meta.endpoint}
          payload={payload}
          messages={{
            responsePayloadTitle: routeMessages.responsePayloadTitle,
            recordTitleTemplate: routeMessages.recordTitleTemplate,
            objectValueLabel: routeMessages.objectValueLabel
          }}
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={routeMessages.eyebrow} title={meta.title} description={meta.description} />
        <ErrorState description={error instanceof Error ? error.message : routeMessages.loadFailureDescription} />
      </div>
    );
  }
}
