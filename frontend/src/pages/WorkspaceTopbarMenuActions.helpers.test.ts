import { describe, expect, it, vi } from "vitest";

import { createPublicPageNavigator } from "./publicPageNavigation";
import { buildWorkspaceSidebarNavigation, collapseWorkspaceSidebarGroupsForTopbar } from "./WorkspaceCenterPage.navigation";
import { buildWorkspaceTopbarMenuActions } from "./WorkspaceTopbarMenuActions.helpers";

const textFixture = {
  sidebarSectionsTitle: "Workspace Sections",
  sidebarCoreTitle: "Core Workspace",
  sidebarExecutionTitle: "Execution Center",
  sidebarPolicyActionsTitle: "Policy and Actions",
  sidebarHubsTitle: "Related Hubs",
  sidebarOrganizationTitle: "Organization Management",
  sidebarOverview: "Overview",
  sidebarActivity: "Activity Feed",
  sidebarQueue: "Queue Execution",
  sidebarPolicy: "Policy Summary",
  sidebarRunbook: "Runbook Preview",
  sidebarQuickActions: "Quick Actions",
  sidebarRollout: "Rollout Workflow",
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
      "primary-sections",
      "primary-hubs",
      "primary-organization-management"
    ]);
    expect(actions.map((action) => action.label)).toEqual([
      "Workspace Sections",
      "Related Hubs",
      "Organization Management"
    ]);
    expect(actions.map((action) => action.active)).toEqual([false, false, true]);

    actions[0]?.onClick();
    actions[1]?.onClick();
    actions[2]?.onClick();

    expect(onNavigate).toHaveBeenNthCalledWith(1, "/workspace");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "/rollout");
    expect(onNavigate).toHaveBeenNthCalledWith(3, "/admin/accounts");
  });
});
