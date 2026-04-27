import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public skill detail api split", () => {
  it("keeps initial skill detail loading decoupled from the marketplace aggregate api module", () => {
    const source = readRepoFile("src/features/public/loadInitialSkillDetailPageData.ts");

    expect(source).not.toContain('from "@/src/lib/api/public"');
    expect(source).not.toContain('from "../lib/api/public"');
  });
});
