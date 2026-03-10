import type { WorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import { createGlobalNavigationRegistry } from "../../lib/globalNavigationRegistry";

export type WorkspaceSidebarItemKind = "section" | "route";
export type WorkspaceSidebarPrimaryMenuKind = WorkspaceSidebarItemKind | "label";
export type WorkspaceSidebarSectionMode = "section" | "route" | "workspace-route";
export type WorkspaceSectionPageKey = "overview" | "activity" | "queue" | "policy" | "runbook" | "actions";
export type WorkspaceSidebarPanelMode = "default" | "organization-secondary";

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

export interface WorkspaceSidebarPrimaryGroupEntry {
  id: string;
  label: string;
  target: string;
  groupID: string;
}

export interface WorkspaceSectionRouteDefinition {
  pageKey: WorkspaceSectionPageKey;
  menuItemID: string;
  anchorID: string;
  routePath: string;
}

interface BuildWorkspaceSidebarNavigationInput {
  text: Pick<
    WorkspaceCenterCopy,
    | "sidebarSectionsTitle"
    | "sidebarOverview"
    | "sidebarActivity"
    | "sidebarQueue"
    | "sidebarPolicy"
    | "sidebarRunbook"
    | "sidebarQuickActions"
    | "sidebarGovernance"
    | "sidebarRecords"
    | "sidebarPersonnelManagement"
    | "sidebarPermissionManagement"
    | "sidebarRoleManagement"
  >;
  toPublicPath: (path: string) => string;
  toAdminPath: (path: string) => string;
  sectionMode?: WorkspaceSidebarSectionMode;
}

const workspaceSectionRouteDefinitions: WorkspaceSectionRouteDefinition[] = [
  {
    pageKey: "overview",
    menuItemID: "section-overview",
    anchorID: "workspace-overview",
    routePath: "/workspace"
  },
  {
    pageKey: "activity",
    menuItemID: "section-activity",
    anchorID: "workspace-activity",
    routePath: "/workspace/activity"
  },
  {
    pageKey: "queue",
    menuItemID: "section-queue",
    anchorID: "workspace-queue",
    routePath: "/workspace/queue"
  },
  {
    pageKey: "policy",
    menuItemID: "section-policy",
    anchorID: "workspace-policy",
    routePath: "/workspace/policy"
  },
  {
    pageKey: "runbook",
    menuItemID: "section-runbook",
    anchorID: "workspace-runbook",
    routePath: "/workspace/runbook"
  },
  {
    pageKey: "actions",
    menuItemID: "section-actions",
    anchorID: "workspace-quick-actions",
    routePath: "/workspace/actions"
  }
];

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function stripPrototypePrefix(pathname: string): string {
  if (pathname === "/mobile/light" || pathname.startsWith("/mobile/light/")) {
    const stripped = pathname.slice("/mobile/light".length);
    return stripped || "/";
  }
  if (pathname === "/mobile" || pathname.startsWith("/mobile/")) {
    const stripped = pathname.slice("/mobile".length);
    return stripped || "/";
  }
  if (pathname === "/light" || pathname.startsWith("/light/")) {
    const stripped = pathname.slice("/light".length);
    return stripped || "/";
  }
  return pathname;
}

function toPrototypeCorePath(pathname: string): string {
  return normalizePath(stripPrototypePrefix(normalizePath(pathname)));
}

function findWorkspaceSectionByMenuItemID(menuItemID: string): WorkspaceSectionRouteDefinition {
  return workspaceSectionRouteDefinitions.find((definition) => definition.menuItemID === menuItemID) || workspaceSectionRouteDefinitions[0];
}

function resolveSectionTarget(
  sectionMode: WorkspaceSidebarSectionMode,
  toPublicPath: (path: string) => string,
  menuItemID: string,
  anchorID: string
): string {
  if (sectionMode === "workspace-route") {
    return toPublicPath(findWorkspaceSectionByMenuItemID(menuItemID).routePath);
  }
  if (sectionMode === "route") {
    return toPublicPath(`/workspace#${anchorID}`);
  }
  return anchorID;
}

export function getWorkspaceSectionRouteDefinitions(): WorkspaceSectionRouteDefinition[] {
  return workspaceSectionRouteDefinitions;
}

export function resolveWorkspaceSectionPage(currentPath: string): WorkspaceSectionPageKey {
  const corePath = toPrototypeCorePath(currentPath);
  const matchedDefinition = workspaceSectionRouteDefinitions.find((definition) => corePath === definition.routePath);
  if (matchedDefinition) {
    return matchedDefinition.pageKey;
  }
  if (corePath.startsWith("/workspace/")) {
    const matchedSubpage = workspaceSectionRouteDefinitions.find((definition) => corePath === `${definition.routePath}/`);
    return matchedSubpage?.pageKey || "overview";
  }
  return "overview";
}

export function resolveWorkspaceSectionMenuItemID(currentPath: string): string {
  return workspaceSectionRouteDefinitions.find((definition) => definition.pageKey === resolveWorkspaceSectionPage(currentPath))?.menuItemID || "section-overview";
}

export function resolveOrganizationManagementMenuItemID(currentPath: string): string {
  const corePath = toPrototypeCorePath(currentPath);

  if (corePath === "/admin/permissions/accounts" || corePath.startsWith("/admin/permissions/accounts/")) {
    return "org-personnel";
  }
  if (corePath === "/admin/access" || corePath.startsWith("/admin/access/")) {
    return "org-permission";
  }
  if (corePath === "/admin/roles" || corePath.startsWith("/admin/roles/")) {
    return "org-role";
  }
  return "org-personnel";
}

export function resolveWorkspaceSectionAnchorID(pageKey: WorkspaceSectionPageKey): string {
  return workspaceSectionRouteDefinitions.find((definition) => definition.pageKey === pageKey)?.anchorID || "workspace-overview";
}

export function buildWorkspaceSidebarNavigation({
  text,
  toPublicPath,
  toAdminPath,
  sectionMode = "section"
}: BuildWorkspaceSidebarNavigationInput): WorkspaceSidebarGroup[] {
  const sectionKind: WorkspaceSidebarItemKind = sectionMode === "section" ? "section" : "route";

  return [
    {
      id: "skill-management",
      title: "Skill Management",
      items: [
        {
          id: "skill-code-repository",
          label: "Code Repository",
          kind: "route",
          target: toAdminPath("/admin/ingestion/repository")
        },
        {
          id: "skill-library",
          label: "Skill",
          kind: "route",
          target: toAdminPath("/admin/skills")
        },
        {
          id: "skill-sync-records",
          label: text.sidebarRecords,
          kind: "route",
          target: toAdminPath("/admin/records/sync-jobs")
        }
      ]
    },
    {
      id: "user-management",
      title: "User Management",
      items: [
        {
          id: "org-personnel",
          label: text.sidebarPersonnelManagement,
          kind: "route",
          target: toAdminPath("/admin/accounts")
        },
        {
          id: "org-permission",
          label: text.sidebarPermissionManagement,
          kind: "route",
          target: toAdminPath("/admin/access")
        },
        {
          id: "org-role",
          label: text.sidebarRoleManagement,
          kind: "route",
          target: toAdminPath("/admin/roles")
        },
        {
          id: "user-sync-records",
          label: text.sidebarRecords,
          kind: "route",
          target: toAdminPath("/admin/records/sync-jobs")
        }
      ]
    },
    {
      id: "system-settings",
      title: "System Settings",
      items: [
        {
          id: "system-login-configuration",
          label: "Login Configuration",
          kind: "route",
          target: toAdminPath("/admin/access")
        },
        {
          id: "system-governance",
          label: text.sidebarGovernance,
          kind: "route",
          target: toPublicPath("/governance")
        }
      ]
    },
    {
      id: "workspace-panel",
      title: "Workspace Panel",
      items: [
        {
          id: "section-overview",
          label: text.sidebarOverview,
          kind: sectionKind,
          target: resolveSectionTarget(sectionMode, toPublicPath, "section-overview", "workspace-overview")
        },
        {
          id: "section-activity",
          label: text.sidebarActivity,
          kind: sectionKind,
          target: resolveSectionTarget(sectionMode, toPublicPath, "section-activity", "workspace-activity")
        },
        {
          id: "section-queue",
          label: text.sidebarQueue,
          kind: sectionKind,
          target: resolveSectionTarget(sectionMode, toPublicPath, "section-queue", "workspace-queue")
        },
        {
          id: "section-runbook",
          label: text.sidebarRunbook,
          kind: sectionKind,
          target: resolveSectionTarget(sectionMode, toPublicPath, "section-runbook", "workspace-runbook")
        },
        {
          id: "section-policy",
          label: text.sidebarPolicy,
          kind: sectionKind,
          target: resolveSectionTarget(sectionMode, toPublicPath, "section-policy", "workspace-policy")
        },
        {
          id: "section-actions",
          label: text.sidebarQuickActions,
          kind: sectionKind,
          target: resolveSectionTarget(sectionMode, toPublicPath, "section-actions", "workspace-quick-actions")
        }
      ]
    }
  ];
}

export function collapseWorkspaceSidebarGroupsForTopbar(
  groups: WorkspaceSidebarGroup[],
  _sidebarSectionsTitle: string
): WorkspaceSidebarGroup[] {
  return groups;
}

export function resolveWorkspaceSidebarPanelMode(currentPath: string): WorkspaceSidebarPanelMode {
  const corePath = toPrototypeCorePath(currentPath);
  if (
    corePath === "/admin/accounts" ||
    corePath.startsWith("/admin/accounts/") ||
    corePath === "/admin/permissions/accounts" ||
    corePath.startsWith("/admin/permissions/accounts/") ||
    corePath === "/admin/access" ||
    corePath.startsWith("/admin/access/") ||
    corePath === "/admin/roles" ||
    corePath.startsWith("/admin/roles/")
  ) {
    return "organization-secondary";
  }
  return "default";
}

export function resolveWorkspaceSidebarGroupsByPanelMode(
  groups: WorkspaceSidebarGroup[],
  panelMode: WorkspaceSidebarPanelMode
): WorkspaceSidebarGroup[] {
  if (panelMode === "organization-secondary") {
    return groups.filter((group) => group.id === "user-management");
  }
  return groups;
}

function isWorkspacePublicPrimaryTarget(target: string): boolean {
  const corePath = toPrototypeCorePath(target);
  return !corePath.startsWith("/admin");
}

function resolveWorkspaceSidebarPrimaryGroupTarget(group: WorkspaceSidebarGroup): string {
  const publicTarget = group.items.find((item) => item.target && isWorkspacePublicPrimaryTarget(item.target))?.target;
  if (publicTarget) {
    return publicTarget;
  }

  return group.items.find((item) => Boolean(item.target))?.target || "";
}

export function resolveWorkspaceSidebarPrimaryGroupEntries(groups: WorkspaceSidebarGroup[]): WorkspaceSidebarPrimaryGroupEntry[] {
  return groups
    .map((group) => {
      const primaryTarget = resolveWorkspaceSidebarPrimaryGroupTarget(group);
      if (!primaryTarget) {
        return null;
      }
      return {
        id: `primary-${group.id}`,
        label: group.title,
        target: primaryTarget,
        groupID: group.id
      };
    })
    .filter((entry): entry is WorkspaceSidebarPrimaryGroupEntry => entry !== null);
}

export function resolveWorkspaceSidebarActiveGroupID(groups: WorkspaceSidebarGroup[], activeMenuID: string): string {
  const matchedGroup = groups.find((group) => group.items.some((item) => item.id === activeMenuID));
  if (matchedGroup) {
    return matchedGroup.id;
  }
  return groups[0]?.id || "";
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
