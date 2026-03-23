import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import { publicGovernanceRoute } from "@/src/lib/routing/publicRouteRegistry";
import {
  accountProfileRoute,
  adminOverviewRoute,
  marketplaceHomeRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import {
  listWorkspaceRouteEntries,
  resolveWorkspaceNavigationDescription,
  resolveWorkspaceNavigationLabel
} from "@/src/lib/routing/workspaceRouteMeta";

import type { NavigationLink } from "./adminNavigation";

export function buildWorkspaceNavigationItems(messages: WorkspaceMessages): NavigationLink[] {
  return listWorkspaceRouteEntries().map((route) => ({
    href: route,
    label: resolveWorkspaceNavigationLabel(route, messages),
    description: resolveWorkspaceNavigationDescription(route, messages)
  }));
}

export function buildWorkspaceRelatedLinks(messages: WorkspaceMessages): NavigationLink[] {
  return [
    { href: marketplaceHomeRoute, label: messages.relatedMarketplaceLabel, description: messages.relatedMarketplaceDescription },
    { href: adminOverviewRoute, label: messages.relatedAdminLabel, description: messages.relatedAdminDescription },
    { href: accountProfileRoute, label: messages.relatedAccountLabel, description: messages.relatedAccountDescription },
    { href: publicGovernanceRoute, label: messages.relatedGovernanceLabel, description: messages.relatedGovernanceDescription }
  ];
}
