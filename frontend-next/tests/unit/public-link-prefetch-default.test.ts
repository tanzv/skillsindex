import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public link prefetch default", () => {
  it("disables next link prefetch by default while allowing explicit overrides", () => {
    const source = readRepoFile("src/components/shared/PublicLink.tsx");

    expect(source).toContain("prefetch={prefetch ?? false}");
  });
});
