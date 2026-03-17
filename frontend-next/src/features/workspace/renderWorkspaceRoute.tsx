import type { SessionContext } from "@/src/lib/schemas/session";

import { buildWorkspacePageModel } from "./model";
import { WorkspaceRoutePage } from "./WorkspaceRoutePage";

export function renderWorkspaceRoute(pathname: string, session: SessionContext) {
  return <WorkspaceRoutePage model={buildWorkspacePageModel(pathname, session)} />;
}
