import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MarketplacePagination } from "@/src/features/public/marketplace/MarketplacePagination";

vi.mock("next/link", () => ({
  default: ({
    href,
    as,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    as?: string;
    children: ReactNode;
  }) => createElement("a", { href, "data-as": as, ...props }, children)
}));

describe("MarketplacePagination", () => {
  it("renders previous and next links while preserving active filters", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplacePagination, {
        basePath: "/light/categories/operations",
        currentPage: 2,
        totalPages: 4,
        prevPage: 1,
        nextPage: 3,
        summaryLabel: "Page 2 of 4",
        previousLabel: "Previous",
        nextLabel: "Next",
        query: {
          q: "release",
          tags: "ops",
          subcategory: "release",
          sort: "stars",
          mode: "ai"
        }
      })
    );

    expect(markup).toContain('data-testid="marketplace-pagination"');
    expect(markup).toContain("Page 2 of 4");
    expect(markup).toContain('href="/light/categories/operations?q=release&amp;tags=ops&amp;subcategory=release&amp;sort=stars&amp;mode=ai&amp;page=1"');
    expect(markup).toContain('href="/light/categories/operations?q=release&amp;tags=ops&amp;subcategory=release&amp;sort=stars&amp;mode=ai&amp;page=3"');
  });

  it("preserves page size when pagination links are built from deep-linked marketplace URLs", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplacePagination, {
        basePath: "/results",
        currentPage: 2,
        totalPages: 4,
        prevPage: 1,
        nextPage: 3,
        summaryLabel: "Page 2 of 4",
        previousLabel: "Previous",
        nextLabel: "Next",
        query: {
          q: "release",
          page_size: "1"
        }
      })
    );

    expect(markup).toContain('href="/results?q=release&amp;page_size=1&amp;page=1"');
    expect(markup).toContain('href="/results?q=release&amp;page_size=1&amp;page=3"');
  });

  it("does not render pagination controls when there is only one page", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplacePagination, {
        basePath: "/results",
        currentPage: 1,
        totalPages: 1,
        prevPage: 0,
        nextPage: 0,
        summaryLabel: "Page 1 of 1",
        previousLabel: "Previous",
        nextLabel: "Next",
        query: {
          q: "release"
        }
      })
    );

    expect(markup).toBe("");
  });
});
