import { buildWorkspaceNavigationItems } from "@/src/lib/routing/workspaceNavigation";
import { workspaceOverviewRoute, workspaceRoutePrefix } from "@/src/lib/routing/protectedSurfaceLinks";

import type {
  ProtectedNavigationModuleRegistration,
  ProtectedNavigationRegistryMessages
} from "../protectedNavigationRegistry";

export function buildWorkspaceNavigationRegistration(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationModuleRegistration {
  const items = buildWorkspaceNavigationItems(messages.workspacePage);

  return {
    id: "workspace",
    order: 10,
    accountCenterVariant: "default",
    topLevel: {
      id: "workspace-home",
      href: workspaceOverviewRoute,
      label: messages.adminNavigation.hubWorkspaceLabel,
      description: messages.adminNavigation.hubWorkspaceDescription,
      matchPrefixes: [workspaceRoutePrefix]
    },
    sidebar: {
      title: messages.workspaceShell?.deckTitle || messages.adminNavigation.hubWorkspaceLabel,
      description: messages.workspaceShell?.deckDescription,
      groups: [
        {
          id: "workspace-navigation",
          items: items.map((item) => ({
            id: item.href,
            href: item.href,
            label: item.label,
            description: item.description || item.label
          }))
        }
      ]
    }
  };
}
