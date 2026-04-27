import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("workspace route split", () => {
  it("keeps route rendering on the server and lazy-loads the overview and interactive pages after the server model resolves", () => {
    const source = readRepoFile("src/features/workspace/renderWorkspaceRoute.tsx");

    expect(source).not.toContain('from "./WorkspaceRouteScene"');
    expect(source).toContain('from "./loadWorkspaceRouteModel"');
    expect(source).not.toContain('from "./pageModel"');
    expect(source).toContain('await import("./WorkspaceOverviewRoutePage")');
    expect(source).toContain('await import("./WorkspaceRoutePage")');
    expect(source).not.toContain('from "./WorkspaceOverviewRoutePage"');
    expect(source).not.toContain('from "./WorkspaceRoutePage"');
    expect(source).not.toContain("const pageModule =");
    expect(source).not.toContain("pageModule.WorkspaceOverviewRoutePage");
    expect(source).not.toContain("pageModule.WorkspaceRoutePage");
  });
});
