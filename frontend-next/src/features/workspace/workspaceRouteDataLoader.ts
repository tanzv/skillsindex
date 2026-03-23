import { fetchMarketplace } from "@/src/lib/api/public";
import {
  resolveWorkspaceMarketplaceQuery,
  type WorkspaceRouteMarketplaceQuery
} from "@/src/lib/routing/workspaceRouteMeta";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import type { WorkspaceRoutePath } from "./types";
export type WorkspaceRouteDataFetch = (
  requestHeaders: Headers,
  searchParams?: WorkspaceRouteMarketplaceQuery
) => Promise<PublicMarketplaceResponse>;
export { resolveWorkspaceMarketplaceQuery };

export async function loadWorkspaceRouteData(
  route: WorkspaceRoutePath,
  requestHeaders: Headers,
  fetchMarketplaceData: WorkspaceRouteDataFetch = fetchMarketplace
): Promise<PublicMarketplaceResponse> {
  return fetchMarketplaceData(requestHeaders, resolveWorkspaceMarketplaceQuery(route));
}
