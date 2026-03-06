import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import WorkspaceCenterPageContent from "./WorkspaceCenterPageContent";
import type { WorkspaceSnapshot } from "./WorkspaceCenterPage.types";

const snapshotFixture: WorkspaceSnapshot = {
  queueEntries: [
    {
      id: 1,
      name: "Skill One",
      category: "Core",
      subcategory: "Build",
      qualityScore: 8.7,
      starCount: 12,
      updatedAt: "2025-03-01T10:00:00Z",
      tags: ["ops"],
      owner: "core-squad",
      status: "running",
      summary: "Summary one"
    },
    {
      id: 2,
      name: "Skill Two",
      category: "Governance",
      subcategory: "Policy",
      qualityScore: 7.1,
      starCount: 5,
      updatedAt: "2025-03-02T10:00:00Z",
      tags: ["risk"],
      owner: "governance-squad",
      status: "risk",
      summary: "Summary two"
    }
  ],
  queueCounts: {
    all: 2,
    pending: 0,
    running: 1,
    risk: 1
  },
  metrics: {
    installedSkills: 24,
    automationRuns: 11,
    healthScore: 7.9,
    alerts: 3
  },
  policySignals: [{ key: "coverage", label: "Coverage Scope", value: "2 categories / 2 squads" }],
  topTags: [
    { name: "ops", count: 4 },
    { name: "risk", count: 2 }
  ]
};

function renderContent(activeSectionPage: "overview" | "activity" | "queue" | "policy" | "runbook" | "actions"): string {
  const text = getWorkspaceCenterCopy("en");
  return renderToStaticMarkup(
    React.createElement(WorkspaceCenterPageContent, {
      text,
      locale: "en",
      loading: false,
      error: "",
      degradedMessage: "",
      snapshot: snapshotFixture,
      activeSectionPage,
      onNavigate: vi.fn(),
      toPublicPath: (path: string) => path,
      toAdminPath: (path: string) => path
    })
  );
}

describe("WorkspaceCenterPageContent", () => {
  it("renders dashboard-first statistics metrics for workspace homepage without intro filler card", () => {
    const html = renderContent("overview");

    expect(html).toContain("Installed Skills");
    expect(html).toContain("Queue Insights");
    expect(html).toContain("Risk Watchlist");
    expect(html).not.toContain("Workspace Statistics Panels");
  });

  it("renders activity subpage as a focused single-section view", () => {
    const html = renderContent("activity");

    expect(html).toContain("Team Activity Feed");
    expect(html).toContain("Activity Highlights");
    expect(html).not.toContain("Workspace Statistics Panels");
    expect(html).not.toContain("Quick Actions");
  });

  it("renders queue subpage with execution spotlight and route-specific insights", () => {
    const html = renderContent("queue");

    expect(html).toContain("Execution Spotlight");
    expect(html).toContain("Risk ratio");
    expect(html).not.toContain("Queue State and Execution");
    expect(html).not.toContain("Team Activity Feed");
    expect(html).not.toContain("Risk Watchlist");
  });

  it("renders policy subpage with governance priorities", () => {
    const html = renderContent("policy");

    expect(html).toContain("Governance Priorities");
    expect(html).toContain("Coverage Scope");
    expect(html).toContain("Top Tags");
    expect(html).not.toContain("Execution Spotlight");
  });

  it("renders runbook subpage with command preview and response actions", () => {
    const html = renderContent("runbook");

    expect(html).toContain("Response Command Preview");
    expect(html).toContain("workspace queue --skill 2 --status risk");
    expect(html).toContain("Open Rollout");
    expect(html).not.toContain("Workspace Statistics Panels");
  });

  it("renders actions subpage with grouped action clusters", () => {
    const html = renderContent("actions");

    expect(html).toContain("Marketplace Actions");
    expect(html).toContain("Control Center Actions");
    expect(html).toContain("Open Records");
    expect(html).not.toContain("Team Activity Feed");
  });
});
