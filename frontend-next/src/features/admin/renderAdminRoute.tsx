import {
  type AdminAccountManagementRoute,
  type AdminCatalogRoute,
  type AdminIngestionRoute,
  type AdminOperationsDashboardRoute,
  type AdminOperationsRecordsRoute,
  type AdminRenderableWorkbenchRoute,
  isAdminAccountManagementRoute,
  isAdminCatalogRoute,
  isAdminIngestionRoute,
  isAdminOperationsDashboardRoute,
  isAdminOperationsRecordsRoute,
  isAdminRenderableWorkbenchRoute,
  resolveAdminRouteDefinition
} from "@/src/lib/routing/adminRouteRegistry";
import type { AdminIngestionRepositorySnapshot } from "@/src/features/adminIngestion/model";
import { adminRepositoryIntakeRoute } from "@/src/lib/routing/protectedSurfaceLinks";

import { renderAdminDataRoute } from "./renderAdminDataRoute";

export interface RenderAdminRouteOptions {
  initialRepositorySnapshot?: AdminIngestionRepositorySnapshot | null;
  initialQuery?: Record<string, string>;
}

async function renderOverviewRoute() {
  const { AdminOverviewPage } = await import("../adminOverview/AdminOverviewPage");
  return <AdminOverviewPage />;
}

async function renderIngestionRoute(pathname: AdminIngestionRoute, options: RenderAdminRouteOptions) {
  const { AdminIngestionPage } = await import("../adminIngestion/AdminIngestionPage");
  return (
    <AdminIngestionPage
      route={pathname}
      initialRepositorySnapshot={pathname === adminRepositoryIntakeRoute ? options.initialRepositorySnapshot || null : null}
    />
  );
}

async function renderCatalogRoute(pathname: AdminCatalogRoute, options: RenderAdminRouteOptions) {
  const { AdminCatalogPage } = await import("../adminCatalog/AdminCatalogPage");
  return <AdminCatalogPage route={pathname} initialQuery={options.initialQuery} />;
}

async function renderIntegrationsRoute() {
  const { AdminIntegrationsPage } = await import("../adminGovernance/AdminIntegrationsPage");
  return <AdminIntegrationsPage />;
}

async function renderOrganizationsRoute() {
  const { AdminOrganizationsPage } = await import("../adminGovernance/AdminOrganizationsPage");
  return <AdminOrganizationsPage />;
}

async function renderModerationRoute() {
  const { AdminModerationPage } = await import("../adminGovernance/AdminModerationPage");
  return <AdminModerationPage />;
}

async function renderAccessRoute() {
  const { AdminAccessPage } = await import("../adminAccess/AdminAccessPage");
  return <AdminAccessPage />;
}

async function renderAccountsRoute(pathname: AdminAccountManagementRoute) {
  const { AdminAccountsPage } = await import("../adminAccounts/AdminAccountsPage");
  return <AdminAccountsPage route={pathname} />;
}

async function renderApiKeysRoute() {
  const { AdminAPIKeysPage } = await import("../adminApiKeys/AdminAPIKeysPage");
  return <AdminAPIKeysPage />;
}

async function renderOperationsDashboardRoute(pathname: AdminOperationsDashboardRoute) {
  const { AdminOperationsPage } = await import("../adminOperations/AdminOperationsPage");
  return <AdminOperationsPage route={pathname} />;
}

async function renderOperationsRecordsRoute(pathname: AdminOperationsRecordsRoute) {
  const { AdminOperationsRecordsPage } = await import("../adminOperations/AdminOperationsRecordsPage");
  return <AdminOperationsRecordsPage route={pathname} />;
}

async function renderWorkbenchRoute(pathname: AdminRenderableWorkbenchRoute) {
  const { AdminWorkbenchPage } = await import("../workbench/AdminWorkbenchPage");
  return <AdminWorkbenchPage route={pathname} />;
}

async function hasRenderableWorkbenchDefinition(pathname: string) {
  const { resolveAdminRenderableWorkbenchDefinition } = await import("../workbench/definitions");
  return Boolean(resolveAdminRenderableWorkbenchDefinition(pathname));
}

export async function renderAdminRoute(pathname: string, options: RenderAdminRouteOptions = {}) {
  const routeDefinition = resolveAdminRouteDefinition(pathname);

  if (routeDefinition) {
    switch (routeDefinition.renderTarget) {
      case "overview":
        return renderOverviewRoute();
      case "ingestion":
        if (isAdminIngestionRoute(pathname)) {
          return renderIngestionRoute(pathname, options);
        }
        break;
      case "catalog":
        if (isAdminCatalogRoute(pathname)) {
          return renderCatalogRoute(pathname, options);
        }
        break;
      case "integrations":
        return renderIntegrationsRoute();
      case "organizations":
        return renderOrganizationsRoute();
      case "moderation":
        return renderModerationRoute();
      case "access":
        return renderAccessRoute();
      case "accounts":
        if (isAdminAccountManagementRoute(pathname)) {
          return renderAccountsRoute(pathname);
        }
        break;
      case "apikeys":
        return renderApiKeysRoute();
      case "ops-dashboard":
        if (isAdminOperationsDashboardRoute(pathname)) {
          return renderOperationsDashboardRoute(pathname);
        }
        break;
      case "ops-records":
        if (isAdminOperationsRecordsRoute(pathname)) {
          return renderOperationsRecordsRoute(pathname);
        }
        break;
      case "workbench":
        if (isAdminRenderableWorkbenchRoute(pathname) && (await hasRenderableWorkbenchDefinition(pathname))) {
          return renderWorkbenchRoute(pathname);
        }
        break;
      default:
        break;
    }
  }

  return renderAdminDataRoute(pathname);
}
