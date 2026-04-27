import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public skill detail route split", () => {
  it("keeps the interactive detail shell free of public route state dependencies and local skill fallback imports", () => {
    const source = readRepoFile("src/features/public/PublicSkillInteractiveDetail.tsx");

    expect(source).not.toContain('from "@/src/lib/routing/usePublicRouteState"');
    expect(source).not.toContain('from "../lib/routing/usePublicRouteState"');
    expect(source).not.toContain('import("./publicSkillDetailFallback")');
    expect(source).not.toContain("loadFallbackResourceContent");
    expect(source).toContain('from "./publicSkillInteractivePageModel"');
  });
});
