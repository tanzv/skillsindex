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
    ).toBe("si-layout-shell-stage si-layout-shell-surface si-layout-shell-surface-results si-layout-shell-stage-mobile si-layout-shell-stage-light");
  });

  it("builds stage class names for default pages", () => {
    expect(
      buildMarketplacePublicStageClassName({
        isResultsStage: false,
        isMobileLayout: false,
        isLightTheme: false
      })
    ).toBe("si-layout-shell-stage si-layout-shell-surface");
  });
});
