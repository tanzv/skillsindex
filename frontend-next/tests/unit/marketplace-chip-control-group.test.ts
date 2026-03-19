import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarketplaceChipControlGroup } from "@/src/features/public/marketplace/MarketplaceChipControlGroup";

describe("MarketplaceChipControlGroup", () => {
  it("renders active and counted chip links", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceChipControlGroup, {
        label: "Subcategories",
        items: [
          { key: "all", href: "/categories/ops", label: "All", secondaryLabel: 12, isActive: true },
          { key: "release", href: "/categories/ops?subcategory=release", label: "Release", secondaryLabel: 4 }
        ]
      })
    );

    expect(markup).toContain("Subcategories");
    expect(markup).toContain("href=\"/categories/ops\"");
    expect(markup).toContain("is-active");
    expect(markup).toContain(">12<");
    expect(markup).toContain("Release");
  });

  it("renders inline modifier when requested", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceChipControlGroup, {
        label: "Sort",
        inline: true,
        className: "custom-control-group",
        rowClassName: "custom-row",
        items: [{ key: "stars", href: "/rankings", label: "Stars", isActive: true }]
      })
    );

    expect(markup).toContain("marketplace-control-group");
    expect(markup).toContain("is-inline");
    expect(markup).toContain("custom-control-group");
    expect(markup).toContain("custom-row");
  });
});
