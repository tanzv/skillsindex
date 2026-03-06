import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ExpandableNavBar from "./ExpandableNavBar";
import type { ExpandableNavItem } from "./ExpandableNavBar.helpers";

const navItems: ExpandableNavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "docs", label: "Docs", href: "/docs" },
  { id: "ranking", label: "Ranking", href: "/ranking" },
  { id: "settings", label: "Settings", onClick: () => undefined }
];

describe("ExpandableNavBar", () => {
  it("renders one-row navigation by default and exposes expand affordance when overflow exists", () => {
    const html = renderToStaticMarkup(
      React.createElement(ExpandableNavBar, {
        items: navItems,
        userInfo: {
          displayName: "Alice Green",
          subtitle: "Maintainer"
        },
        collapsedVisibleCount: 2,
        moreLabel: "More"
      })
    );

    expect(html).toContain("Home");
    expect(html).toContain("Docs");
    expect(html).not.toContain("Ranking");
    expect(html).toContain("More (2)");
    expect(html).toContain("Alice Green");
    expect(html).toContain("Maintainer");
    expect(html).toContain(">AG<");
  });

  it("renders all navigation entries when defaultExpanded is enabled", () => {
    const html = renderToStaticMarkup(
      React.createElement(ExpandableNavBar, {
        items: navItems,
        userInfo: {
          displayName: "Bob"
        },
        collapsedVisibleCount: 2,
        defaultExpanded: true,
        lessLabel: "Less"
      })
    );

    expect(html).toContain("Home");
    expect(html).toContain("Docs");
    expect(html).toContain("Ranking");
    expect(html).toContain("Settings");
    expect(html).toContain("Less");
  });

  it("prefers avatar image when avatarUrl is provided", () => {
    const html = renderToStaticMarkup(
      React.createElement(ExpandableNavBar, {
        items: navItems.slice(0, 1),
        userInfo: {
          displayName: "Charlie",
          avatarUrl: "https://example.com/avatar.png",
          avatarAlt: "Profile avatar"
        }
      })
    );

    expect(html).toContain("src=\"https://example.com/avatar.png\"");
    expect(html).toContain("alt=\"Profile avatar\"");
  });
});
