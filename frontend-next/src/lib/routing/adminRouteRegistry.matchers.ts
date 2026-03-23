import {
  adminAccountManagementRoutePaths,
  adminCatalogRoutePaths,
  adminIngestionRoutePaths,
  adminOperationsDashboardRoutePaths,
  adminOperationsRecordRoutePaths,
  adminOperationsRoutePaths,
  adminRenderableWorkbenchRoutePaths
} from "./adminRouteRegistry.families";

function createPathMatcher<const TPaths extends readonly string[]>(paths: TPaths) {
  const lookup = new Set<string>(paths);
  return (pathname: string): pathname is TPaths[number] => lookup.has(pathname);
}

export const isAdminIngestionRoute = createPathMatcher(adminIngestionRoutePaths);
export const isAdminCatalogRoute = createPathMatcher(adminCatalogRoutePaths);
export const isAdminOperationsDashboardRoute = createPathMatcher(adminOperationsDashboardRoutePaths);
export const isAdminOperationsRecordsRoute = createPathMatcher(adminOperationsRecordRoutePaths);
export const isAdminOperationsRoute = createPathMatcher(adminOperationsRoutePaths);
export const isAdminAccountManagementRoute = createPathMatcher(adminAccountManagementRoutePaths);
export const isAdminRenderableWorkbenchRoute = createPathMatcher(adminRenderableWorkbenchRoutePaths);
