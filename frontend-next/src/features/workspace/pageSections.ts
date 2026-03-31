import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import {
  workspaceActionsRoute,
  workspaceActivityRoute,
  workspaceOverviewRoute,
  workspacePolicyRoute,
  workspaceQueueRoute,
  workspaceRunbookRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import type { WorkspaceRoute } from "@/src/lib/routing/routes";
import type { SessionContext } from "@/src/lib/schemas/session";

import {
  buildActionsRouteSections,
  buildActivityRouteSections,
  buildOverviewRouteSections,
  buildPolicyRouteSections,
  buildQueueRouteSections,
  buildRunbookRouteSections,
  type WorkspaceRouteSections
} from "./pageSectionRouteBuilders";
import type { WorkspaceRoutePath, WorkspaceSnapshot } from "./types";

type WorkspaceRouteSectionsBuilder = (
  session: SessionContext,
  snapshot: WorkspaceSnapshot,
  messages: WorkspaceMessages
) => WorkspaceRouteSections;

const workspaceRouteSectionBuilders: Record<WorkspaceRoute, WorkspaceRouteSectionsBuilder> = {
  [workspaceOverviewRoute]: buildOverviewRouteSections,
  [workspaceActivityRoute]: buildActivityRouteSections,
  [workspaceQueueRoute]: buildQueueRouteSections,
  [workspacePolicyRoute]: buildPolicyRouteSections,
  [workspaceRunbookRoute]: buildRunbookRouteSections,
  [workspaceActionsRoute]: buildActionsRouteSections
};

export function resolveRouteSections(
  route: WorkspaceRoutePath,
  session: SessionContext,
  snapshot: WorkspaceSnapshot,
  messages: WorkspaceMessages
): WorkspaceRouteSections {
  return workspaceRouteSectionBuilders[route](session, snapshot, messages);
}
