import { adminRouteDefinitions } from "./adminRouteRegistry.data";

type AdminRouteEntry = (typeof adminRouteDefinitions)[number];

type AdminRoutePathByRenderTarget<TRenderTarget extends AdminRouteEntry["renderTarget"]> = Extract<
  AdminRouteEntry,
  { renderTarget: TRenderTarget }
>["path"];

function buildAdminRoutePathsByRenderTarget<TRenderTarget extends AdminRouteEntry["renderTarget"]>(
  renderTarget: TRenderTarget
): readonly AdminRoutePathByRenderTarget<TRenderTarget>[] {
  const routePaths: AdminRoutePathByRenderTarget<TRenderTarget>[] = [];

  for (const definition of adminRouteDefinitions) {
    if (definition.renderTarget === renderTarget) {
      const matchedDefinition = definition as Extract<AdminRouteEntry, { renderTarget: TRenderTarget }>;
      routePaths.push(matchedDefinition.path as AdminRoutePathByRenderTarget<TRenderTarget>);
    }
  }

  return routePaths;
}

export const adminIngestionRoutePaths = buildAdminRoutePathsByRenderTarget("ingestion");

export const adminCatalogRoutePaths = buildAdminRoutePathsByRenderTarget("catalog");

export const adminOperationsDashboardRoutePaths = buildAdminRoutePathsByRenderTarget("ops-dashboard");

export const adminOperationsRecordRoutePaths = buildAdminRoutePathsByRenderTarget("ops-records");

export const adminOperationsRoutePaths = [
  ...adminOperationsDashboardRoutePaths,
  ...adminOperationsRecordRoutePaths
] as const;

export const adminAccountManagementRoutePaths = buildAdminRoutePathsByRenderTarget("accounts");

export const adminRenderableWorkbenchRoutePaths = [] as const;

export type AdminIngestionRoute = typeof adminIngestionRoutePaths[number];
export type AdminCatalogRoute = typeof adminCatalogRoutePaths[number];
export type AdminOperationsDashboardRoute = typeof adminOperationsDashboardRoutePaths[number];
export type AdminOperationsRecordsRoute = typeof adminOperationsRecordRoutePaths[number];
export type AdminOperationsRoute = typeof adminOperationsRoutePaths[number];
export type AdminAccountManagementRoute = typeof adminAccountManagementRoutePaths[number];
export type AdminRenderableWorkbenchRoute = typeof adminRenderableWorkbenchRoutePaths[number];
