import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
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
  "/workspace": buildOverviewRouteSections,
  "/workspace/activity": buildActivityRouteSections,
  "/workspace/queue": buildQueueRouteSections,
  "/workspace/policy": buildPolicyRouteSections,
  "/workspace/runbook": buildRunbookRouteSections,
  "/workspace/actions": buildActionsRouteSections
};

export function resolveRouteSections(
  route: WorkspaceRoutePath,
  session: SessionContext,
  snapshot: WorkspaceSnapshot,
  messages: WorkspaceMessages
): WorkspaceRouteSections {
  return workspaceRouteSectionBuilders[route](session, snapshot, messages);
}
