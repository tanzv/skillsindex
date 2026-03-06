import type { WorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { createGlobalNavigationRegistry } from "../lib/globalNavigationRegistry";

export type WorkspaceSidebarItemKind = "section" | "route";
export type WorkspaceSidebarPrimaryMenuKind = WorkspaceSidebarItemKind | "label";

export interface WorkspaceSidebarItem {
  id: string;
  label: string;
  kind: WorkspaceSidebarItemKind;
  target: string;
}

export interface WorkspaceSidebarGroup {
  id: string;
  title: string;
  items: WorkspaceSidebarItem[];
}

export interface WorkspaceSidebarPrimaryMenuItem {
  id: string;
  label: string;
  kind: WorkspaceSidebarPrimaryMenuKind;
  target?: string;
}

interface BuildWorkspaceSidebarNavigationInput {
  text: Pick<
    WorkspaceCenterCopy,
    | "sidebarSectionsTitle"
    | "sidebarHubsTitle"
    | "sidebarOrganizationTitle"
    | "sidebarOverview"
    | "sidebarActivity"
    | "sidebarQueue"
    | "sidebarPolicy"
    | "sidebarRunbook"
    | "sidebarQuickActions"
    | "sidebarRollout"
    | "sidebarGovernance"
    | "sidebarRecords"
    | "sidebarPersonnelManagement"
    | "sidebarPermissionManagement"
    | "sidebarRoleManagement"
  >;
  toPublicPath: (path: string) => string;
  toAdminPath: (path: string) => string;
}

export function buildWorkspaceSidebarNavigation({
  text,
  toPublicPath,
  toAdminPath
}: BuildWorkspaceSidebarNavigationInput): WorkspaceSidebarGroup[] {
  return [
    {
      id: "sections",
      title: text.sidebarSectionsTitle,
      items: [
        { id: "section-overview", label: text.sidebarOverview, kind: "section", target: "workspace-overview" },
        { id: "section-activity", label: text.sidebarActivity, kind: "section", target: "workspace-activity" },
        { id: "section-queue", label: text.sidebarQueue, kind: "section", target: "workspace-queue" },
        { id: "section-policy", label: text.sidebarPolicy, kind: "section", target: "workspace-policy" },
        { id: "section-runbook", label: text.sidebarRunbook, kind: "section", target: "workspace-runbook" },
        { id: "section-actions", label: text.sidebarQuickActions, kind: "section", target: "workspace-quick-actions" }
      ]
    },
    {
      id: "hubs",
      title: text.sidebarHubsTitle,
      items: [
        { id: "hub-rollout", label: text.sidebarRollout, kind: "route", target: toPublicPath("/rollout") },
        { id: "hub-governance", label: text.sidebarGovernance, kind: "route", target: toPublicPath("/governance") },
        { id: "hub-records", label: text.sidebarRecords, kind: "route", target: toAdminPath("/admin/records/sync-jobs") }
      ]
    },
    {
      id: "organization-management",
      title: text.sidebarOrganizationTitle,
      items: [
        { id: "org-personnel", label: text.sidebarPersonnelManagement, kind: "route", target: toAdminPath("/admin/accounts") },
        { id: "org-permission", label: text.sidebarPermissionManagement, kind: "route", target: toAdminPath("/admin/access") },
        { id: "org-role", label: text.sidebarRoleManagement, kind: "route", target: toAdminPath("/admin/roles") }
      ]
    }
  ];
}

export function flattenWorkspaceSidebarPrimaryMenu(groups: WorkspaceSidebarGroup[]): WorkspaceSidebarPrimaryMenuItem[] {
  const registry = createGlobalNavigationRegistry<"workspace-sidebar-primary", WorkspaceSidebarPrimaryMenuItem>();
  let nextOrder = 10;

  for (const group of groups) {
    registry.register({
      key: `workspace-sidebar-group-${group.id}`,
      slot: "workspace-sidebar-primary",
      order: nextOrder,
      item: {
        id: `group-${group.id}`,
        label: group.title,
        kind: "label"
      }
    });
    nextOrder += 10;

    for (const item of group.items) {
      registry.register({
        key: `workspace-sidebar-item-${item.id}`,
        slot: "workspace-sidebar-primary",
        order: nextOrder,
        item: {
          id: item.id,
          label: item.label,
          kind: item.kind,
          target: item.target
        }
      });
      nextOrder += 10;
    }
  }

  return registry.resolve("workspace-sidebar-primary");
}
