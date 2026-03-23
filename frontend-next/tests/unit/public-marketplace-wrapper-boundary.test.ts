import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public marketplace wrapper boundary", () => {
  it("keeps direct public feature consumers on shared marketplace contracts instead of wrapper re-exports", () => {
    const rankingModelSource = readSourceFile("src/features/public/publicRankingModel.ts");
    const comparePageModelSource = readSourceFile("src/features/public/publicComparePageModel.ts");
    const categoryDetailPageModelSource = readSourceFile("src/features/public/publicCategoryDetailPageModel.ts");
    const rankingPageModelSource = readSourceFile("src/features/public/publicRankingPageModel.ts");
    const rankingPageSource = readSourceFile("src/features/public/PublicRankingPage.tsx");
    const skillDetailTaxonomySource = readSourceFile("src/features/public/skill-detail/skillDetailTaxonomy.ts");
    const categoryCollectionsSource = readSourceFile("src/features/public/marketplace/marketplaceCategoryCollections.ts");
    const batchWarmupSource = readSourceFile("src/features/public/marketplace/usePublicSkillBatchWarmup.ts");

    expect(rankingModelSource).not.toContain('from "./publicMarketplaceFallback"');
    expect(rankingModelSource).not.toContain('from "./marketplace/marketplaceTaxonomy"');
    expect(comparePageModelSource).not.toContain('from "./marketplace/marketplaceTaxonomy"');
    expect(categoryDetailPageModelSource).not.toContain('from "./marketplace/marketplaceTaxonomy"');
    expect(rankingPageModelSource).not.toContain('from "./marketplace/marketplaceTaxonomy"');
    expect(rankingPageSource).not.toContain('from "./marketplace/marketplaceTaxonomy"');
    expect(skillDetailTaxonomySource).not.toContain('from "../marketplace/marketplaceTaxonomyText"');
    expect(skillDetailTaxonomySource).not.toContain('from "../marketplace/marketplaceTaxonomyDefinitions"');
    expect(categoryCollectionsSource).not.toContain('from "./marketplaceTaxonomyText"');
    expect(categoryCollectionsSource).not.toContain('from "./marketplaceTaxonomy"');
    expect(batchWarmupSource).not.toContain('from "./publicSkillWarmupPolicy"');
    expect(batchWarmupSource).not.toContain("from './publicSkillWarmupPolicy'");
  });
});
