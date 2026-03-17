import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { WorkspaceSidebarGroup } from "./WorkspaceCenterPage.navigation";
import WorkspacePrototypePageShell from "./WorkspacePrototypePageShell";

const sidebarGroups: WorkspaceSidebarGroup[] = [
  {
    id: "workspace-panel",
    title: "Workspace Panel",
    items: [
      {
        id: "section-overview",
        label: "Overview",
        kind: "route",
        target: "/workspace"
      }
    ]
  },
  {
    id: "system-settings",
    title: "System Settings",
    items: [
      {
        id: "system-governance",
        label: "Governance Center",
        kind: "route",
        target: "/governance"
      }
    ]
  }
];

const organizationSidebarOnly: WorkspaceSidebarGroup[] = [
  {
    id: "user-management",
    title: "User Management",
    items: [
      {
        id: "org-personnel",
        label: "Personnel Management",
        kind: "route",
        target: "/admin/accounts"
      }
    ]
  }
];

describe("WorkspacePrototypePageShell", () => {
  it("renders shared workspace chrome for subpages", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspacePrototypePageShell, {
        locale: "en",
        currentPath: "/governance",
        onNavigate: () => undefined,
        sessionUser: {
          id: 1,
          username: "alice",
          role: "admin",
          display_name: "Alice",
          status: "active"
        },
        activeMenuID: "system-governance",
        sidebarGroups,
        sidebarMeta: [
          { id: "status", label: "Green lane", tone: "accent" },
          { id: "queue", label: "12 items ready" }
        ],
        eyebrow: "System Settings",
        title: "Governance Center",
        subtitle: "Drive intake and observation from one surface.",
        summaryMetrics: [{ id: "quality", label: "Quality", value: "9.1 / 10" }],
        children: React.createElement("div", null, "Subpage content")
      })
    );

    expect(html).toContain("SkillsIndex");
    expect(html).toContain("Governance Center");
    expect(html).toContain("System Settings");
    expect(html).not.toContain("Overview");
    expect(html).toContain("Subpage content");
    expect(html).toContain("workspace-topbar-toggle-icon-button");
  });

  it("renders a dedicated scroll container for the content area", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspacePrototypePageShell, {
        locale: "en",
        currentPath: "/governance",
        onNavigate: () => undefined,
        sessionUser: {
          id: 1,
          username: "alice",
          role: "admin",
          display_name: "Alice",
          status: "active"
        },
        activeMenuID: "system-governance",
        sidebarGroups,
        title: "Governance Center",
        subtitle: "Drive intake and observation from one surface.",
        children: React.createElement("div", null, "Subpage content")
      })
    );

    expect(html).toContain("workspace-shell-content-scroll");
  });

  it("keeps topbar menu groups stable when sidebar is narrowed to organization mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspacePrototypePageShell, {
        locale: "en",
        currentPath: "/admin/accounts",
        onNavigate: () => undefined,
        sessionUser: {
          id: 1,
          username: "alice",
          role: "admin",
          display_name: "Alice",
          status: "active"
        },
        activeMenuID: "org-personnel",
        sidebarGroups: organizationSidebarOnly,
        topbarMenuGroups: sidebarGroups,
        title: "Organization Governance",
        subtitle: "Manage organizations from one place.",
        eyebrow: "Organization Management",
        children: React.createElement("div", null, "Subpage content")
      })
    );

    expect(html).toContain("Personnel Management");
    expect(html).toContain("Workspace Panel");
    expect(html).toContain("System Settings");
    expect(html).toContain("workspace-shell-topbar-nav-button is-active");
    expect(html).not.toContain('class="marketplace-topbar-nav-button');
  });

  it("can hide summary hero block for organization management embedded pages", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspacePrototypePageShell, {
        locale: "en",
        currentPath: "/admin/accounts",
        onNavigate: () => undefined,
        sessionUser: {
          id: 1,
          username: "alice",
          role: "admin",
          display_name: "Alice",
          status: "active"
        },
        activeMenuID: "org-personnel",
        sidebarGroups: organizationSidebarOnly,
        topbarMenuGroups: sidebarGroups,
        title: "Account Management List",
        subtitle: "Manage user records while keeping organization navigation anchored in the workspace shell.",
        hideSummaryHeader: true,
        children: React.createElement("div", null, "Subpage content")
      })
    );

    expect(html).toContain("Subpage content");
    expect(html).not.toContain("Account Management List");
    expect(html).not.toContain("Manage user records while keeping organization navigation anchored in the workspace shell.");
  });

  it("supports a full-width utility frame variant for organization subpages", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspacePrototypePageShell, {
        locale: "en",
        currentPath: "/admin/accounts",
        onNavigate: () => undefined,
        sessionUser: {
          id: 1,
          username: "alice",
          role: "admin",
          display_name: "Alice",
          status: "active"
        },
        activeMenuID: "org-personnel",
        sidebarGroups: organizationSidebarOnly,
        topbarMenuGroups: sidebarGroups,
        title: "Account Management List",
        subtitle: "Manage user records.",
        layoutVariant: "full-width",
        children: React.createElement("div", null, "Subpage content")
      })
    );

    expect(html).toContain("workspace-prototype-utility-frame");
  });

  it("supports hiding the sidebar while keeping the shared top-level shell", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspacePrototypePageShell, {
        locale: "en",
        currentPath: "/workspace",
        onNavigate: () => undefined,
        sessionUser: null,
        activeMenuID: "section-overview",
        sidebarGroups,
        title: "Team Workspace",
        subtitle: "Coordinate operations from one surface.",
        hideSummaryHeader: true,
        showSidebar: false,
        children: React.createElement("div", null, "Overview content")
      })
    );

    expect(html).toContain("workspace-prototype-utility-frame");
    expect(html).toContain("workspace-shell-content-scroll");
    expect(html).not.toContain("workspace-sidebar-collapse-toggle");
  });

  it("applies mobile layout classes through the shared shell contract", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspacePrototypePageShell, {
        locale: "en",
        currentPath: "/workspace/activity",
        onNavigate: () => undefined,
        sessionUser: null,
        activeMenuID: "section-overview",
        sidebarGroups,
        title: "Team Workspace",
        subtitle: "Coordinate operations from one surface.",
        mobileLayout: true,
        hideSummaryHeader: true,
        children: React.createElement("div", null, "Activity content")
      })
    );

    expect(html).toContain("si-layout-shell-stage-mobile");
    expect(html).toContain("marketplace-home is-workspace-shell is-mobile");
  });
});
