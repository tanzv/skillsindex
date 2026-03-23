import { describe, expect, it } from "vitest";

import {
  buildWorkspaceTopbarModel,
  resolveWorkspacePrimaryShellWidth,
  resolveWorkspaceResponsivePrimaryVisibleCount
} from "@/src/components/shared/workspaceTopbarModel";

describe("workspace topbar model", () => {
  it("keeps registered first-level modules in the header model", () => {
    const model = buildWorkspaceTopbarModel("/workspace/actions", 5);

    expect(model.visibleEntries.map((entry) => entry.label)).toEqual([
      "Workspace",
      "Skills",
      "Organizations",
      "Administration",
      "Account"
    ]);
    expect(model.hiddenEntries).toHaveLength(0);
    expect(model.primaryGroups[0]?.entries.some((entry) => entry.label === "Workspace" && entry.active)).toBe(true);
  });

  it("keeps overflow empty after moving second-level items back to the sidebar", () => {
    const model = buildWorkspaceTopbarModel("/workspace", 5);

    expect(model.hiddenEntries).toHaveLength(0);
    expect(model.overflow.groups).toHaveLength(0);
  });

  it("keeps responsive visible counts within the old topbar contract", () => {
    expect(resolveWorkspacePrimaryShellWidth(1280)).toBe(760);
    expect(resolveWorkspaceResponsivePrimaryVisibleCount(760)).toBe(4);
    expect(resolveWorkspaceResponsivePrimaryVisibleCount(1200)).toBe(5);
    expect(resolveWorkspaceResponsivePrimaryVisibleCount(320)).toBe(2);
  });
});
