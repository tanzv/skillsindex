import type { AccountShellMessages } from "@/src/lib/i18n/protectedMessages";

import type { NavigationLink } from "./adminNavigation";

export function buildAccountNavigationItems(messages: AccountShellMessages): NavigationLink[] {
  return [
    {
      href: "/account/profile",
      label: messages.navProfileLabel,
      description: messages.navProfileNote
    },
    {
      href: "/account/security",
      label: messages.navSecurityLabel,
      description: messages.navSecurityNote
    },
    {
      href: "/account/sessions",
      label: messages.navSessionsLabel,
      description: messages.navSessionsNote
    },
    {
      href: "/account/api-credentials",
      label: messages.navApiCredentialsLabel,
      description: messages.navApiCredentialsNote
    }
  ];
}
