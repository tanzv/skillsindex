import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public narrative route entrypoints", () => {
  it("routes narrative snapshot pages through the shared narrative entry helper", () => {
    const aboutRoute = readAppFile("app/(public)/about/page.tsx");
    const docsRoute = readAppFile("app/(public)/docs/page.tsx");
    const governanceRoute = readAppFile("app/(public)/governance/page.tsx");
    const rolloutRoute = readAppFile("app/(public)/rollout/page.tsx");
    const timelineRoute = readAppFile("app/(public)/timeline/page.tsx");

    for (const routeSource of [aboutRoute, docsRoute, governanceRoute, rolloutRoute, timelineRoute]) {
      expect(routeSource).toContain('from "@/src/features/public/publicNarrativeSnapshotRouteEntry"');
      expect(routeSource).not.toContain("loadPublicMarketplaceSnapshotFromRequest");
      expect(routeSource).not.toContain("PublicProgramPage");
      expect(routeSource).not.toContain("PublicDocsPage");
    }
  });
});
