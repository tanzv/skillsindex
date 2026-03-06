import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MarketplacePageBreadcrumb from "./MarketplacePageBreadcrumb";

describe("MarketplacePageBreadcrumb", () => {
  it("renders clickable and current breadcrumb items with default classes", () => {
    const html = renderToStaticMarkup(
      React.createElement(MarketplacePageBreadcrumb, {
        items: [
          {
            key: "home",
            label: "SkillsIndex",
            onClick: () => undefined
          },
          {
            key: "current",
            label: "Categories"
          }
        ]
      })
    );

    expect(html).toContain("marketplace-page-breadcrumb");
    expect(html).toContain("marketplace-page-breadcrumb-link");
    expect(html).toContain("marketplace-page-breadcrumb-current");
    expect(html).toContain('data-testid="marketplace-breadcrumb-home"');
    expect(html).toContain('data-testid="marketplace-breadcrumb-current"');
  });

  it("supports custom class names and test id prefix", () => {
    const html = renderToStaticMarkup(
      React.createElement(MarketplacePageBreadcrumb, {
        className: "custom-breadcrumb",
        buttonClassName: "custom-breadcrumb-button",
        currentClassName: "custom-breadcrumb-current",
        testIdPrefix: "custom-breadcrumb",
        ariaLabel: "Custom breadcrumb",
        items: [
          {
            key: "root",
            label: "Home",
            onClick: () => undefined
          },
          {
            key: "leaf",
            label: "Docs"
          }
        ]
      })
    );

    expect(html).toContain('aria-label="Custom breadcrumb"');
    expect(html).toContain("custom-breadcrumb");
    expect(html).toContain("custom-breadcrumb-button");
    expect(html).toContain("custom-breadcrumb-current");
    expect(html).toContain('data-testid="custom-breadcrumb-root"');
    expect(html).toContain('data-testid="custom-breadcrumb-leaf"');
  });
});
