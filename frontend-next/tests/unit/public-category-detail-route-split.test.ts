import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public category detail route split", () => {
  it("keeps the client detail page free of direct marketplace view-model imports", () => {
    const pageSource = readSourceFile("src/features/public/PublicCategoryDetailPage.tsx");

    expect(pageSource).not.toContain('from "./marketplace/marketplaceViewModel"');
    expect(pageSource).toContain('from "./publicCategoryDetailPageModel"');
  });
});
