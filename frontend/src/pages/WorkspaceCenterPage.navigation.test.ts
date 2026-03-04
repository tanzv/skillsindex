import { describe, expect, it } from "vitest";

import { createPublicPageNavigator } from "./publicPageNavigation";
import { buildWorkspaceSidebarNavigation } from "./WorkspaceCenterPage.navigation";

const textFixture = {
  sidebarSectionsTitle: "Workspace Sections",
  sidebarHubsTitle: "Related Hubs",
  sidebarOverview: "Overview",
  sidebarActivity: "Activity Feed",
  sidebarQueue: "Queue Execution",
  sidebarPolicy: "Policy Summary",
  sidebarRunbook: "Runbook Preview",
  sidebarQuickActions: "Quick Actions",
  sidebarRollout: "Rollout Workflow",
  sidebarGovernance: "Governance Center",
  sidebarRecords: "Records Sync"
};

describe("WorkspaceCenterPage.navigation", () => {
  it("builds section and hub groups with stable targets", () => {
    const navigator = createPublicPageNavigator("/workspace");
    const groups = buildWorkspaceSidebarNavigation({
      text: textFixture,
      toPublicPath: navigator.toPublic,
      toAdminPath: navigator.toAdmin
    });

    expect(groups).toHaveLength(2);
    expect(groups[0]?.id).toBe("sections");
    expect(groups[1]?.id).toBe("hubs");
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
  });
});
