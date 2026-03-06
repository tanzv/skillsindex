import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import WorkspacePrototypePageShell from "./WorkspacePrototypePageShell";
import type { WorkspaceSidebarGroup } from "./WorkspaceCenterPage.navigation";

const sidebarGroups: WorkspaceSidebarGroup[] = [
  {
    id: "sections",
    title: "Workspace Sections",
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
    id: "hubs",
    title: "Related Hubs",
    items: [
      {
        id: "hub-rollout",
        label: "Rollout Workflow",
        kind: "route",
        target: "/rollout"
      }
    ]
  }
];

const organizationSidebarOnly: WorkspaceSidebarGroup[] = [
  {
    id: "organization-management",
    title: "Organization Management",
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
        currentPath: "/rollout",
        onNavigate: () => undefined,
        sessionUser: {
          id: 1,
          username: "alice",
          role: "admin",
          display_name: "Alice",
          status: "active"
        },
        activeMenuID: "hub-rollout",
        sidebarGroups,
        sidebarMeta: [
          { id: "status", label: "Green lane", tone: "accent" },
          { id: "queue", label: "12 items ready" }
        ],
        eyebrow: "Rollout Control",
        title: "Install and Rollout Workflow",
        subtitle: "Drive intake and observation from one surface.",
        summaryMetrics: [
          { id: "quality", label: "Quality", value: "9.1 / 10" }
        ],
        children: React.createElement("div", null, "Subpage content")
      })
    );

    expect(html).toContain("SkillsIndex");
    expect(html).toContain("Rollout Workflow");
    expect(html).toContain("Related Hubs");
    expect(html).not.toContain("Overview");
    expect(html).toContain("Install and Rollout Workflow");
    expect(html).toContain("Subpage content");
    expect(html).toContain("Green lane");
    expect(html).toContain("workspace-topbar-toggle-icon-button");
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
    expect(html).toContain("Workspace Sections");
    expect(html).toContain("Related Hubs");
    expect(html).toContain("marketplace-topbar-nav-button is-active");
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
});
