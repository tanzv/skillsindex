import { describe, expect, it } from "vitest";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

describe("public ranking route entrypoint", () => {
  it("routes the rankings page through the shared ranking route helper", () => {
    const routeSource = expectRouteEntrypoint("app/(public)/rankings/page.tsx", {
      requiredSnippets: ['from "@/src/features/public/publicRankingRouteEntry"'],
      forbiddenSnippets: ["PublicRankingPage", "fetchRanking", "fetchSkillCompare", "next/headers"]
    });

    expect(routeSource).toContain("renderPublicRankingRoute");
  });
});
