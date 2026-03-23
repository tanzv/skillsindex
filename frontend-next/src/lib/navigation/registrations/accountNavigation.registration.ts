import { buildAccountNavigationItems } from "@/src/lib/routing/accountNavigation";
import { accountProfileRoute, accountRoutePrefix } from "@/src/lib/routing/protectedSurfaceLinks";

import type {
  ProtectedNavigationModuleRegistration,
  ProtectedNavigationRegistryMessages
} from "../protectedNavigationRegistry";

export function buildAccountNavigationRegistration(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationModuleRegistration {
  const items = buildAccountNavigationItems(
    messages.accountShell || {
      brandSubtitleSuffix: "Center",
      sectionsTitle: messages.adminNavigation.hubAccountLabel,
      currentUserTitle: "Current User",
      marketplaceAccessLine: "Marketplace access",
      marketplaceAccessPublic: "Public",
      marketplaceAccessRestricted: "Restricted",
      unknownUser: "Unknown User",
      guestRole: "guest",
      inactiveStatus: "inactive",
      navProfileLabel: "Profile",
      navProfileNote: "Manage profile information.",
      navSecurityLabel: "Security",
      navSecurityNote: "Review credentials and policies.",
      navSessionsLabel: "Sessions",
      navSessionsNote: "Inspect active sessions.",
      navApiCredentialsLabel: "API Credentials",
      navApiCredentialsNote: "Manage API credentials.",
      topbarOverflowTitle: "Account Menu",
      topbarOverflowHint: "Continue through account settings without leaving the protected shell."
    }
  );

  return {
    id: "account",
    order: 50,
    accountCenterVariant: "default",
    topLevel: {
      id: "account-home",
      href: accountProfileRoute,
      label: messages.adminNavigation.hubAccountLabel,
      description: messages.adminNavigation.hubAccountDescription,
      matchPrefixes: [accountRoutePrefix]
    },
    sidebar: {
      title: messages.accountShell?.sectionsTitle || messages.adminNavigation.hubAccountLabel,
      groups: [
        {
          id: "account-navigation",
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
