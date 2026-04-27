import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public program route split", () => {
  it("keeps the narrative page free of direct marketplace view-model and search-history builders", () => {
    const pageSource = readRepoFile("src/features/public/PublicProgramPage.tsx");

    expect(pageSource).not.toContain('from "./marketplace/marketplaceViewModel"');
    expect(pageSource).not.toContain('from "./marketplace/searchHistory"');
    expect(pageSource).not.toContain('from "./publicProgramModel"');
    expect(pageSource).toContain('from "./publicProgramPageModel"');
  });
});
