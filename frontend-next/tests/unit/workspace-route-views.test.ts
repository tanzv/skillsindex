import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("workspace route views", () => {
  it("keeps workspace route rendering centralized in a route-to-view renderer map backed by shared route constants", () => {
    const source = readSourceFile("src/features/workspace/WorkspaceRouteViews.tsx");

    expect(source).toContain("workspaceRouteViewRenderers");
    expect(source).toContain('from "@/src/lib/routing/protectedSurfaceLinks"');
    expect(source).not.toContain("if (model.route ===");
    expect(source).not.toContain('"/workspace/activity"');
    expect(source).not.toContain('"/workspace/queue"');
    expect(source).not.toContain('"/workspace/policy"');
    expect(source).not.toContain('"/workspace/runbook"');
    expect(source).not.toContain('"/workspace/actions"');
  });
});
