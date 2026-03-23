import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public category route split", () => {
  it("keeps the client category page free of direct marketplace view-model builders", () => {
    const pageSource = readSourceFile("src/features/public/PublicCategoryPage.tsx");

    expect(pageSource).not.toContain('from "./marketplace/marketplaceCategoryHubModel"');
    expect(pageSource).not.toContain('from "./marketplace/marketplaceCategoryCollections"');
    expect(pageSource).not.toContain('from "./marketplace/marketplaceViewModel"');
    expect(pageSource).toContain('from "./publicCategoryPageModel"');
  });
});
