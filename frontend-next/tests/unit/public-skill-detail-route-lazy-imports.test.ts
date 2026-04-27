import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("public skill detail route lazy imports", () => {
  it("lazy-loads the interactive detail page from the shared route helper", () => {
    const routeEntrySource = readRepoFile("src/features/public/publicSkillDetailRouteEntry.tsx");

    expect(routeEntrySource).toContain('await import("./PublicSkillInteractiveDetail")');
    expect(routeEntrySource).not.toContain('import { PublicSkillInteractiveDetail } from "./PublicSkillInteractiveDetail";');
  });
});
