import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import WorkspaceDashboardPageContent from "./WorkspaceDashboardPageContent";
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

describe("WorkspaceDashboardPageContent", () => {
  it("renders dashboard-only overview sections without workflow action modules", () => {
    const text = getWorkspaceCenterCopy("en");
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceDashboardPageContent, {
        text,
        locale: "en",
        loading: false,
        error: "",
        degradedMessage: "",
        snapshot: snapshotFixture
      })
    );

    expect(html).toContain("Installed Skills");
    expect(html).toContain("Automation Runs");
    expect(html).toContain("Queue Insights");
    expect(html).toContain("Risk Watchlist");
    expect(html).not.toContain("Team Workspace");
    expect(html).not.toContain("Activity Feed");
    expect(html).not.toContain("Queue Execution");
    expect(html).not.toContain("Open Skills");
    expect(html).not.toContain("Open Records");
  });

  it("renders loading state in panel before dashboard cards are ready", () => {
    const text = getWorkspaceCenterCopy("en");
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceDashboardPageContent, {
        text,
        locale: "en",
        loading: true,
        error: "",
        degradedMessage: "",
        snapshot: snapshotFixture
      })
    );

    expect(html).toContain("Loading workspace");
    expect(html).not.toContain("Queue Insights");
  });
});
