import { describe, expect, it } from "vitest";

import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import {
  buildWorkspaceSidebarNavigation,
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
  sidebarOverview: "Overview",
  sidebarActivity: "Activity Feed",
  sidebarQueue: "Queue Execution",
  sidebarPolicy: "Policy Summary",
  sidebarRunbook: "Runbook Preview",
  sidebarQuickActions: "Quick Actions",
  sidebarGovernance: "Governance Center",
  sidebarRecords: "Sync Records",
  sidebarPersonnelManagement: "Personnel Management",
  sidebarPermissionManagement: "Permission Management",
  sidebarRoleManagement: "Role Management"
};

describe("WorkspaceCenterPage.navigation", () => {
  it("builds grouped navigation for skill, user, system and workspace panels", () => {
    const navigator = createPublicPageNavigator("/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin
    });

    expect(groups).toHaveLength(4);
    expect(groups.map((group) => group.id)).toEqual([
      "skill-management",
      "user-management",
      "system-settings",
      "workspace-panel"
    ]);
    expect(groups[0]?.items.map((item) => item.target)).toEqual([
      "/admin/ingestion/repository",
      "/admin/skills",
      "/admin/records/sync-jobs"
    ]);
    expect(groups[3]?.items.map((item) => item.target)).toEqual([
      "workspace-overview",
      "workspace-activity",
      "workspace-queue",
      "workspace-runbook",
      "workspace-policy",
      "workspace-quick-actions"
    ]);
  });

  it("preserves prefix family in grouped route targets", () => {
    const navigator = createPublicPageNavigator("/light/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin
    });

    expect(groups[0]?.items.map((item) => item.target)).toEqual([
      "/light/admin/ingestion/repository",
      "/light/admin/skills",
      "/light/admin/records/sync-jobs"
    ]);
    expect(groups[1]?.items.map((item) => item.target)).toEqual([
      "/light/admin/accounts",
      "/light/admin/access",
      "/light/admin/roles",
      "/light/admin/records/sync-jobs"
    ]);
    expect(groups[2]?.items.map((item) => item.target)).toEqual([
      "/light/admin/access",
      "/light/governance"
    ]);
  });

  it("builds workspace anchor routes for workspace panel when anchor route mode is enabled", () => {
    const navigator = createPublicPageNavigator("/light/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      sectionMode: "route"
    });

    expect(groups[3]?.items.map((item) => item.kind)).toEqual([
      "route",
      "route",
      "route",
      "route",
      "route",
      "route"
    ]);
    expect(groups[3]?.items.map((item) => item.target)).toEqual([
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

    expect(groups[3]?.items.map((item) => item.target)).toEqual([
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
    expect(organizationGroups[0]?.id).toBe("user-management");
    expect(organizationGroups[0]?.items.map((item) => item.id)).toEqual([
      "org-personnel",
      "org-permission",
      "org-role",
      "user-sync-records"
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
      {
        id: "primary-skill-management",
        label: "Skill Management",
        target: "/admin/ingestion/repository",
        groupID: "skill-management"
      },
      {
        id: "primary-user-management",
        label: "User Management",
        target: "/admin/accounts",
        groupID: "user-management"
      },
      {
        id: "primary-system-settings",
        label: "System Settings",
        target: "/governance",
        groupID: "system-settings"
      },
      {
        id: "primary-workspace-panel",
        label: "Workspace Panel",
        target: "workspace-overview",
        groupID: "workspace-panel"
      }
    ]);

    expect(resolveWorkspaceSidebarActiveGroupID(groups, "section-policy")).toBe("workspace-panel");
    expect(resolveWorkspaceSidebarActiveGroupID(groups, "org-role")).toBe("user-management");
    expect(resolveWorkspaceSidebarActiveGroupID(groups, "system-governance")).toBe("system-settings");
    expect(resolveWorkspaceSidebarActiveGroupID(groups, "missing-item")).toBe("skill-management");
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
      "group-skill-management",
      "skill-code-repository",
      "skill-library",
      "skill-sync-records",
      "group-user-management",
      "org-personnel",
      "org-permission",
      "org-role",
      "user-sync-records",
      "group-system-settings",
      "system-login-configuration",
      "system-governance",
      "group-workspace-panel",
      "section-overview",
      "section-activity",
      "section-queue",
      "section-runbook",
      "section-policy",
      "section-actions"
    ]);
    expect(flatItems.filter((item) => item.kind === "label").map((item) => item.label)).toEqual([
      "Skill Management",
      "User Management",
      "System Settings",
      "Workspace Panel"
    ]);
  });

  it("keeps topbar groups aligned with the first-level sidebar groups", () => {
    const navigator = createPublicPageNavigator("/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin,
      sectionMode: "workspace-route"
    });

    expect(groups.map((group) => group.id)).toEqual([
      "skill-management",
      "user-management",
      "system-settings",
      "workspace-panel"
    ]);
    expect(groups[3]?.items.map((item) => item.id)).toEqual([
      "section-overview",
      "section-activity",
      "section-queue",
      "section-runbook",
      "section-policy",
      "section-actions"
    ]);
  });
});
