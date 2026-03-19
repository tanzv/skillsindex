import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarketplaceResultsStage } from "@/src/features/public/marketplace/MarketplaceResultsStage";

describe("MarketplaceResultsStage", () => {
  it("renders shared results layout with explicit main and side test ids", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceResultsStage, {
        className: "custom-layout",
        mainClassName: "custom-main",
        sideClassName: "custom-side",
        layoutTestId: "results-layout",
        mainTestId: "results-main",
        sideTestId: "results-side",
        mainContent: createElement("section", null, "Main stage"),
        sideContent: createElement("section", null, "Support stage")
      })
    );

    expect(markup).toContain("marketplace-results-layout");
    expect(markup).toContain("data-testid=\"results-layout\"");
    expect(markup).toContain("data-testid=\"results-main\"");
    expect(markup).toContain("data-testid=\"results-side\"");
    expect(markup).toContain("custom-layout");
    expect(markup).toContain("custom-main");
    expect(markup).toContain("custom-side");
    expect(markup).toContain("<aside");
  });

  it("omits the support column when side content is not provided", () => {
    const markup = renderToStaticMarkup(
      createElement(MarketplaceResultsStage, {
        mainContent: createElement("section", null, "Main stage only")
      })
    );

    expect(markup).toContain("marketplace-main-column");
    expect(markup).not.toContain("<aside");
  });
});
