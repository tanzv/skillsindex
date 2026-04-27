import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public ranking route split", () => {
  it("keeps the client ranking page free of direct pure ranking and compare builders", () => {
    const pageSource = readRepoFile("src/features/public/PublicRankingPage.tsx");

    expect(pageSource).not.toContain("buildPublicSkillBatchWarmupTargets");
    expect(pageSource).not.toContain("mapRankingCategoryLeaderCards");
    expect(pageSource).not.toContain("resolveComparedSkillsFromItems");
    expect(pageSource).toContain('from "./publicRankingPageModel"');
  });
});
