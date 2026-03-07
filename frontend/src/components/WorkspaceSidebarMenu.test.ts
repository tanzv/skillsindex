import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { WorkspaceSidebarGroup, WorkspaceSidebarPrimaryGroupEntry } from "../pages/WorkspaceCenterPage.navigation";
import WorkspaceSidebarMenu from "./WorkspaceSidebarMenu";

const sidebarGroup: WorkspaceSidebarGroup = {
  id: "sections",
  title: "Workspace Sections",
  items: [
    { id: "section-overview", label: "Overview", kind: "route", target: "/workspace" },
    { id: "section-activity", label: "Activity Feed", kind: "route", target: "/workspace/activity" }
  ]
};

const primaryEntries: WorkspaceSidebarPrimaryGroupEntry[] = [
  { id: "group-sections", label: "Workspace Sections", target: "/workspace", groupID: "sections" },
  { id: "group-hubs", label: "Related Hubs", target: "/governance", groupID: "hubs" }
];

describe("WorkspaceSidebarMenu", () => {
  it("renders flattened menu groups with active states", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceSidebarMenu, {
        sidebarTitle: "Navigation",
        sidebarHint: "Switch section and submenu quickly.",
        sidebarMeta: [
          { id: "status", label: "Stable", tone: "accent" },
          { id: "queue", label: "8 pending", tone: "neutral" }
        ],
        primaryGroupTitle: "Primary Menu",
        primaryEntries,
        activeSidebarGroupID: "sections",
        activeSidebarGroup: sidebarGroup,
        activeMenuID: "section-overview",
        onSelectPrimaryGroup: vi.fn(),
        onSelectMenuItem: vi.fn()
      })
    );

    expect(html).toContain("Navigation");
    expect(html).not.toContain("Switch section and submenu quickly.");
    expect(html).toContain("Stable");
    expect(html).toContain("8 pending");
    expect(html).toContain("Primary Menu");
    expect(html).toContain("Workspace Sections");
    expect(html).toContain("Overview");
    expect(html).toContain("Activity Feed");
    expect(html).toContain('aria-current="page"');
  });

  it("renders a sidebar collapse control in expanded state by default", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceSidebarMenu, {
        sidebarTitle: "Navigation",
        sidebarHint: "Switch section and submenu quickly.",
        primaryGroupTitle: "Primary Menu",
        primaryEntries,
        activeSidebarGroupID: "sections",
        activeSidebarGroup: sidebarGroup,
        activeMenuID: "section-overview",
        onSelectPrimaryGroup: vi.fn(),
        onSelectMenuItem: vi.fn()
      })
    );

    expect(html).toContain("workspace-sidebar-collapse-toggle");
    expect(html).toContain('aria-expanded="true"');
  });

  it("avoids rendering a duplicate sidebar title when it matches the active primary group", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceSidebarMenu, {
        sidebarTitle: "Workspace Sections",
        sidebarHint: "Switch section and submenu quickly.",
        primaryGroupTitle: "Primary Menu",
        primaryEntries,
        activeSidebarGroupID: "sections",
        activeSidebarGroup: sidebarGroup,
        activeMenuID: "section-overview",
        onSelectPrimaryGroup: vi.fn(),
        onSelectMenuItem: vi.fn()
      })
    );

    expect(html.match(/Workspace Sections/g)?.length).toBe(1);
  });

  it("omits group sections when data is unavailable", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceSidebarMenu, {
        sidebarTitle: "Navigation",
        sidebarHint: "Fallback mode",
        primaryGroupTitle: "Primary Menu",
        primaryEntries: [],
        activeSidebarGroupID: "",
        activeSidebarGroup: null,
        activeMenuID: "",
        onSelectPrimaryGroup: vi.fn(),
        onSelectMenuItem: vi.fn()
      })
    );

    expect(html).not.toContain("Primary Menu");
  });

  it("hides primary group controls when only one group is available", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceSidebarMenu, {
        sidebarTitle: "Navigation",
        sidebarHint: "Single group mode",
        primaryGroupTitle: "Primary Menu",
        primaryEntries: [primaryEntries[0]],
        activeSidebarGroupID: "sections",
        activeSidebarGroup: sidebarGroup,
        activeMenuID: "section-overview",
        onSelectPrimaryGroup: vi.fn(),
        onSelectMenuItem: vi.fn()
      })
    );

    expect(html).not.toContain("Primary Menu");
  });
});
