import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public ranking route split", () => {
  it("keeps the client ranking page free of direct pure ranking and compare builders", () => {
    const pageSource = readSourceFile("src/features/public/PublicRankingPage.tsx");

    expect(pageSource).not.toContain("buildPublicSkillBatchWarmupTargets");
    expect(pageSource).not.toContain("mapRankingCategoryLeaderCards");
    expect(pageSource).not.toContain("resolveComparedSkillsFromItems");
    expect(pageSource).toContain('from "./publicRankingPageModel"');
  });
});
