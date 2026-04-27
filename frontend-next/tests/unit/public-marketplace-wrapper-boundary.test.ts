import { describe, it } from "vitest";
import {
  expectFileOmits,
  readRepoFile
} from "./routeEntrypointTestUtils";

describe("public marketplace wrapper boundary", () => {
  it("keeps direct public feature consumers on shared marketplace contracts instead of wrapper re-exports", () => {
    const rankingModelSource = readRepoFile("src/features/public/publicRankingModel.ts");
    const comparePageModelSource = readRepoFile("src/features/public/publicComparePageModel.ts");
    const categoryDetailPageModelSource = readRepoFile("src/features/public/publicCategoryDetailPageModel.ts");
    const rankingPageModelSource = readRepoFile("src/features/public/publicRankingPageModel.ts");
    const rankingPageSource = readRepoFile("src/features/public/PublicRankingPage.tsx");
    const skillDetailTaxonomySource = readRepoFile("src/features/public/skill-detail/skillDetailTaxonomy.ts");
    const categoryCollectionsSource = readRepoFile("src/features/public/marketplace/marketplaceCategoryCollections.ts");
    const batchWarmupSource = readRepoFile("src/features/public/marketplace/usePublicSkillBatchWarmup.ts");

    expectFileOmits(rankingModelSource, ['from "./publicMarketplaceFallback"', 'from "./marketplace/marketplaceTaxonomy"']);
    expectFileOmits(comparePageModelSource, ['from "./marketplace/marketplaceTaxonomy"']);
    expectFileOmits(categoryDetailPageModelSource, ['from "./marketplace/marketplaceTaxonomy"']);
    expectFileOmits(rankingPageModelSource, ['from "./marketplace/marketplaceTaxonomy"']);
    expectFileOmits(rankingPageSource, ['from "./marketplace/marketplaceTaxonomy"']);
    expectFileOmits(skillDetailTaxonomySource, [
      'from "../marketplace/marketplaceTaxonomyText"',
      'from "../marketplace/marketplaceTaxonomyDefinitions"'
    ]);
    expectFileOmits(categoryCollectionsSource, ['from "./marketplaceTaxonomyText"', 'from "./marketplaceTaxonomy"']);
    expectFileOmits(batchWarmupSource, ['from "./publicSkillWarmupPolicy"', "from './publicSkillWarmupPolicy'"]);
  });
});
