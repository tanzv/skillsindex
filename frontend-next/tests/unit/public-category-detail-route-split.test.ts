import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public category detail route split", () => {
  it("keeps the client detail page free of direct marketplace view-model imports", () => {
    const pageSource = readRepoFile("src/features/public/PublicCategoryDetailPage.tsx");

    expect(pageSource).not.toContain('from "./marketplace/marketplaceViewModel"');
    expect(pageSource).toContain('from "./publicCategoryDetailPageModel"');
  });
});
