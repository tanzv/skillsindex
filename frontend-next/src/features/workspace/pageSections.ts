import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
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

export function buildRouteSections(
  session: SessionContext,
  snapshot: WorkspaceSnapshot,
  messages: WorkspaceMessages
): Record<WorkspaceRoutePath, WorkspaceRouteSections> {
  return {
    "/workspace": buildOverviewRouteSections(session, snapshot, messages),
    "/workspace/activity": buildActivityRouteSections(session, snapshot, messages),
    "/workspace/queue": buildQueueRouteSections(session, snapshot, messages),
    "/workspace/policy": buildPolicyRouteSections(session, snapshot, messages),
    "/workspace/runbook": buildRunbookRouteSections(session, snapshot, messages),
    "/workspace/actions": buildActionsRouteSections(session, snapshot, messages)
  };
}
