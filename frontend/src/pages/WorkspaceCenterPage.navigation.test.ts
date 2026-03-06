import { describe, expect, it } from "vitest";

import { createPublicPageNavigator } from "./publicPageNavigation";
import { buildWorkspaceSidebarNavigation, flattenWorkspaceSidebarPrimaryMenu } from "./WorkspaceCenterPage.navigation";

const textFixture = {
  sidebarSectionsTitle: "Workspace Sections",
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
  it("builds section and hub groups with stable targets", () => {
    const navigator = createPublicPageNavigator("/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin
    });

    expect(groups).toHaveLength(3);
    expect(groups[0]?.id).toBe("sections");
    expect(groups[1]?.id).toBe("hubs");
    expect(groups[2]?.id).toBe("organization-management");
    expect(groups[0]?.items.map((item) => item.target)).toEqual([
      "workspace-overview",
      "workspace-activity",
      "workspace-queue",
      "workspace-policy",
      "workspace-runbook",
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

    expect(groups[1]?.items.map((item) => item.target)).toEqual([
      "/light/rollout",
      "/light/governance",
      "/light/admin/records/sync-jobs"
    ]);
    expect(groups[2]?.items.map((item) => item.target)).toEqual([
      "/light/admin/accounts",
      "/light/admin/access",
      "/light/admin/roles"
    ]);
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
      "group-sections",
      "section-overview",
      "section-activity",
      "section-queue",
      "section-policy",
      "section-runbook",
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
      "Workspace Sections",
      "Related Hubs",
      "Organization Management"
    ]);
  });
});
