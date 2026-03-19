import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarketplaceSupportCard } from "@/src/features/public/marketplace/MarketplaceSupportCard";
import { MarketplaceSupportMetricsList } from "@/src/features/public/marketplace/MarketplaceSupportMetricsList";

describe("MarketplaceSupportCard", () => {
  it("renders title, description, and header action", () => {
    const markup = renderToStaticMarkup(
      createElement(
        MarketplaceSupportCard,
        {
          title: "Recent searches",
          description: "Continue from the latest queries.",
          headerAction: createElement("button", { type: "button" }, "Clear")
        },
        createElement("div", { className: "support-body" }, "Body")
      )
    );

    expect(markup).toContain("Recent searches");
    expect(markup).toContain("Continue from the latest queries.");
    expect(markup).toContain("Clear");
    expect(markup).toContain("support-body");
  });
});

describe("MarketplaceSupportMetricsList", () => {
  it("renders the provided metrics with an optional limit", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceSupportMetricsList, {
        limit: 2,
        metrics: [
          { label: "Total Skills", value: "120", detail: "Public assets" },
          { label: "Categories", value: "8", detail: "Families" },
          { label: "Top Tags", value: "16", detail: "Pivots" }
        ]
      })
    );

    expect(markup).toContain("Total Skills");
    expect(markup).toContain("Categories");
    expect(markup).not.toContain("Top Tags");
  });
});
