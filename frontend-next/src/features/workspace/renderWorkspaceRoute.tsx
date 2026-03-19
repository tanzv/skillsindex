import type { SessionContext } from "@/src/lib/schemas/session";

import { WorkspaceRouteScene } from "./WorkspaceRouteScene";
import type { WorkspaceRoutePath } from "./types";

export function renderWorkspaceRoute(pathname: string, session: SessionContext) {
  return <WorkspaceRouteScene pathname={pathname as WorkspaceRoutePath} session={session} />;
}
