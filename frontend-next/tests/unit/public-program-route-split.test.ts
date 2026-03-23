import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public program route split", () => {
  it("keeps the narrative page free of direct marketplace view-model and search-history builders", () => {
    const pageSource = readSourceFile("src/features/public/PublicProgramPage.tsx");

    expect(pageSource).not.toContain('from "./marketplace/marketplaceViewModel"');
    expect(pageSource).not.toContain('from "./marketplace/searchHistory"');
    expect(pageSource).not.toContain('from "./publicProgramModel"');
    expect(pageSource).toContain('from "./publicProgramPageModel"');
  });
});
