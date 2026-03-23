import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MarketplaceChipControlGroup } from "@/src/features/public/marketplace/MarketplaceChipControlGroup";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) =>
    createElement("a", { href, ...props }, children)
}));

function expectMarkupToContainAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).toContain(fragment);
  }
}

function findLinkMarkup(markup: string, href: string) {
  const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const linkMatch = markup.match(new RegExp(`<a[^>]*href="${escapedHref}"[^>]*>`, "u"));
  expect(linkMatch?.[0]).toBeDefined();
  return linkMatch?.[0] ?? "";
}

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

    const activeLinkMarkup = findLinkMarkup(markup, "/categories/ops");

    expectMarkupToContainAll(markup, ["Subcategories", "Release", ">12<"]);
    expectMarkupToContainAll(activeLinkMarkup, ['class="marketplace-chip-control is-active"', 'aria-current="page"']);
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

    expectMarkupToContainAll(markup, [
      'aria-label="Sort"',
      "marketplace-control-group",
      "is-inline",
      "custom-control-group",
      "custom-row"
    ]);
  });
});
