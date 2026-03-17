import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";
import type { SessionContext } from "@/src/lib/schemas/session";

import { buildSummaryMetrics } from "./pageMetrics";
import { buildRouteSections } from "./pageSections";
import { buildWorkspaceSnapshot } from "./snapshot";
import type { WorkspacePageModel, WorkspaceRoutePath } from "./types";
import { workspaceRouteMeta } from "./workspaceRouteMeta";

export function buildWorkspacePageModel(
  pathname: string,
  session: SessionContext,
  payload: PublicMarketplaceResponse = buildPublicMarketplaceFallback()
): WorkspacePageModel {
  const route = (workspaceRouteMeta[pathname] ? pathname : "/workspace") as WorkspaceRoutePath;
  const snapshot = buildWorkspaceSnapshot(payload, session);
  const meta = workspaceRouteMeta[route];
  const sections = buildRouteSections(session, snapshot);

  return {
    route,
    eyebrow: "Workspace",
    title: meta.title,
    description: meta.description,
    snapshot,
    summaryMetrics: buildSummaryMetrics(snapshot, session),
    ...sections[route]
  };
}
