import { describe, expect, it } from "vitest";
import { buildMarketplacePublicStageClassName } from "./MarketplacePublicPageShell";

describe("MarketplacePublicPageShell", () => {
  it("builds stage class names for results category pages", () => {
    expect(
      buildMarketplacePublicStageClassName({
        isResultsStage: true,
        isMobileLayout: true,
        isLightTheme: true
      })
    ).toBe("prototype-shell marketplace-home-stage marketplace-results-page-stage is-mobile-stage is-light-stage");
  });

  it("builds stage class names for default pages", () => {
    expect(
      buildMarketplacePublicStageClassName({
        isResultsStage: false,
        isMobileLayout: false,
        isLightTheme: false
      })
    ).toBe("prototype-shell marketplace-home-stage");
  });
});
