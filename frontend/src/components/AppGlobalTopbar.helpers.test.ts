import { describe, expect, it } from "vitest";

import {
  resolveWorkspacePrimaryActionPresentation,
  resolveWorkspacePrimaryShellWidth,
  resolveWorkspaceResponsivePrimaryVisibleCount
} from "./AppGlobalTopbar.helpers";

describe("AppGlobalTopbar.helpers", () => {
  it("maps viewport width to the fixed primary shell width range", () => {
    expect(resolveWorkspacePrimaryShellWidth(1440)).toBe(820);
    expect(resolveWorkspacePrimaryShellWidth(1280)).toBe(760);
    expect(resolveWorkspacePrimaryShellWidth(1024)).toBe(520);
  });

  it("reduces visible primary actions as shell width gets tighter", () => {
    expect(resolveWorkspaceResponsivePrimaryVisibleCount(820)).toBe(4);
    expect(resolveWorkspaceResponsivePrimaryVisibleCount(760)).toBe(4);
    expect(resolveWorkspaceResponsivePrimaryVisibleCount(660)).toBe(3);
    expect(resolveWorkspaceResponsivePrimaryVisibleCount(520)).toBe(2);
  });

  it("keeps workspace menu actions ahead of dashboard access when the primary area is constrained", () => {
    const presentation = resolveWorkspacePrimaryActionPresentation(
      [
        {
          id: "open-dashboard",
          label: "Open Dashboard",
          className: "is-open-dashboard-action is-backend-entry-action",
          onClick: () => undefined
        },
        { id: "skill-management", label: "Skill Management", className: "is-menu-entry", onClick: () => undefined },
        { id: "user-management", label: "User Management", className: "is-menu-entry", onClick: () => undefined },
        { id: "system-settings", label: "System Settings", className: "is-menu-entry", onClick: () => undefined },
        { id: "workspace-panel", label: "Workspace Panel", className: "is-menu-entry", onClick: () => undefined }
      ],
      4
    );

    expect(presentation.visibleActions.map((action) => action.id)).toEqual([
      "skill-management",
      "user-management",
      "system-settings",
      "workspace-panel"
    ]);
    expect(presentation.hiddenActions.map((action) => action.id)).toEqual(["open-dashboard"]);
  });

  it("falls back to the desktop visible count when shell width is unknown", () => {
    expect(resolveWorkspaceResponsivePrimaryVisibleCount(null)).toBe(5);
  });
});
