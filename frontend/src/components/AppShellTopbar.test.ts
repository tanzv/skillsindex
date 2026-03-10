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
