import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AppShellTopbar from "./AppShellTopbar";

describe("AppShellTopbar", () => {
  it("renders primary actions and light utility registrations through a shared shell", () => {
    const html = renderToStaticMarkup(
      React.createElement(AppShellTopbar, {
        brandTitle: "SkillsIndex",
        brandSubtitle: "Marketplace",
        onBrandClick: () => undefined,
        isLightTheme: true,
        primaryActions: [
          { id: "category", label: "Categories", onClick: () => undefined },
          { id: "ranking", label: "Rankings", onClick: () => undefined }
        ],
        utilityActions: [{ id: "search", label: "Search", onClick: () => undefined }]
      })
    );

    expect(html).toContain("SkillsIndex");
    expect(html).toContain("Categories");
    expect(html).toContain("Rankings");
    expect(html).toContain("Search");
    expect(html).toContain("marketplace-topbar-light-utility");
  });

  it("supports a workspace shell class contract without rendering marketplace namespace classes", () => {
    const html = renderToStaticMarkup(
      React.createElement(AppShellTopbar, {
        brandTitle: "SkillsIndex",
        brandSubtitle: "Workspace",
        onBrandClick: () => undefined,
        isLightTheme: true,
        variant: "workspace-shell",
        primaryActions: [{ id: "overview", label: "Overview", active: true, onClick: () => undefined }],
        utilityActions: [{ id: "search", label: "Search", onClick: () => undefined }]
      })
    );

    expect(html).toContain("workspace-shell-topbar-light-utility");
    expect(html).toContain("workspace-shell-topbar-nav-button is-active");
    expect(html).not.toContain("marketplace-topbar-light-utility");
    expect(html).not.toContain("marketplace-topbar-nav-button");
  });

  it("prefers custom primary navigation content when provided", () => {
    const html = renderToStaticMarkup(
      React.createElement(AppShellTopbar, {
        brandTitle: "SkillsIndex",
        brandSubtitle: "Workspace",
        onBrandClick: () => undefined,
        isLightTheme: true,
        primaryActions: [{ id: "ignored", label: "Ignored", onClick: () => undefined }],
        primaryNavigationContent: React.createElement(
          "div",
          { className: "custom-primary-nav" },
          React.createElement("span", null, "App Navigation")
        )
      })
    );

    expect(html).toContain("custom-primary-nav");
    expect(html).toContain("App Navigation");
    expect(html).not.toContain("Ignored");
  });
});
