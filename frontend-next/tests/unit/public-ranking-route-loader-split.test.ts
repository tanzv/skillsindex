import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public ranking route loader split", () => {
  it("keeps the ranking route entry focused on rendering and delegates fetch orchestration to the shared loader", () => {
    const routeEntrySource = readSourceFile("src/features/public/publicRankingRouteEntry.tsx");

    expect(routeEntrySource).toContain('from "./publicRankingRouteLoader"');
    expect(routeEntrySource).not.toContain('from "@/src/lib/api/public"');
    expect(routeEntrySource).not.toContain('from "@/src/lib/api/publicFallbackLogging"');
    expect(routeEntrySource).not.toContain('from "next/headers"');
    expect(routeEntrySource).not.toContain("buildPublicRankingFallbackResponse");
  });
});
