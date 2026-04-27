import { describe, expect, it } from "vitest";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

describe("public landing route entrypoint", () => {
  it("routes the landing page through the shared landing route helper", () => {
    const routeSource = expectRouteEntrypoint("app/(public)/page.tsx", {
      requiredSnippets: ['from "@/src/features/public/publicLandingRouteEntry"'],
      forbiddenSnippets: ["fetchMarketplace", "buildPublicMarketplaceFallback", "next/headers"]
    });

    expect(routeSource).toContain("renderPublicLandingRoute");
  });
});
