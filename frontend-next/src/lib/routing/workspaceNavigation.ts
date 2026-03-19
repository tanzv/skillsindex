import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";

import type { NavigationLink } from "./adminNavigation";

export function buildWorkspaceNavigationItems(messages: WorkspaceMessages): NavigationLink[] {
  return [
    { href: "/workspace", label: messages.navOverviewLabel, description: messages.navOverviewDescription },
    { href: "/workspace/activity", label: messages.navActivityLabel, description: messages.navActivityDescription },
    { href: "/workspace/queue", label: messages.navQueueLabel, description: messages.navQueueDescription },
    { href: "/workspace/policy", label: messages.navPolicyLabel, description: messages.navPolicyDescription },
    { href: "/workspace/runbook", label: messages.navRunbookLabel, description: messages.navRunbookDescription },
    { href: "/workspace/actions", label: messages.navActionsLabel, description: messages.navActionsDescription }
  ];
}

export function buildWorkspaceRelatedLinks(messages: WorkspaceMessages): NavigationLink[] {
  return [
    { href: "/", label: messages.relatedMarketplaceLabel, description: messages.relatedMarketplaceDescription },
    { href: "/admin/overview", label: messages.relatedAdminLabel, description: messages.relatedAdminDescription },
    { href: "/account/profile", label: messages.relatedAccountLabel, description: messages.relatedAccountDescription },
    { href: "/governance", label: messages.relatedGovernanceLabel, description: messages.relatedGovernanceDescription }
  ];
}
