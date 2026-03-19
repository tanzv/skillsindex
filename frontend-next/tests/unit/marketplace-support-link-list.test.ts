import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MarketplaceSupportLinkList } from "@/src/features/public/marketplace/MarketplaceSupportLinkList";

vi.mock("next/navigation", () => ({
  usePathname: () => "/results"
}));

describe("MarketplaceSupportLinkList", () => {
  it("renders support links with active state and metadata", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceSupportLinkList, {
        items: [
          {
            key: "operations",
            href: "/categories/operations",
            label: "Operations",
            meta: "12 skills",
            isActive: true
          },
          {
            key: "analytics",
            href: "/categories/analytics",
            label: "Analytics",
            meta: "8 skills"
          }
        ]
      })
    );

    expect(markup).toContain("Operations");
    expect(markup).toContain("12 skills");
    expect(markup).toContain("Analytics");
    expect(markup).toContain("marketplace-simple-link-item is-active");
  });
});
