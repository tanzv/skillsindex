import type { AdminNavigationMessages } from "@/src/lib/i18n/protectedMessages";
import { adminOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";

import type {
  AdminRouteCapability,
  AdminRouteDefinition,
  AdminRouteDescriptor,
  AdminRouteDescriptorDefinition
} from "./adminRouteRegistry.contracts";
import { adminRouteDefinitions, adminRouteGroupDefinitions } from "./adminRouteRegistry.data";

export type {
  AdminAccountManagementRoute,
  AdminCatalogRoute,
  AdminIngestionRoute,
  AdminOperationsDashboardRoute,
  AdminOperationsRecordsRoute,
  AdminOperationsRoute,
  AdminRenderableWorkbenchRoute
} from "./adminRouteRegistry.families";
export {
  adminAccountManagementRoutePaths,
  adminCatalogRoutePaths,
  adminIngestionRoutePaths,
  adminOperationsDashboardRoutePaths,
  adminOperationsRecordRoutePaths,
  adminOperationsRoutePaths,
  adminRenderableWorkbenchRoutePaths
} from "./adminRouteRegistry.families";
export {
  isAdminAccountManagementRoute,
  isAdminCatalogRoute,
  isAdminIngestionRoute,
  isAdminOperationsDashboardRoute,
  isAdminOperationsRecordsRoute,
  isAdminOperationsRoute,
  isAdminRenderableWorkbenchRoute
} from "./adminRouteRegistry.matchers";
export type {
  AdminRouteCapability,
  AdminRouteDefinition,
  AdminRouteDescriptor,
  AdminRouteGroupId,
  AdminRouteRenderTarget
} from "./adminRouteRegistry.contracts";

function normalizeAdminRouteCapability(value: AdminRouteDescriptorDefinition["requiredCapability"]): AdminRouteCapability {
  return value || "admin_surface";
}

const adminRouteDefinitionLookup = new Map<string, AdminRouteDescriptorDefinition>(
  adminRouteDefinitions.map((definition) => [definition.path, definition])
);

export const adminRoutePaths = Object.freeze(adminRouteDefinitions.map((definition) => definition.path));

function materializeAdminRouteDescriptor(
  definition: AdminRouteDescriptorDefinition,
  messages: AdminNavigationMessages
): AdminRouteDescriptor {
  return {
    path: definition.path,
    groupId: definition.groupId,
    label: definition.label(messages),
    description: definition.description(messages),
    renderTarget: definition.renderTarget,
    requiredCapability: normalizeAdminRouteCapability(definition.requiredCapability),
    endpoint: definition.endpoint,
    quickLink: Boolean(definition.quickLink),
    hiddenFromNavigation: Boolean(definition.hiddenFromNavigation)
  };
}

function materializeAdminRouteDefinition(definition: AdminRouteDescriptorDefinition): AdminRouteDefinition {
  return {
    path: definition.path,
    groupId: definition.groupId,
    renderTarget: definition.renderTarget,
    requiredCapability: normalizeAdminRouteCapability(definition.requiredCapability),
    endpoint: definition.endpoint,
    quickLink: Boolean(definition.quickLink),
    hiddenFromNavigation: Boolean(definition.hiddenFromNavigation)
  };
}

export function buildAdminRouteDescriptors(messages: AdminNavigationMessages): AdminRouteDescriptor[] {
  return adminRouteDefinitions.map((definition) => materializeAdminRouteDescriptor(definition, messages));
}

export function listAdminRoutePathsByCapability(capability: AdminRouteCapability): string[] {
  return adminRouteDefinitions
    .filter((definition) => {
      const requiredCapability = "requiredCapability" in definition ? definition.requiredCapability : undefined;
      return normalizeAdminRouteCapability(requiredCapability) === capability;
    })
    .map((definition) => definition.path);
}

export function resolveAdminRouteDefinition(pathname: string): AdminRouteDefinition | null {
  const definition = adminRouteDefinitionLookup.get(pathname);
  return definition ? materializeAdminRouteDefinition(definition) : null;
}

export function resolveAdminRouteDescriptor(pathname: string, messages: AdminNavigationMessages): AdminRouteDescriptor | null {
  const definition = adminRouteDefinitionLookup.get(pathname);
  return definition ? materializeAdminRouteDescriptor(definition, messages) : null;
}

export function buildAdminRouteGroups(messages: AdminNavigationMessages) {
  const descriptors = buildAdminRouteDescriptors(messages).filter((descriptor) => !descriptor.hiddenFromNavigation);

  return adminRouteGroupDefinitions.map((group) => {
    const items = descriptors
      .filter((descriptor) => descriptor.groupId === group.id)
      .map((descriptor) => ({
        href: descriptor.path,
        label: descriptor.label,
        description: descriptor.description
      }));

    return {
      id: group.id,
      label: group.label(messages),
      href: items[0]?.href || adminOverviewRoute,
      items
    };
  });
}
