import type { AdminNavigationMessages } from "@/src/lib/i18n/protectedMessages";
import { buildAdminRouteGroups, buildAdminRouteDescriptors } from "./adminRouteRegistry";

export interface NavigationLink {
  href: string;
  label: string;
  description?: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  href: string;
  items: NavigationLink[];
}

export function buildAdminNavigationGroups(messages: AdminNavigationMessages): NavigationGroup[] {
  return buildAdminRouteGroups(messages);
}

export function buildAdminQuickLinks(messages: AdminNavigationMessages): NavigationLink[] {
  return buildAdminRouteDescriptors(messages)
    .filter((descriptor) => descriptor.quickLink && !descriptor.hiddenFromNavigation)
    .map((descriptor) => ({
      href: descriptor.path,
      label: descriptor.label,
      description: descriptor.description
    }));
}

export function resolveAdminGroup(pathname: string, groups: NavigationGroup[]): NavigationGroup {
  return groups.find((group) => group.items.some((item) => item.href === pathname || pathname.startsWith(`${item.href}/`))) || groups[0];
}
