import type { AccountShellMessages } from "@/src/lib/i18n/protectedMessages";
import {
  listAccountSectionEntries,
  resolveAccountSectionNavigationDescription,
  resolveAccountSectionNavigationLabel
} from "@/src/lib/routing/accountRouteMeta";

import type { NavigationLink } from "./adminNavigation";

export function buildAccountNavigationItems(messages: AccountShellMessages): NavigationLink[] {
  return listAccountSectionEntries().map(({ section, route }) => ({
    href: route,
    label: resolveAccountSectionNavigationLabel(section, messages),
    description: resolveAccountSectionNavigationDescription(section, messages)
  }));
}
