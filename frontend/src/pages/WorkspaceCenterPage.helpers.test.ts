import { describe, expect, it } from "vitest";
import { PublicMarketplaceResponse } from "../lib/api";
import {
  buildWorkspaceCommandPreview,
  buildWorkspaceQueueCounts,
  buildWorkspaceSnapshot,
  filterWorkspaceQueue,
  formatWorkspaceDate,
  mapWorkspaceQueueEntry,
  resolveWorkspaceQueueStatus,
  workspaceStatusColor
} from "./WorkspaceCenterPage.helpers";

const payloadFixture: PublicMarketplaceResponse = {
  filters: {
    q: "",
    tags: "",
    category: "",
    subcategory: "",
    sort: "recent",
    mode: "prototype"
  },
  stats: {
    total_skills: 24,
    matching_skills: 3
  },
  pagination: {
    page: 1,
    page_size: 24,
    total_items: 3,
    total_pages: 1,
    prev_page: 0,
    next_page: 0
  },
  categories: [],
  top_tags: [
    { name: "ops", count: 4 },
    { name: "quality", count: 3 }
  ],
  items: [
    {
      id: 201,
      name: "Repository Sync Auditor",
      description: "Audits repository synchronization history and reports drift.",
      content: "",
      category: "Operations",
      subcategory: "Sync",
      tags: ["ops", "audit"],
      source_type: "official",
      source_url: "",
      star_count: 92,
      quality_score: 8.9,
      install_command: "",
      updated_at: "2026-02-02T10:00:00Z"
    },
    {
      id: 202,
      name: "Prompt Policy Gate",
      description: "Checks policy coverage before queue execution.",
      content: "",
      category: "Governance",
      subcategory: "Policy",
      tags: ["quality"],
      source_type: "official",
      source_url: "",
      star_count: 80,
      quality_score: 7.9,
      install_command: "",
      updated_at: "2026-02-03T10:00:00Z"
    },
    {
      id: 203,
      name: "Legacy Connector Bridge",
      description: "Maintains compatibility with old integrations.",
      content: "",
      category: "Integrations",
      subcategory: "Bridge",
      tags: ["legacy"],
      source_type: "community",
      source_url: "",
      star_count: 28,
      quality_score: 6.8,
      install_command: "",
      updated_at: "2026-01-30T09:00:00Z"
    }
  ],
  session_user: null,
  can_access_dashboard: true
};

describe("WorkspaceCenterPage.helpers", () => {
  it("resolves queue status using quality threshold first", () => {
    expect(resolveWorkspaceQueueStatus(payloadFixture.items[2], 2, 7.5)).toBe("risk");
    expect(resolveWorkspaceQueueStatus(payloadFixture.items[0], 0, 7.5)).toBe("running");
    expect(resolveWorkspaceQueueStatus(payloadFixture.items[1], 1, 7.5)).toBe("pending");
  });

  it("maps queue entry with normalized fields", () => {
    const entry = mapWorkspaceQueueEntry(payloadFixture.items[0], 0, 7.5);
    expect(entry.id).toBe(201);
    expect(entry.owner).toBe("operations-squad");
    expect(entry.status).toBe("running");
    expect(entry.summary.length).toBeLessThanOrEqual(84);
  });

  it("builds queue counts and filters by status", () => {
    const snapshot = buildWorkspaceSnapshot({ payload: payloadFixture, qualityRiskThreshold: 7.5 });
    expect(buildWorkspaceQueueCounts(snapshot.queueEntries)).toEqual({
      all: 3,
      pending: 1,
      running: 1,
      risk: 1
    });
    expect(filterWorkspaceQueue(snapshot.queueEntries, "risk")).toHaveLength(1);
    expect(filterWorkspaceQueue(snapshot.queueEntries, "all")).toHaveLength(3);
  });

  it("builds metrics and policy signals from payload", () => {
    const snapshot = buildWorkspaceSnapshot({ payload: payloadFixture, qualityRiskThreshold: 7.5 });
    expect(snapshot.metrics.installedSkills).toBe(24);
    expect(snapshot.metrics.automationRuns).toBe(2);
    expect(snapshot.metrics.healthScore).toBe(7.9);
    expect(snapshot.policySignals).toHaveLength(4);
    expect(snapshot.topTags[0]?.name).toBe("ops");
  });

  it("builds command preview and status colors", () => {
    const snapshot = buildWorkspaceSnapshot({ payload: payloadFixture });
    const preview = buildWorkspaceCommandPreview(snapshot.queueEntries[0]);
    expect(preview).toContain("workspace queue --skill");
    expect(buildWorkspaceCommandPreview(null)).toBe("workspace queue --select none");
    expect(workspaceStatusColor("risk")).toBe("red");
    expect(workspaceStatusColor("running")).toBe("cyan");
    expect(workspaceStatusColor("pending")).toBe("gold");
  });

  it("formats workspace dates safely", () => {
    expect(formatWorkspaceDate("2026-02-02T10:00:00Z", "en")).toMatch(/\d/);
    expect(formatWorkspaceDate("not-a-date", "en")).toBe("n/a");
  });
});
