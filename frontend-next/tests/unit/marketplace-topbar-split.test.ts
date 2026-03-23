import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("marketplace topbar split", () => {
  it("lazy-loads landing-only topbar actions from the shared slot builder", () => {
    const slotBuilder = readSourceFile("src/features/public/marketplace/marketplaceTopbarSlots.tsx");

    expect(slotBuilder).toContain('import dynamic from "next/dynamic";');
    expect(slotBuilder).toContain('import("./MarketplaceHomeTopbar").then((module) => module.MarketplaceHomeTopbarActions)');
    expect(slotBuilder).not.toContain('import { MarketplaceHomeTopbarActions } from "./MarketplaceHomeTopbar";');
  });
});
