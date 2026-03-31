import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  workspaceActionsRoute,
  workspaceActivityRoute,
  workspaceOverviewRoute,
  workspacePolicyRoute,
  workspaceQueueRoute,
  workspaceRunbookRoute
} from "@/src/lib/routing/protectedSurfaceLinks";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("workspace route entrypoints", () => {
  it("routes workspace pages through the shared workspace route helper and protected route contract", () => {
    const routeFiles = [
      { file: "app/(workspace)/workspace/page.tsx", route: workspaceOverviewRoute },
      { file: "app/(workspace)/workspace/activity/page.tsx", route: workspaceActivityRoute },
      { file: "app/(workspace)/workspace/queue/page.tsx", route: workspaceQueueRoute },
      { file: "app/(workspace)/workspace/policy/page.tsx", route: workspacePolicyRoute },
      { file: "app/(workspace)/workspace/runbook/page.tsx", route: workspaceRunbookRoute },
      { file: "app/(workspace)/workspace/actions/page.tsx", route: workspaceActionsRoute }
    ];

    for (const { file, route } of routeFiles) {
      const routeSource = readAppFile(file);

      expect(routeSource).toContain('from "@/src/features/workspace/workspaceRouteEntry"');
      expect(routeSource).toContain('from "@/src/lib/routing/protectedSurfaceLinks"');
      expect(routeSource).not.toContain('from "@/src/lib/auth/session"');
      expect(routeSource).not.toContain('from "@/src/features/workspace/renderWorkspaceRoute"');
      expect(routeSource).not.toContain("getServerSessionContext");
      expect(routeSource).not.toContain(`renderWorkspacePageRoute("${route}")`);
    }
  });
});
