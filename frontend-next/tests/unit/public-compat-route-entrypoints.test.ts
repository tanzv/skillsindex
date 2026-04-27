import { describe, expect, it } from "vitest";

import { publicRankingsRoute, publicResultsRoute } from "@/src/lib/routing/publicRouteRegistry";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

describe("public compatibility route entrypoints", () => {
  it("routes the legacy search page through the shared compatibility helper", () => {
    const routeSource = expectRouteEntrypoint("app/(public)/search/page.tsx", {
      requiredSnippets: [
        'from "@/src/features/public/publicCompatibilityRouteEntry"',
        'from "@/src/lib/routing/publicRouteRegistry"',
        "publicResultsRoute"
      ],
      forbiddenSnippets: ['from "next/navigation"', "URLSearchParams", '"/results?"', `canonicalRoute: "${publicResultsRoute}"`]
    });

    expect(routeSource).toContain("redirectPublicCompatibilityRoute");
  });

  it("routes the legacy compare page through the shared compatibility helper", () => {
    const routeSource = expectRouteEntrypoint("app/(public)/compare/page.tsx", {
      requiredSnippets: [
        'from "@/src/features/public/publicCompatibilityRouteEntry"',
        'from "@/src/lib/routing/publicRouteRegistry"',
        "publicRankingsRoute"
      ],
      forbiddenSnippets: [
        'from "next/navigation"',
        "URLSearchParams",
        'params.set("sort", "stars")',
        `canonicalRoute: "${publicRankingsRoute}"`
      ]
    });

    expect(routeSource).toContain("redirectPublicCompatibilityRoute");
  });
});
