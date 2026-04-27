import { describe, expect, it } from "vitest";

import {
  workspaceActionsRoute,
  workspaceActivityRoute,
  workspaceOverviewRoute,
  workspacePolicyRoute,
  workspaceQueueRoute,
  workspaceRunbookRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

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
      const routeSource = expectRouteEntrypoint(file, {
        requiredSnippets: [
          'from "@/src/features/workspace/workspaceRouteEntry"',
          'from "@/src/lib/routing/protectedSurfaceLinks"'
        ],
        forbiddenSnippets: [
          'from "@/src/lib/auth/session"',
          'from "@/src/features/workspace/renderWorkspaceRoute"',
          "getServerSessionContext",
          `renderWorkspacePageRoute("${route}")`
        ]
      });

      expect(routeSource).toContain("renderWorkspacePageRoute(");
    }
  });
});
