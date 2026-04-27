import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("workspace route entry split", () => {
  it("keeps the workspace route entry focused on shared protected session loading and delegates rendering to renderWorkspaceRoute", () => {
    const source = readRepoFile("src/features/workspace/workspaceRouteEntry.tsx");

    expect(source).toContain('from "@/src/features/protected/loadProtectedRouteSession"');
    expect(source).not.toContain('from "@/src/lib/auth/session"');
    expect(source).toContain('from "./renderWorkspaceRoute"');
    expect(source).not.toContain('from "./pageModel"');
  });
});
