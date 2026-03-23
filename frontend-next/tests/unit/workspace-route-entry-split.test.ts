import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("workspace route entry split", () => {
  it("keeps the workspace route entry focused on shared protected session loading and delegates rendering to renderWorkspaceRoute", () => {
    const source = readSourceFile("src/features/workspace/workspaceRouteEntry.tsx");

    expect(source).toContain('from "@/src/features/protected/loadProtectedRouteSession"');
    expect(source).not.toContain('from "@/src/lib/auth/session"');
    expect(source).toContain('from "./renderWorkspaceRoute"');
    expect(source).not.toContain('from "./pageModel"');
  });
});
