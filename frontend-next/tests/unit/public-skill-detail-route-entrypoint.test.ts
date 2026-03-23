import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public skill detail route entrypoint", () => {
  it("routes skill detail pages through the shared route entry helper", () => {
    const routeSource = readAppFile("app/(public)/skills/[skillId]/page.tsx");

    expect(routeSource).toContain('from "@/src/features/public/publicSkillDetailRouteEntry"');
    expect(routeSource).not.toContain("loadInitialSkillDetailPageData");
    expect(routeSource).not.toContain("PublicSkillInteractiveDetail");
    expect(routeSource).not.toContain("next/headers");
  });
});
