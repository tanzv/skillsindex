import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("workspace overview route split", () => {
  it("keeps the overview page free of interactive workspace route view imports", () => {
    const overviewSource = readSourceFile("src/features/workspace/WorkspaceOverviewRoutePage.tsx");

    expect(overviewSource).toContain('from "./WorkspaceRouteFrame"');
    expect(overviewSource).toContain('from "./WorkspaceRouteShared"');
    expect(overviewSource).not.toContain('from "./WorkspaceRouteViews"');
    expect(overviewSource).not.toContain('from "./WorkspaceRouteDetailSurface"');
  });
});
