import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import { workspaceMessageFallbacks } from "@/src/lib/i18n/protectedPageMessages.workspace";

export interface WorkspaceRouteMeta {
  title: string;
  description: string;
}

export function buildWorkspaceRouteMeta(messages: WorkspaceMessages): Record<string, WorkspaceRouteMeta> {
  return {
    "/workspace": {
      title: messages.routeOverviewTitle,
      description: messages.routeOverviewDescription
    },
    "/workspace/activity": {
      title: messages.routeActivityTitle,
      description: messages.routeActivityDescription
    },
    "/workspace/queue": {
      title: messages.routeQueueTitle,
      description: messages.routeQueueDescription
    },
    "/workspace/policy": {
      title: messages.routePolicyTitle,
      description: messages.routePolicyDescription
    },
    "/workspace/runbook": {
      title: messages.routeRunbookTitle,
      description: messages.routeRunbookDescription
    },
    "/workspace/actions": {
      title: messages.routeActionsTitle,
      description: messages.routeActionsDescription
    }
  };
}

export const workspaceRouteMeta = buildWorkspaceRouteMeta(workspaceMessageFallbacks);
