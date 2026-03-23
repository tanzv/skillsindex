import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public marketplace route loader split", () => {
  it("keeps marketplace route entries on the shared loader instead of duplicating fetch and fallback wiring", () => {
    const landingSource = readSourceFile("src/features/public/publicLandingRouteEntry.tsx");
    const resultsSource = readSourceFile("src/features/public/publicResultsRouteEntry.tsx");
    const categorySource = readSourceFile("src/features/public/publicCategoryRouteEntry.tsx");
    const detailSource = readSourceFile("src/features/public/publicCategoryDetailRouteEntry.tsx");

    for (const source of [landingSource, resultsSource, categorySource, detailSource]) {
      expect(source).toContain('from "./publicMarketplaceRouteLoader"');
      expect(source).not.toContain('from "@/src/lib/api/public"');
      expect(source).not.toContain('from "@/src/lib/api/publicFallbackLogging"');
      expect(source).not.toContain("buildPublicMarketplaceFallback");
      expect(source).not.toContain('from "next/headers"');
    }
  });
});
