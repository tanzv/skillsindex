import type {
  AccountShellMessages,
  AdminNavigationMessages,
  ProtectedTopbarMessages,
  WorkspaceShellMessages
} from "@/src/lib/i18n/protectedMessages";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { ProtectedTopbarConfig } from "@/src/lib/navigation/protectedTopbarContracts";
import { listAdminRoutePathsByCapability } from "@/src/lib/routing/adminRouteRegistry";
import {
  adminAdministrationModuleMatchPrefixes,
  adminOrganizationManagementSurfaceRoutes,
  adminSkillManagementSurfaceRoutes,
  accountProfileRoute,
  accountRoutePrefix,
  adminOrganizationsRoute,
  adminOverviewRoute,
  adminSkillsRoute,
  workspaceOverviewRoute,
  workspaceRoutePrefix
} from "@/src/lib/routing/protectedSurfaceLinks";

import { buildAccountNavigationRegistration } from "./registrations/accountNavigation.registration";
import { buildAdministrationNavigationRegistration } from "./registrations/administrationNavigation.registration";
import { buildOrganizationNavigationRegistration } from "./registrations/organizationNavigation.registration";
import { buildSkillManagementNavigationRegistration } from "./registrations/skillManagementNavigation.registration";
import { buildWorkspaceNavigationRegistration } from "./registrations/workspaceNavigation.registration";

export type ProtectedNavigationModuleId =
  | "workspace"
  | "skill-management"
  | "organization-management"
  | "administration"
  | "account";
export type ProtectedAccountCenterVariant = "default" | "admin";

export interface ProtectedNavigationEntryDescriptor {
  id: string;
  href: string;
  label: string;
  description: string;
  matchPrefixes?: string[];
}

export interface ProtectedNavigationSidebarGroupDescriptor {
  id: string;
  title?: string;
  items: ProtectedNavigationEntryDescriptor[];
}

export interface ProtectedNavigationModuleRegistration {
  id: ProtectedNavigationModuleId;
  order: number;
  accountCenterVariant: ProtectedAccountCenterVariant;
  topLevel: ProtectedNavigationEntryDescriptor;
  sidebar: {
    title: string;
    description?: string;
    groups: ProtectedNavigationSidebarGroupDescriptor[];
  };
}

export interface ProtectedNavigationRegistryMessages {
  adminNavigation: AdminNavigationMessages;
  workspacePage: WorkspaceMessages;
  workspaceShell?: WorkspaceShellMessages;
  accountShell?: AccountShellMessages;
}

export interface ProtectedNavigationRegistry {
  modules: ProtectedNavigationModuleRegistration[];
}

export interface AdminShellNavigationOptions {
  includeElevatedGovernance?: boolean;
  includeUserManagement?: boolean;
}

export interface ProtectedNavigationShellOptions {
  primaryGroupLabel: string;
  primaryGroupTag: string;
  overflowTitle: string;
  overflowHint: string;
  overflowPrimaryTitle: string;
}

export interface ResolvedProtectedNavigationItem extends ProtectedNavigationEntryDescriptor {
  active: boolean;
}

export interface ResolvedProtectedNavigationGroup {
  id: string;
  title?: string;
  items: ResolvedProtectedNavigationItem[];
}

export interface ResolvedProtectedNavigationSidebarState {
  activeModule: ProtectedNavigationModuleRegistration;
  activeItem: ResolvedProtectedNavigationItem | null;
  groups: ResolvedProtectedNavigationGroup[];
}

const PRIMARY_GROUP_ID = "protected-navigation-primary-group";
const PRIMARY_OVERFLOW_GROUP_ID = "primary";

