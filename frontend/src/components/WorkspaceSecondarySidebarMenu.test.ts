import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { WorkspaceSidebarGroup } from "../pages/WorkspaceCenterPage.navigation";
import WorkspaceSecondarySidebarMenu from "./WorkspaceSecondarySidebarMenu";

const organizationGroup: WorkspaceSidebarGroup = {
  id: "organization-management",
  title: "Organization Management",
  items: [
    { id: "org-personnel", label: "Personnel Management", kind: "route", target: "/admin/accounts" },
    { id: "org-permission", label: "Permission Management", kind: "route", target: "/admin/access" },
    { id: "org-role", label: "Role Management", kind: "route", target: "/admin/roles" }
  ]
};

describe("WorkspaceSecondarySidebarMenu", () => {
  it("renders secondary entries with active item state", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceSecondarySidebarMenu, {
        sidebarTitle: "Organization Management",
        sidebarHint: "Use this menu to switch subpages.",
        sidebarMeta: [{ id: "mode", label: "Secondary", tone: "accent" }],
        sidebarGroup: organizationGroup,
        activeMenuID: "org-personnel",
        onSelectMenuItem: vi.fn()
      })
    );

    expect(html).toContain("Organization Management");
    expect(html).toContain("Use this menu to switch subpages.");
    expect(html).toContain("Secondary");
    expect(html).toContain("Personnel Management");
    expect(html).toContain("Permission Management");
    expect(html).toContain("Role Management");
    expect(html).toContain("aria-current=\"page\"");
  });

  it("hides duplicate group title when sidebar title already matches", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkspaceSecondarySidebarMenu, {
        sidebarTitle: "Organization Management",
        sidebarHint: "Secondary navigation",
        sidebarGroup: organizationGroup,
        activeMenuID: "org-personnel",
        onSelectMenuItem: vi.fn()
      })
    );

    const organizationTitleCount = html.match(/Organization Management/g)?.length ?? 0;
    expect(organizationTitleCount).toBe(1);
  });
});
