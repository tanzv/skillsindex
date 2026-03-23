import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public category detail page model split", () => {
  it("keeps the detail page model free of category hub navigation builders", () => {
    const source = readSourceFile("src/features/public/publicCategoryDetailPageModel.ts");

    expect(source).not.toContain('from "./marketplace/marketplaceCategoryHubModel"');
    expect(source).toContain('from "./marketplace/marketplaceCategoryNavigation"');
  });
});
