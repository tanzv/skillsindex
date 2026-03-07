import { describe, expect, it, vi } from "vitest";

import { createPublicPageNavigator } from "./publicPageNavigation";
import { buildWorkspaceSidebarNavigation, collapseWorkspaceSidebarGroupsForTopbar } from "./WorkspaceCenterPage.navigation";
import { buildWorkspaceTopbarMenuActions } from "./WorkspaceTopbarMenuActions.helpers";

const textFixture = {
  sidebarSectionsTitle: "Workspace Sections",
  sidebarOverview: "Overview",
  sidebarActivity: "Activity Feed",
  sidebarQueue: "Queue Execution",
  sidebarPolicy: "Policy Summary",
  sidebarRunbook: "Runbook Preview",
  sidebarQuickActions: "Quick Actions",
  sidebarGovernance: "Governance Center",
  sidebarRecords: "Records Sync",
  sidebarPersonnelManagement: "Personnel Management",
  sidebarPermissionManagement: "Permission Management",
  sidebarRoleManagement: "Role Management"
};

describe("WorkspaceTopbarMenuActions.helpers", () => {
  it("builds topbar actions from first-level groups only", () => {
    const onNavigate = vi.fn();
    const navigator = createPublicPageNavigator("/workspace");
    const sidebarGroups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      sectionMode: "workspace-route"
    });

    const topbarGroups = collapseWorkspaceSidebarGroupsForTopbar(sidebarGroups, textFixture.sidebarSectionsTitle);
    const actions = buildWorkspaceTopbarMenuActions({
      sidebarGroups: topbarGroups,
      activeMenuID: "org-role",
      onNavigate,
      fallbackPath: "/workspace"
    });

    expect(actions.map((action) => action.id)).toEqual([
      "primary-skill-management",
      "primary-user-management",
      "primary-system-settings",
      "primary-workspace-panel"
    ]);
    expect(actions.map((action) => action.label)).toEqual([
      "Skill Management",
      "User Management",
      "System Settings",
      "Workspace Panel"
    ]);
    expect(actions.map((action) => action.active)).toEqual([false, true, false, false]);

    actions[0]?.onClick();
    actions[1]?.onClick();
    actions[2]?.onClick();
    actions[3]?.onClick();

    expect(onNavigate).toHaveBeenNthCalledWith(1, "/admin/ingestion/repository");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "/admin/accounts");
    expect(onNavigate).toHaveBeenNthCalledWith(3, "/admin/access");
    expect(onNavigate).toHaveBeenNthCalledWith(4, "/workspace");
  });
});
