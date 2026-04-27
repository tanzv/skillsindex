import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public ranking model runtime boundary", () => {
  it("keeps runtime ranking model free of marketplace fallback data helpers", () => {
    const source = readRepoFile("src/features/public/publicRankingModel.ts");

    expect(source).not.toContain('from "@/src/lib/marketplace/fallback"');
    expect(source).not.toContain("buildPublicRankingFallbackResponse");
  });
});
