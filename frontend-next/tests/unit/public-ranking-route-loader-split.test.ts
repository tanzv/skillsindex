import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public ranking route loader split", () => {
  it("keeps the ranking route entry focused on rendering and delegates fetch orchestration to the shared loader", () => {
    const routeEntrySource = readRepoFile("src/features/public/publicRankingRouteEntry.tsx");

    expect(routeEntrySource).toContain('from "./publicRankingRouteLoader"');
    expect(routeEntrySource).not.toContain('from "@/src/lib/api/public"');
    expect(routeEntrySource).not.toContain('from "@/src/lib/api/publicFallbackLogging"');
    expect(routeEntrySource).not.toContain('from "next/headers"');
    expect(routeEntrySource).not.toContain("buildPublicRankingFallbackResponse");
  });
});
