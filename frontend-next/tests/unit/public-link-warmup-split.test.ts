import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public link warmup split", () => {
  it("lazy-loads skill warmup helpers so ordinary public links do not statically pull the warmup module", () => {
    const source = readRepoFile("src/components/shared/PublicLink.tsx");

    expect(source).toContain('import("./publicSkillRouteWarmup")');
    expect(source).not.toContain('from "./publicSkillRouteWarmup"');
  });
});
