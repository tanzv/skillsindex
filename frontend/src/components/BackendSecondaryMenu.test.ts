import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { NavigationItem } from "../appNavigationConfig";

import BackendSecondaryMenu from "./BackendSecondaryMenu";

describe("BackendSecondaryMenu", () => {
  it("renders a complete Ant Design secondary navigation menu with active state and collapse control", () => {
    const items: NavigationItem[] = [
      {
        path: "/workspace",
        title: "Overview",
        subtitle: "Operational workspace summary",
        section: "workspace"
      },
      {
        path: "/workspace/activity",
        title: "Activity Feed",
        subtitle: "Recent workbench events",
        section: "workspace"
      }
    ];

    const html = renderToStaticMarkup(
      React.createElement(BackendSecondaryMenu, {
        activeRoute: "/workspace/activity",
        sectionLabel: "Workspace",
        items,
        collapsed: false,
        canCollapse: true,
        onNavigate: () => undefined,
        onToggleCollapse: () => undefined
      })
    );

    expect(html).toContain("Backend secondary navigation");
    expect(html).toContain("Current Domain");
    expect(html).toContain("Workspace");
    expect(html).toContain("Activity Feed");
    expect(html).toContain("ant-menu");
    expect(html).toContain("backend-secondary-list");
    expect(html).toContain("ant-menu-item-selected");
    expect(html).toContain('data-testid="backend-secondary-collapse-toggle"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Operational workspace summary");
  });
});
