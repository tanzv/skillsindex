import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public results route split", () => {
  it("keeps the client page free of marketplace view-model and route-state dependencies", () => {
    const pageSource = readRepoFile("src/features/public/PublicSearchPage.tsx");

    expect(pageSource).not.toContain('from "./marketplace/marketplaceViewModel"');
    expect(pageSource).not.toContain('from "@/src/lib/routing/usePublicRouteState"');
  });
});