function matchesProtectedPathname(pathname: string, href: string, matchPrefixes?: string[]) {
  const prefixes = matchPrefixes && matchPrefixes.length > 0 ? matchPrefixes : [href];

  return prefixes.some((prefix) => {
    if (prefix === "/") {
      return pathname === "/";
    }

    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

function collectModuleMatchPrefixes(module: ProtectedNavigationModuleRegistration) {
  const itemPrefixes = module.sidebar.groups.flatMap((group) => group.items.map((item) => item.href));
  const topLevelPrefixes = module.topLevel.matchPrefixes && module.topLevel.matchPrefixes.length > 0
    ? module.topLevel.matchPrefixes
    : [module.topLevel.href];

  return Array.from(new Set([...topLevelPrefixes, ...itemPrefixes]));
}

function resolveFallbackModule(modules: ProtectedNavigationModuleRegistration[]) {
  return modules[0];
}

function removeNavigationHrefsFromRegistry(
  registry: ProtectedNavigationRegistry,
  hiddenHrefs: ReadonlySet<string>
): ProtectedNavigationRegistry {
  return {
    modules: registry.modules.map((module) => ({
      ...module,
      sidebar: {
        ...module.sidebar,
        groups: module.sidebar.groups
          .map((group) => ({
            ...group,
            items: group.items.filter((item) => !hiddenHrefs.has(item.href))
          }))
          .filter((group) => group.items.length > 0)
      }
    }))
  };
}

function createWorkspaceShellNavigationModule(
  module: Pick<ProtectedNavigationModuleRegistration, "id" | "order" | "accountCenterVariant" | "topLevel">
): ProtectedNavigationModuleRegistration {
  return {
    ...module,
    sidebar: {
      title: module.topLevel.label,
      description: module.topLevel.description,
      groups: []
    }
  };
}

function createWorkspaceTopLevelNavigationModule(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationModuleRegistration {
  return createWorkspaceShellNavigationModule({
    id: "workspace",
    order: 10,
    accountCenterVariant: "default",
    topLevel: {
      id: "workspace-home",
      href: workspaceOverviewRoute,
      label: messages.adminNavigation.hubWorkspaceLabel,
      description: messages.adminNavigation.hubWorkspaceDescription,
      matchPrefixes: [workspaceRoutePrefix]
    }
  });
}

function createSkillManagementTopLevelNavigationModule(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationModuleRegistration {
  return createWorkspaceShellNavigationModule({
    id: "skill-management",
    order: 20,
    accountCenterVariant: "admin",
    topLevel: {
      id: "skill-management-home",
      href: adminSkillsRoute,
      label: messages.adminNavigation.itemSkillsLabel,
      description: messages.adminNavigation.itemSkillsDescription,
      matchPrefixes: [...adminSkillManagementSurfaceRoutes]
    }
  });
}

function createOrganizationManagementTopLevelNavigationModule(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationModuleRegistration {
  return createWorkspaceShellNavigationModule({
    id: "organization-management",
    order: 30,
    accountCenterVariant: "admin",
    topLevel: {
      id: "organization-management-home",
      href: adminOrganizationsRoute,
      label: messages.adminNavigation.itemOrganizationsLabel,
      description: messages.adminNavigation.itemOrganizationsDescription,
      matchPrefixes: [...adminOrganizationManagementSurfaceRoutes]
    }
  });
}

function createAdministrationTopLevelNavigationModule(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationModuleRegistration {
  return createWorkspaceShellNavigationModule({
    id: "administration",
    order: 40,
    accountCenterVariant: "admin",
    topLevel: {
      id: "administration-home",
      href: adminOverviewRoute,
      label: messages.adminNavigation.moduleAdministrationLabel,
      description: messages.adminNavigation.moduleAdministrationDescription,
      matchPrefixes: [...adminAdministrationModuleMatchPrefixes]
    }
  });
}

function createAccountTopLevelNavigationModule(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationModuleRegistration {
  return createWorkspaceShellNavigationModule({
    id: "account",
    order: 50,
    accountCenterVariant: "default",
    topLevel: {
      id: "account-home",
      href: accountProfileRoute,
      label: messages.adminNavigation.hubAccountLabel,
      description: messages.adminNavigation.hubAccountDescription,
      matchPrefixes: [accountRoutePrefix]
    }
  });
}

export function buildProtectedNavigationRegistry(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationRegistry {
  const modules = [
    buildWorkspaceNavigationRegistration(messages),
    buildSkillManagementNavigationRegistration(messages),
    buildOrganizationNavigationRegistration(messages),
    buildAdministrationNavigationRegistration(messages),
    buildAccountNavigationRegistration(messages)
  ].sort((left, right) => left.order - right.order);

  return { modules };
}

export function buildWorkspaceShellNavigationRegistry(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationRegistry {
  const modules = [
    buildWorkspaceNavigationRegistration(messages),
    createSkillManagementTopLevelNavigationModule(messages),
    createOrganizationManagementTopLevelNavigationModule(messages),
    createAdministrationTopLevelNavigationModule(messages),
    createAccountTopLevelNavigationModule(messages)
  ].sort((left, right) => left.order - right.order);

  return { modules };
}

export function buildAdminShellNavigationRegistry(
  messages: ProtectedNavigationRegistryMessages,
  options: AdminShellNavigationOptions = {}
): ProtectedNavigationRegistry {
  const registry: ProtectedNavigationRegistry = {
    modules: [
    createWorkspaceTopLevelNavigationModule(messages),
    buildSkillManagementNavigationRegistration(messages),
    buildOrganizationNavigationRegistration(messages),
    buildAdministrationNavigationRegistration(messages),
    createAccountTopLevelNavigationModule(messages)
  ].sort((left, right) => left.order - right.order)
  };

  const hiddenHrefs = new Set<string>();

  if (options.includeElevatedGovernance === false) {
    listAdminRoutePathsByCapability("view_all_admin").forEach((href) => hiddenHrefs.add(href));
  }

  if (options.includeUserManagement === false) {
    listAdminRoutePathsByCapability("manage_users").forEach((href) => hiddenHrefs.add(href));
  }

  if (hiddenHrefs.size > 0) {
    return removeNavigationHrefsFromRegistry(registry, hiddenHrefs);
  }

  return registry;
}

export function buildAccountShellNavigationRegistry(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationRegistry {
  const modules = [
    createWorkspaceTopLevelNavigationModule(messages),
    createSkillManagementTopLevelNavigationModule(messages),
    createOrganizationManagementTopLevelNavigationModule(messages),
    createAdministrationTopLevelNavigationModule(messages),
    buildAccountNavigationRegistration(messages)
  ].sort((left, right) => left.order - right.order);

  return { modules };
}

export function resolveProtectedNavigationModule(
  pathname: string,
  registry: ProtectedNavigationRegistry
): ProtectedNavigationModuleRegistration {
  return (
    registry.modules.find((module) => matchesProtectedPathname(pathname, module.topLevel.href, collectModuleMatchPrefixes(module))) ||
    resolveFallbackModule(registry.modules)
  );
}

export function resolveProtectedNavigationSidebarState(
  pathname: string,
  registry: ProtectedNavigationRegistry
): ResolvedProtectedNavigationSidebarState {
  const activeModule = resolveProtectedNavigationModule(pathname, registry);
  let activeItem: ResolvedProtectedNavigationItem | null = null;

  const groups = activeModule.sidebar.groups.map((group) => {
    const resolvedItems = group.items.map<ResolvedProtectedNavigationItem>((item) => {
      const active = matchesProtectedPathname(pathname, item.href, item.matchPrefixes);
      const resolvedItem = {
        ...item,
        active
      };

      if (active && activeItem === null) {
        activeItem = resolvedItem;
      }

      return resolvedItem;
    });

    return {
      id: group.id,
      title: group.title,
      items: resolvedItems
    };
  });

  return {
    activeModule,
    activeItem,
    groups
  };
}

export function buildProtectedTopbarConfigFromRegistry(
  pathname: string,
  registry: ProtectedNavigationRegistry,
  shellOptions: ProtectedNavigationShellOptions,
  topbarMessages: ProtectedTopbarMessages
): ProtectedTopbarConfig {
  return {
    entries: registry.modules.map((module) => ({
      id: module.id,
      href: module.topLevel.href,
      label: module.topLevel.label,
      description: module.topLevel.description,
      kind: "primary" as const,
      overflowGroupId: PRIMARY_OVERFLOW_GROUP_ID,
      matchPrefixes: collectModuleMatchPrefixes(module)
    })),
    primaryGroups: [
      {
        id: PRIMARY_GROUP_ID,
        label: shellOptions.primaryGroupLabel,
        tagLabel: shellOptions.primaryGroupTag,
        kind: "primary"
      }
    ],
    overflowGroupTitles: {
      [PRIMARY_OVERFLOW_GROUP_ID]: shellOptions.overflowPrimaryTitle
    },
    overflowGroupOrder: [PRIMARY_OVERFLOW_GROUP_ID],
    overflowTitle: shellOptions.overflowTitle,
    overflowHint: shellOptions.overflowHint,
    overflowMetricLabels: {
      visible: topbarMessages.overflowVisibleMetricLabel,
      hidden: topbarMessages.overflowHiddenMetricLabel
    }
  };
}

export function resolveProtectedBrandSubtitle(
  pathname: string,
  registry: ProtectedNavigationRegistry,
  suffix: string
) {
  const sidebarState = resolveProtectedNavigationSidebarState(pathname, registry);
  return sidebarState.activeItem?.description || sidebarState.activeModule.topLevel.description || `${sidebarState.activeModule.topLevel.label} ${suffix}`;
}
