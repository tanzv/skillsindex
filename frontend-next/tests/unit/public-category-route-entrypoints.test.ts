import { describe, expect, it } from "vitest";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

describe("public category route entrypoints", () => {
  it("routes the category hub entry through the shared category route helper", () => {
    const hubRoute = expectRouteEntrypoint("app/(public)/categories/page.tsx", {
      requiredSnippets: ['from "@/src/features/public/publicCategoryRouteEntry"'],
      forbiddenSnippets: ["PublicCategoryPage", "PublicCategoryDetailPage", "fetchMarketplace"]
    });

    expect(hubRoute).toContain("renderPublicCategoryRoute");
  });

  it("routes the category detail entry through the shared detail route helper", () => {
    const detailRoute = expectRouteEntrypoint("app/(public)/categories/[slug]/page.tsx", {
      requiredSnippets: ['from "@/src/features/public/publicCategoryDetailRouteEntry"'],
      forbiddenSnippets: ["PublicCategoryDetailPage", "PublicCategoryPage", "fetchMarketplace"]
    });

    expect(detailRoute).toContain("renderPublicCategoryDetailRoute");
  });
});
