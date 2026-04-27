import { describe, it } from "vitest";
import {
  expectFileContains,
  expectFileOmits,
  readRepoFile
} from "./routeEntrypointTestUtils";

describe("workspace route views", () => {
  it("keeps workspace route rendering centralized in a route-to-view renderer map backed by shared route constants", () => {
    const source = readRepoFile("src/features/workspace/WorkspaceRouteViews.tsx");

    expectFileContains(source, ["workspaceRouteViewRenderers", 'from "@/src/lib/routing/protectedSurfaceLinks"']);
    expectFileOmits(source, [
      "if (model.route ===",
      '"/workspace/activity"',
      '"/workspace/queue"',
      '"/workspace/policy"',
      '"/workspace/runbook"',
      '"/workspace/actions"'
    ]);
  });
});
