import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public ranking route entrypoint", () => {
  it("routes the rankings page through the shared ranking route helper", () => {
    const routeSource = readAppFile("app/(public)/rankings/page.tsx");

    expect(routeSource).toContain('from "@/src/features/public/publicRankingRouteEntry"');
    expect(routeSource).not.toContain("PublicRankingPage");
    expect(routeSource).not.toContain("fetchRanking");
    expect(routeSource).not.toContain("fetchSkillCompare");
    expect(routeSource).not.toContain("next/headers");
  });
});
