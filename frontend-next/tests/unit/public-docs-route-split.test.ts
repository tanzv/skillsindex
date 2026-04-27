import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public docs route split", () => {
  it("keeps the docs page focused on render composition and delegates data shaping to the page model", () => {
    const pageSource = readRepoFile("src/features/public/PublicDocsPage.tsx");

    expect(pageSource).toContain('from "./publicDocsPageModel"');
    expect(pageSource).not.toContain("useMemo");
    expect(pageSource).not.toContain("marketplace.categories.slice");
    expect(pageSource).not.toContain("marketplace.top_tags.slice");
  });
});
