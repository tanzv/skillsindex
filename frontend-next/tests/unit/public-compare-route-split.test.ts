import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public compare route split", () => {
  it("keeps the compare page free of direct compare and taxonomy derivation helpers", () => {
    const pageSource = readSourceFile("src/features/public/PublicComparePage.tsx");

    expect(pageSource).toContain('from "./publicComparePageModel"');
    expect(pageSource).not.toContain('from "./publicCompareModel"');
    expect(pageSource).not.toContain('from "./marketplace/marketplaceTaxonomy"');
  });
});
