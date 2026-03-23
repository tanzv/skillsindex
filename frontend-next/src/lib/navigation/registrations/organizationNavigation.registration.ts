import { buildAdminNavigationGroups } from "@/src/lib/routing/adminNavigation";
import {
  adminAccessRoute,
  adminAccountsRoute,
  adminOrganizationsRoute,
  adminRolesRoute
} from "@/src/lib/routing/protectedSurfaceLinks";

import type {
  ProtectedNavigationModuleRegistration,
  ProtectedNavigationRegistryMessages
} from "../protectedNavigationRegistry";

export function buildOrganizationNavigationRegistration(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationModuleRegistration {
  const userGroup = buildAdminNavigationGroups(messages.adminNavigation).find((group) => group.id === "users");
  const directoryRouteSet = new Set<string>([adminAccountsRoute, adminOrganizationsRoute]);
  const permissionRouteSet = new Set<string>([adminRolesRoute, adminAccessRoute]);
  const organizationRootItem = userGroup?.items.find((item) => item.href === adminOrganizationsRoute) || userGroup?.items[0];
  const directoryItems = (userGroup?.items || []).filter((item) => directoryRouteSet.has(item.href));
  const permissionItems = (userGroup?.items || []).filter((item) => permissionRouteSet.has(item.href));

  return {
    id: "organization-management",
    order: 30,
    accountCenterVariant: "admin",
    topLevel: {
      id: "organization-management-home",
      href: organizationRootItem?.href || adminOrganizationsRoute,
      label: organizationRootItem?.label || messages.adminNavigation.itemOrganizationsLabel,
      description: organizationRootItem?.description || messages.adminNavigation.itemOrganizationsDescription
    },
    sidebar: {
      title: organizationRootItem?.label || messages.adminNavigation.itemOrganizationsLabel,
      description: organizationRootItem?.description || messages.adminNavigation.itemOrganizationsDescription,
      groups: [
        {
          id: "organization-management-directory",
          title: "Directory",
          items: directoryItems.map((item) => ({
            id: item.href,
            href: item.href,
            label: item.label,
            description: item.description || item.label
          }))
        },
        {
          id: "organization-management-permissions",
          title: "Permissions",
          items: permissionItems.map((item) => ({
            id: item.href,
            href: item.href,
            label: item.label,
            description: item.description || item.label
          }))
        }
      ].filter((group) => group.items.length > 0)
    }
  };
}
