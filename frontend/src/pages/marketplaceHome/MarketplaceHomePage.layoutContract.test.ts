import { describe, expect, it } from "vitest";

import marketplaceHomeThemeSource from "./MarketplaceHomePage.styles.theme.ts?raw";

describe("MarketplaceHomePage layout contract", () => {
  it("keeps the home topbar aligned to marketplace gutters instead of a fixed 1412 shell", () => {
    expect(marketplaceHomeThemeSource).toContain(
      'topbarMaxWidth: "calc(100% - (var(--marketplace-content-gutter) * 2))"'
    );
    expect(marketplaceHomeThemeSource).toContain('contentMaxWidth: "1412px"');
    expect(marketplaceHomeThemeSource).not.toContain('topbarMaxWidth: "1412px"');
  });
});
