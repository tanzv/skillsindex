import { buildAdminNavigationGroups } from "@/src/lib/routing/adminNavigation";
import {
  adminImportsRoute,
  adminJobsRoute,
  adminManualIntakeRoute,
  adminRepositoryIntakeRoute,
  adminSkillsRoute,
  adminSyncJobsRoute,
  adminSyncPolicyRoute
} from "@/src/lib/routing/protectedSurfaceLinks";

import type {
  ProtectedNavigationModuleRegistration,
  ProtectedNavigationRegistryMessages
} from "../protectedNavigationRegistry";

export function buildSkillManagementNavigationRegistration(
  messages: ProtectedNavigationRegistryMessages
): ProtectedNavigationModuleRegistration {
  const catalogGroup = buildAdminNavigationGroups(messages.adminNavigation).find((group) => group.id === "catalog");
  const intakeRouteSet = new Set<string>([adminManualIntakeRoute, adminRepositoryIntakeRoute, adminImportsRoute]);
  const governanceRouteSet = new Set<string>([adminSkillsRoute, adminJobsRoute]);
  const synchronizationRouteSet = new Set<string>([adminSyncJobsRoute, adminSyncPolicyRoute]);
  const skillRootItem = catalogGroup?.items.find((item) => item.href === adminSkillsRoute) || catalogGroup?.items[0];
  const intakeItems = (catalogGroup?.items || []).filter((item) => intakeRouteSet.has(item.href));
  const governanceItems = (catalogGroup?.items || []).filter((item) => governanceRouteSet.has(item.href));
  const synchronizationItems = (catalogGroup?.items || []).filter((item) => synchronizationRouteSet.has(item.href));

  return {
    id: "skill-management",
    order: 20,
    accountCenterVariant: "admin",
    topLevel: {
      id: "skill-management-home",
      href: skillRootItem?.href || adminSkillsRoute,
      label: skillRootItem?.label || messages.adminNavigation.itemSkillsLabel,
      description: skillRootItem?.description || messages.adminNavigation.itemSkillsDescription
    },
    sidebar: {
      title: skillRootItem?.label || messages.adminNavigation.itemSkillsLabel,
      description: skillRootItem?.description || messages.adminNavigation.itemSkillsDescription,
      groups: [
        {
          id: "skill-management-intake",
          title: "Intake Sources",
          items: intakeItems.map((item) => ({
            id: item.href,
            href: item.href,
            label: item.label,
            description: item.description || item.label
          }))
        },
        {
          id: "skill-management-governance",
          title: "Governance",
          items: governanceItems.map((item) => ({
            id: item.href,
            href: item.href,
            label: item.label,
            description: item.description || item.label
          }))
        },
        {
          id: "skill-management-synchronization",
          title: "Synchronization",
          items: synchronizationItems.map((item) => ({
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
