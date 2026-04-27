import { describe, expect, it } from "vitest";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

describe("public narrative route entrypoints", () => {
  it("routes narrative snapshot pages through the shared narrative entry helper", () => {
    const routeFiles = [
      "app/(public)/about/page.tsx",
      "app/(public)/docs/page.tsx",
      "app/(public)/governance/page.tsx",
      "app/(public)/rollout/page.tsx",
      "app/(public)/timeline/page.tsx"
    ];

    for (const relativePath of routeFiles) {
      const routeSource = expectRouteEntrypoint(relativePath, {
        requiredSnippets: ['from "@/src/features/public/publicNarrativeSnapshotRouteEntry"'],
        forbiddenSnippets: ["loadPublicMarketplaceSnapshotFromRequest", "PublicProgramPage", "PublicDocsPage"]
      });

      expect(routeSource).toContain("renderPublicNarrativeSnapshotRoute");
    }
  });
});
