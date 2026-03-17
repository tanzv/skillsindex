import { describe, expect, it } from "vitest";

import {
  buildWorkspaceTopbarModel,
  resolveWorkspacePrimaryShellWidth,
  resolveWorkspaceResponsivePrimaryVisibleCount
} from "@/src/components/shared/workspaceTopbarModel";

describe("workspace topbar model", () => {
  it("prioritizes workspace routes but keeps the active workspace route visible", () => {
    const model = buildWorkspaceTopbarModel("/workspace/actions", 5);

    expect(model.visibleEntries.map((entry) => entry.label)).toEqual(["Overview", "Activity", "Queue", "Policy", "Actions"]);
    expect(model.hiddenEntries.map((entry) => entry.label)).toContain("Runbook");
    expect(model.primaryGroups[0]?.entries.some((entry) => entry.label === "Actions" && entry.active)).toBe(true);
  });

  it("groups hidden entries into marketplace, sections, and system access buckets", () => {
    const model = buildWorkspaceTopbarModel("/workspace", 5);
    const hiddenGroupTitles = model.overflow.groups.map((group) => group.title);

    expect(hiddenGroupTitles).toEqual(["Marketplace", "App Sections", "System Access", "Related Hubs"]);
    expect(model.overflow.groups.find((group) => group.id === "marketplace")?.countLabel).toBe("2");
    expect(model.overflow.groups.find((group) => group.id === "primary")?.entries.map((entry) => entry.label)).toEqual(["Actions"]);
    expect(model.overflow.groups.find((group) => group.id === "related-hubs")?.countLabel).toBe("2");
  });

  it("keeps responsive visible counts within the old topbar contract", () => {
    expect(resolveWorkspacePrimaryShellWidth(1280)).toBe(760);
    expect(resolveWorkspaceResponsivePrimaryVisibleCount(760)).toBe(4);
    expect(resolveWorkspaceResponsivePrimaryVisibleCount(1200)).toBe(5);
    expect(resolveWorkspaceResponsivePrimaryVisibleCount(320)).toBe(2);
  });
});
