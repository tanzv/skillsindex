import { describe, expect, it } from "vitest";

import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import {
  buildWorkspaceOwnerCoverageRows,
  buildWorkspaceQueueInsightRows,
  buildWorkspaceRecentActivity,
  buildWorkspaceRiskWatchlist,
  resolveWorkspaceExecutionSpotlight,
  resolveWorkspaceRunbookEntry
} from "./WorkspaceCenterPageContent.helpers";
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
  topTags: []
};

describe("WorkspaceCenterPageContent.helpers", () => {
  it("derives queue insight, activity, and risk slices from the workspace snapshot", () => {
    const text = getWorkspaceCenterCopy("en");
    const queueInsightRows = buildWorkspaceQueueInsightRows(snapshotFixture, text);

    expect(queueInsightRows.map((row) => row.label)).toEqual(["Risk ratio", "Execution coverage", "Health Score", "Alerts"]);
    expect(queueInsightRows.map((row) => row.value)).toEqual(["50%", "50%", "7.9", "3"]);
    expect(buildWorkspaceRecentActivity(snapshotFixture.queueEntries)).toHaveLength(2);
    expect(buildWorkspaceRiskWatchlist(snapshotFixture.queueEntries).map((entry) => entry.id)).toEqual([2]);
  });

  it("uses localized queue insight labels when locale copy changes", () => {
    const text = getWorkspaceCenterCopy("zh");
    const queueInsightRows = buildWorkspaceQueueInsightRows(snapshotFixture, text);

    expect(queueInsightRows[0]?.label).toBe("\u98ce\u9669\u5360\u6bd4");
    expect(queueInsightRows[1]?.label).toBe("\u6267\u884c\u8986\u76d6\u7387");
    expect(queueInsightRows[2]?.label).toBe("\u5065\u5eb7\u5206");
    expect(queueInsightRows[3]?.label).toBe("\u544a\u8b66");
  });

  it("builds owner coverage and resolves spotlight entries for focused subpages", () => {
    const ownerCoverageRows = buildWorkspaceOwnerCoverageRows(snapshotFixture.queueEntries);

    expect(ownerCoverageRows[0]).toEqual({
      owner: "governance-squad",
      itemCount: 1,
      riskCount: 1,
      averageQuality: "7.1"
    });
    expect(resolveWorkspaceExecutionSpotlight(snapshotFixture.queueEntries)?.id).toBe(1);
    expect(resolveWorkspaceRunbookEntry(snapshotFixture.queueEntries)?.id).toBe(2);
  });
});
