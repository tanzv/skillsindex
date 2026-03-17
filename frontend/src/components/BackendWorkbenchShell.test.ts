import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { NavigationItem, ProtectedRoute } from "../appNavigationConfig";
import BackendWorkbenchShell from "./BackendWorkbenchShell";

describe("BackendWorkbenchShell", () => {
  it("renders the shared user center dropdown instead of duplicated locale and logout controls", () => {
    const navItems: NavigationItem[] = [
      { path: "/admin/overview", title: "Overview", subtitle: "Counts and capability posture", section: "admin" },
      { path: "/admin/skills", title: "Skills", subtitle: "Governed skill inventory", section: "admin" },
      { path: "/admin/jobs", title: "Jobs", subtitle: "Queue and execution status", section: "admin" }
    ];
    const navByPath = new Map<ProtectedRoute, NavigationItem>(navItems.map((item) => [item.path, item]));

    const html = renderToStaticMarkup(
      React.createElement(BackendWorkbenchShell, {
        route: "/admin/skills",
        locale: "en",
        themeMode: "dark",
        submitLoading: false,
        sessionUser: {
          username: "alice",
          role: "admin"
        },
        navItems,
        navByPath,
        quickRoutes: ["/admin/overview", "/admin/skills", "/admin/jobs"],
        text: {
          brandName: "SkillsIndex",
          brandTitle: "Control Matrix",
          home: "Home",
          homeSubtitle: "Prototype aligned public catalog",
          quickJump: "Quick Jump"
        },
        onNavigate: () => undefined,
        onLocaleChange: () => undefined,
        onThemeModeChange: () => undefined,
        onLogout: () => undefined,
        children: React.createElement("div", null, "Subpage content")
      })
    );

    expect(html).toContain("Quick Jump");
    expect(html).toContain("Subpage content");
    expect(html).toContain("Control Sections");
    expect(html).toContain("Current Domain");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('data-testid="backend-secondary-collapse-toggle"');
    expect(html).not.toContain('data-testid="backend-primary-overflow-trigger"');
    expect(html).not.toContain("Counts and capability posture");
    expect(html).toContain('data-testid="backend-user-center-trigger"');
    expect(html).not.toContain('data-testid="sidebar-locale-switch-en"');
    expect(html).not.toContain('data-testid="sidebar-locale-switch-zh"');
    expect(html).not.toContain("class=\"main-header\"");
    expect(html).not.toContain(">Sign Out<");
  });
});
