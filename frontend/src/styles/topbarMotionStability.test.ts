import { describe, expect, it } from "vitest";

import { marketplaceHomeTopbarPrimaryPopoverStyles } from "../pages/marketplaceHome/MarketplaceHomePage.styles.theme.topbarPrimaryPopover";
import { marketplaceHomeWorkspaceUserControlStyles } from "../pages/marketplaceHome/MarketplaceHomePage.styles.theme.workspaceUserControls";
import { globalBackendUserControlStyles } from "./globalStyles.backendUserControl";

describe("topbar motion stability styles", () => {
  it("uses translate-only popover motion without scale-based shimmer", () => {
    const styles = marketplaceHomeTopbarPrimaryPopoverStyles.styles;

    expect(styles).toMatch(/will-change:\s*opacity,\s*transform/);
    expect(styles).not.toContain("scale(0.98)");
    expect(styles).toMatch(/backdrop-filter:\s*none/);
  });

  it("keeps shared user center surfaces on opaque layers for steadier interaction", () => {
    const workspaceStyles = marketplaceHomeWorkspaceUserControlStyles.styles;

    expect(workspaceStyles).toMatch(/backdrop-filter:\s*none/);
    expect(workspaceStyles).toMatch(/-webkit-backdrop-filter:\s*none/);
    expect(workspaceStyles).toMatch(/transform:\s*translateZ\(0\)/);
  });

  it("applies the same stable panel treatment to backend user controls", () => {
    expect(globalBackendUserControlStyles).toContain("backdrop-filter: none;");
    expect(globalBackendUserControlStyles).toContain("-webkit-backdrop-filter: none;");
    expect(globalBackendUserControlStyles).toContain("transform: translateZ(0);");
  });
});
