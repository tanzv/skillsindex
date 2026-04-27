import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public category route split", () => {
  it("keeps the client category page free of direct marketplace view-model builders", () => {
    const pageSource = readRepoFile("src/features/public/PublicCategoryPage.tsx");

    expect(pageSource).not.toContain('from "./marketplace/marketplaceCategoryHubModel"');
    expect(pageSource).not.toContain('from "./marketplace/marketplaceCategoryCollections"');
    expect(pageSource).not.toContain('from "./marketplace/marketplaceViewModel"');
    expect(pageSource).toContain('from "./publicCategoryPageModel"');
  });
});
