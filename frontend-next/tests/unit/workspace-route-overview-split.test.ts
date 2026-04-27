import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("workspace overview route split", () => {
  it("keeps the overview page free of interactive workspace route view imports", () => {
    const overviewSource = readRepoFile("src/features/workspace/WorkspaceOverviewRoutePage.tsx");

    expect(overviewSource).toContain('from "./WorkspaceRouteFrame"');
    expect(overviewSource).toContain('from "./WorkspaceRouteShared"');
    expect(overviewSource).not.toContain('from "./WorkspaceRouteViews"');
    expect(overviewSource).not.toContain('from "./WorkspaceRouteDetailSurface"');
  });
});
