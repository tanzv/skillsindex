import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("workspace route split", () => {
  it("keeps route rendering on the server and lazy-loads the overview and interactive pages after the server model resolves", () => {
    const source = readSourceFile("src/features/workspace/renderWorkspaceRoute.tsx");

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
