import { describe, expect, it } from "vitest";

import { buildWorkspacePageModel, buildWorkspaceSnapshot } from "@/src/features/workspace/model";
import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

describe("workspace model", () => {
  it("builds a stable workspace snapshot from marketplace fallback data", () => {
    const snapshot = buildWorkspaceSnapshot(
      buildPublicMarketplaceFallback(),
      {
        user: {
          id: 7,
          username: "operator",
          displayName: "Ops Lead",
          role: "admin",
          status: "active"
        },
        marketplacePublicAccess: false
      }
    );

    expect(snapshot.metrics.installedSkills).toBe(12);
    expect(snapshot.queueCounts.all).toBe(12);
    expect(snapshot.queueCounts.risk).toBe(4);
    expect(snapshot.recentActivity[0]?.id).toBe(101);
    expect(snapshot.topTags[0]?.name).toBe("release");
  });

  it("builds an overview model with dashboard-focused section variants", () => {
    const model = buildWorkspacePageModel("/workspace", {
      user: {
        id: 10,
        username: "workspace-admin",
        displayName: "Workspace Admin",
        role: "admin",
        status: "active"
      },
      marketplacePublicAccess: false
    });

    expect(model.title).toBe("Workspace Overview");
    expect(model.summaryMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Marketplace Access",
          value: "Restricted",
          tone: "warning",
          detail: expect.stringContaining("Public discovery")
        }),
        expect.objectContaining({
          label: "Health Score",
          tone: "success"
        })
      ])
    );
    expect(model.primarySections.map((section) => [section.title, section.variant])).toEqual(
      expect.arrayContaining([
        ["Workspace Signals", "signal-grid"],
        ["Execution Spotlight", "compact-list"],
        ["Recent Activity", "activity-list"]
      ])
    );
    expect(model.railSections.map((section) => [section.title, section.variant])).toEqual(
      expect.arrayContaining([
        ["Owner Coverage", "compact-list"],
        ["Risk Watchlist", "activity-list"],
        ["Policy Coverage", "compact-list"],
        ["Current Session", "session"]
      ])
    );
  });

  it("builds a queue page model with execution and escalation context", () => {
    const model = buildWorkspacePageModel("/workspace/queue", {
      user: {
        id: 8,
        username: "queue-admin",
        displayName: "Queue Admin",
        role: "admin",
        status: "active"
      },
      marketplacePublicAccess: true
    });

    expect(model.title).toBe("Queue Execution");
    expect(model.primarySections.map((section) => section.title)).toEqual(
      expect.arrayContaining(["Execution Spotlight", "Queue Insights"])
    );
    expect(model.railSections.map((section) => section.title)).toEqual(
      expect.arrayContaining(["Escalation Paths", "Current Session"])
    );
    expect(model.quickActions.some((action) => action.href === "/admin/sync-jobs")).toBe(true);
    expect(model.primarySections.find((section) => section.title === "Queue Insights")?.variant).toBe("signal-grid");
  });

  it("builds a runbook page model with copyable command previews and checklist content", () => {
    const model = buildWorkspacePageModel("/workspace/runbook", {
      user: {
        id: 9,
        username: "reviewer",
        displayName: "Incident Reviewer",
        role: "manager",
        status: "active"
      },
      marketplacePublicAccess: true
    });

    const responseScriptSection = model.primarySections.find((section) => section.title === "Response Script");
    const checklistSection = model.railSections.find((section) => section.title === "Escalation Checklist");

    expect(responseScriptSection?.code).toContain("workspace queue");
    expect(responseScriptSection?.variant).toBe("code-emphasis");
    expect(checklistSection?.variant).toBe("compact-list");
    expect(checklistSection?.items.length).toBeGreaterThan(0);
    expect(model.summaryMetrics.some((metric) => metric.label === "Marketplace Access")).toBe(true);
  });

  it("applies injected workspace messages to the page model", () => {
    const testMessages = createProtectedPageTestMessages({
      workspace: {
        pageEyebrow: "workspace_page_eyebrow_custom",
        routeOverviewTitle: "workspace_route_overview_title_custom",
        metricMarketplaceAccessLabel: "workspace_metric_marketplace_access_label_custom",
        valueRestricted: "workspace_value_restricted_custom",
        metricMarketplaceAccessDetailRestricted: "workspace_metric_marketplace_access_detail_restricted_custom",
        ownerCoverageValueTemplate: "{items} coverage_custom · {risk} risk_custom"
      }
    });

    const model = buildWorkspacePageModel(
      "/workspace",
      {
        user: {
          id: 20,
          username: "workspace-operator",
          displayName: "Workspace Operator",
          role: "admin",
          status: "active"
        },
        marketplacePublicAccess: false
      },
      buildPublicMarketplaceFallback(),
      testMessages.workspace
    );

    expect(model.eyebrow).toBe("workspace_page_eyebrow_custom");
    expect(model.title).toBe("workspace_route_overview_title_custom");
    expect(model.summaryMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "workspace_metric_marketplace_access_label_custom",
          value: "workspace_value_restricted_custom",
          detail: "workspace_metric_marketplace_access_detail_restricted_custom"
        })
      ])
    );
    expect(model.railSections.find((section) => section.id === "owner-coverage")?.items[0]?.value).toContain("coverage_custom");
  });
});
