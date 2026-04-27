import { describe, expect, it } from "vitest";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

describe("public results route entrypoint", () => {
  it("routes the results page through the shared results route helper", () => {
    const routeSource = expectRouteEntrypoint("app/(public)/results/page.tsx", {
      requiredSnippets: ['from "@/src/features/public/publicResultsRouteEntry"'],
      forbiddenSnippets: ["PublicSearchPage", "fetchMarketplace", "buildPublicSearchPageModel", "next/headers"]
    });

    expect(routeSource).toContain("renderPublicResultsRoute");
  });
});
