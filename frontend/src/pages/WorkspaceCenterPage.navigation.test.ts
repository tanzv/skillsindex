import { describe, expect, it } from "vitest";

import { createPublicPageNavigator } from "./publicPageNavigation";
import {
  buildWorkspaceSidebarNavigation,
  collapseWorkspaceSidebarGroupsForTopbar,
  flattenWorkspaceSidebarPrimaryMenu,
  getWorkspaceSectionRouteDefinitions,
  resolveOrganizationManagementMenuItemID,
  resolveWorkspaceSidebarActiveGroupID,
  resolveWorkspaceSidebarGroupsByPanelMode,
  resolveWorkspaceSidebarPrimaryGroupEntries,
  resolveWorkspaceSidebarPanelMode,
  resolveWorkspaceSectionAnchorID,
  resolveWorkspaceSectionMenuItemID,
  resolveWorkspaceSectionPage
} from "./WorkspaceCenterPage.navigation";

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

describe("WorkspaceCenterPage.navigation", () => {
  it("builds multi-level workspace groups with stable anchor targets by default", () => {
    const navigator = createPublicPageNavigator("/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin
    });

    expect(groups).toHaveLength(5);
    expect(groups[0]?.id).toBe("workspace-core");
    expect(groups[1]?.id).toBe("workspace-execution");
    expect(groups[2]?.id).toBe("workspace-policy-actions");
    expect(groups[3]?.id).toBe("hubs");
    expect(groups[4]?.id).toBe("organization-management");
    expect(groups[0]?.items.map((item) => item.target)).toEqual([
      "workspace-overview",
      "workspace-activity",
    ]);
    expect(groups[1]?.items.map((item) => item.target)).toEqual([
      "workspace-queue",
      "workspace-runbook",
    ]);
    expect(groups[2]?.items.map((item) => item.target)).toEqual([
      "workspace-policy",
      "workspace-quick-actions"
    ]);
  });

  it("preserves prefix family in route targets", () => {
    const navigator = createPublicPageNavigator("/light/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin
    });

    expect(groups[3]?.items.map((item) => item.target)).toEqual([
      "/light/rollout",
      "/light/governance",
      "/light/admin/records/sync-jobs"
    ]);
    expect(groups[4]?.items.map((item) => item.target)).toEqual([
      "/light/admin/accounts",
      "/light/admin/access",
      "/light/admin/roles"
    ]);
  });

  it("builds workspace anchor routes for subpages when anchor route mode is enabled", () => {
    const navigator = createPublicPageNavigator("/light/rollout");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      sectionMode: "route"
    });

    expect(groups.slice(0, 3).flatMap((group) => group.items.map((item) => item.kind))).toEqual([
      "route",
      "route",
      "route",
      "route",
      "route",
      "route"
    ]);
    expect(groups.slice(0, 3).flatMap((group) => group.items.map((item) => item.target))).toEqual([
      "/light/workspace#workspace-overview",
      "/light/workspace#workspace-activity",
      "/light/workspace#workspace-queue",
      "/light/workspace#workspace-runbook",
      "/light/workspace#workspace-policy",
      "/light/workspace#workspace-quick-actions"
    ]);
  });

  it("builds dedicated workspace subpage routes when workspace route mode is enabled", () => {
    const navigator = createPublicPageNavigator("/light/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      sectionMode: "workspace-route"
    });

    expect(groups.slice(0, 3).flatMap((group) => group.items.map((item) => item.target))).toEqual([
      "/light/workspace",
      "/light/workspace/activity",
      "/light/workspace/queue",
      "/light/workspace/runbook",
      "/light/workspace/policy",
      "/light/workspace/actions"
    ]);
  });

  it("resolves workspace section page, active item, and anchor from path", () => {
    expect(getWorkspaceSectionRouteDefinitions()).toHaveLength(6);
    expect(resolveWorkspaceSectionPage("/workspace")).toBe("overview");
    expect(resolveWorkspaceSectionPage("/light/workspace/activity")).toBe("activity");
    expect(resolveWorkspaceSectionPage("/mobile/light/workspace/queue")).toBe("queue");
    expect(resolveWorkspaceSectionMenuItemID("/light/workspace/policy")).toBe("section-policy");
    expect(resolveWorkspaceSectionAnchorID("runbook")).toBe("workspace-runbook");
  });

  it("resolves organization management active menu from admin paths", () => {
    expect(resolveOrganizationManagementMenuItemID("/admin/accounts")).toBe("org-personnel");
    expect(resolveOrganizationManagementMenuItemID("/admin/permissions/accounts")).toBe("org-personnel");
    expect(resolveOrganizationManagementMenuItemID("/light/admin/accounts/new")).toBe("org-personnel");
    expect(resolveOrganizationManagementMenuItemID("/admin/access")).toBe("org-permission");
    expect(resolveOrganizationManagementMenuItemID("/mobile/light/admin/access/review")).toBe("org-permission");
    expect(resolveOrganizationManagementMenuItemID("/admin/roles")).toBe("org-role");
    expect(resolveOrganizationManagementMenuItemID("/light/admin/roles/new")).toBe("org-role");
  });

  it("resolves organization panel mode and filters sidebar groups dynamically", () => {
    const navigator = createPublicPageNavigator("/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin
    });

    expect(resolveWorkspaceSidebarPanelMode("/admin/accounts/new")).toBe("organization-secondary");
    expect(resolveWorkspaceSidebarPanelMode("/admin/permissions/accounts")).toBe("organization-secondary");
    expect(resolveWorkspaceSidebarPanelMode("/light/admin/access")).toBe("organization-secondary");
    expect(resolveWorkspaceSidebarPanelMode("/workspace")).toBe("default");

    const organizationGroups = resolveWorkspaceSidebarGroupsByPanelMode(groups, "organization-secondary");
    expect(organizationGroups).toHaveLength(1);
    expect(organizationGroups[0]?.id).toBe("organization-management");
    expect(organizationGroups[0]?.items.map((item) => item.id)).toEqual([
      "org-personnel",
      "org-permission",
      "org-role"
    ]);
  });

  it("resolves sidebar primary entries and active group from active menu id", () => {
    const navigator = createPublicPageNavigator("/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin
    });

    expect(resolveWorkspaceSidebarPrimaryGroupEntries(groups)).toEqual([
      { id: "primary-workspace-core", label: "Core Workspace", target: "workspace-overview", groupID: "workspace-core" },
      { id: "primary-workspace-execution", label: "Execution Center", target: "workspace-queue", groupID: "workspace-execution" },
      {
        id: "primary-workspace-policy-actions",
        label: "Policy and Actions",
        target: "workspace-policy",
        groupID: "workspace-policy-actions"
      },
      { id: "primary-hubs", label: "Related Hubs", target: "/rollout", groupID: "hubs" },
      {
        id: "primary-organization-management",
        label: "Organization Management",
        target: "/admin/accounts",
        groupID: "organization-management"
      }
    ]);

    expect(resolveWorkspaceSidebarActiveGroupID(groups, "section-policy")).toBe("workspace-policy-actions");
    expect(resolveWorkspaceSidebarActiveGroupID(groups, "section-queue")).toBe("workspace-execution");
    expect(resolveWorkspaceSidebarActiveGroupID(groups, "hub-governance")).toBe("hubs");
    expect(resolveWorkspaceSidebarActiveGroupID(groups, "org-role")).toBe("organization-management");
    expect(resolveWorkspaceSidebarActiveGroupID(groups, "missing-item")).toBe("workspace-core");
  });

  it("flattens grouped navigation into first-level menu order", () => {
    const navigator = createPublicPageNavigator("/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin
    });
    const flatItems = flattenWorkspaceSidebarPrimaryMenu(groups);

    expect(flatItems.map((item) => item.id)).toEqual([
      "group-workspace-core",
      "section-overview",
      "section-activity",
      "group-workspace-execution",
      "section-queue",
      "section-runbook",
      "group-workspace-policy-actions",
      "section-policy",
      "section-actions",
      "group-hubs",
      "hub-rollout",
      "hub-governance",
      "hub-records",
      "group-organization-management",
      "org-personnel",
      "org-permission",
      "org-role"
    ]);
    expect(flatItems.filter((item) => item.kind === "label").map((item) => item.label)).toEqual([
      "Core Workspace",
      "Execution Center",
      "Policy and Actions",
      "Related Hubs",
      "Organization Management"
    ]);
  });

  it("collapses workspace groups to a stable topbar sections group", () => {
    const navigator = createPublicPageNavigator("/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      sectionMode: "workspace-route"
    });

    const topbarGroups = collapseWorkspaceSidebarGroupsForTopbar(groups, textFixture.sidebarSectionsTitle);
    expect(topbarGroups.map((group) => group.id)).toEqual([
      "sections",
      "hubs",
      "organization-management"
    ]);
    expect(topbarGroups[0]?.items.map((item) => item.id)).toEqual([
      "section-overview",
      "section-activity",
      "section-queue",
      "section-runbook",
      "section-policy",
      "section-actions"
    ]);
  });
});
