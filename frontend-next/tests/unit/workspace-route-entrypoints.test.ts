import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("workspace route entrypoints", () => {
  it("routes workspace pages through the shared workspace route helper", () => {
    const routeFiles = [
      "app/(workspace)/workspace/page.tsx",
      "app/(workspace)/workspace/activity/page.tsx",
      "app/(workspace)/workspace/queue/page.tsx",
      "app/(workspace)/workspace/policy/page.tsx",
      "app/(workspace)/workspace/runbook/page.tsx",
      "app/(workspace)/workspace/actions/page.tsx"
    ];

    for (const routeFile of routeFiles) {
      const routeSource = readAppFile(routeFile);

      expect(routeSource).toContain('from "@/src/features/workspace/workspaceRouteEntry"');
      expect(routeSource).not.toContain('from "@/src/lib/auth/session"');
      expect(routeSource).not.toContain('from "@/src/features/workspace/renderWorkspaceRoute"');
      expect(routeSource).not.toContain("getServerSessionContext");
    }
  });
});
