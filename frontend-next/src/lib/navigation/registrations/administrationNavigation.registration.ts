import { buildAdminNavigationGroups } from "@/src/lib/routing/adminNavigation";
import { adminOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";

import type {
  ProtectedNavigationModuleRegistration,
  ProtectedNavigationRegistryMessages
} from "../protectedNavigationRegistry";

export function buildAdministrationNavigationRegistration(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationModuleRegistration {
  const groups = buildAdminNavigationGroups(messages.adminNavigation);
  const overviewGroup = groups.find((group) => group.id === "overview");
  const operationsGroup = groups.find((group) => group.id === "operations");
  const securityGroup = groups.find((group) => group.id === "security");

  return {
    id: "administration",
    order: 40,
    accountCenterVariant: "admin",
    topLevel: {
      id: "administration-home",
      href: adminOverviewRoute,
      label: messages.adminNavigation.moduleAdministrationLabel,
      description: messages.adminNavigation.moduleAdministrationDescription
    },
    sidebar: {
      title: messages.adminNavigation.moduleAdministrationLabel,
      description: messages.adminNavigation.moduleAdministrationDescription,
      groups: [
        {
          id: "administration-overview",
          title: overviewGroup?.label,
          items: (overviewGroup?.items || []).map((item) => ({
            id: item.href,
            href: item.href,
            label: item.label,
            description: item.description || item.label
          }))
        },
        {
          id: "administration-operations",
          title: operationsGroup?.label,
          items: (operationsGroup?.items || []).map((item) => ({
            id: item.href,
            href: item.href,
            label: item.label,
            description: item.description || item.label
          }))
        },
        {
          id: "administration-security",
          title: securityGroup?.label,
          items: (securityGroup?.items || []).map((item) => ({
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
