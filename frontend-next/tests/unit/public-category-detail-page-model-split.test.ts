import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public category detail page model split", () => {
  it("keeps the detail page model free of category hub navigation builders", () => {
    const source = readRepoFile("src/features/public/publicCategoryDetailPageModel.ts");

    expect(source).not.toContain('from "./marketplace/marketplaceCategoryHubModel"');
    expect(source).toContain('from "./marketplace/marketplaceCategoryNavigation"');
  });
});
