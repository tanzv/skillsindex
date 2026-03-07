import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { NavigationItem, ProtectedRoute } from "../appNavigationConfig";
import BackendWorkbenchShell from "./BackendWorkbenchShell";

describe("BackendWorkbenchShell", () => {
  it("does not render a duplicated main header above backend subpage content", () => {
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
          signOut: "Sign Out",
          quickJump: "Quick Jump"
        },
        onNavigate: () => undefined,
        onLocaleChange: () => undefined,
        onLogout: () => undefined,
        children: React.createElement("div", null, "Subpage content")
      })
    );

    expect(html).toContain("Quick Jump");
    expect(html).toContain("Subpage content");
    expect(html).not.toContain("class=\"main-header\"");
  });
});
