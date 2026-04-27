import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("marketplace topbar split", () => {
  it("lazy-loads landing-only topbar actions from the shared slot builder", () => {
    const slotBuilder = readRepoFile("src/features/public/marketplace/marketplaceTopbarSlots.tsx");

    expect(slotBuilder).toContain('import dynamic from "next/dynamic";');
    expect(slotBuilder).toContain('import("./MarketplaceHomeTopbar").then((module) => module.MarketplaceHomeTopbarActions)');
    expect(slotBuilder).not.toContain('import { MarketplaceHomeTopbarActions } from "./MarketplaceHomeTopbar";');
  });
});
