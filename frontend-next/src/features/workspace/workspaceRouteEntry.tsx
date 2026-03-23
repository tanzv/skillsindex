import type { ReactElement } from "react";

import type { WorkspaceRoutePath } from "@/src/features/workspace/types";
import { loadProtectedRouteSession } from "@/src/features/protected/loadProtectedRouteSession";

import { renderWorkspaceRoute } from "./renderWorkspaceRoute";

export async function renderWorkspacePageRoute(route: WorkspaceRoutePath): Promise<ReactElement> {
  const session = await loadProtectedRouteSession();
  return renderWorkspaceRoute(route, session);
}
