import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public state route entrypoint", () => {
  it("routes state prototype pages through the shared state route helper", () => {
    const stateRoute = readAppFile("app/(public)/states/[state]/page.tsx");

    expect(stateRoute).toContain('from "@/src/features/public/publicStateRouteEntry"');
    expect(stateRoute).not.toContain('from "next/navigation"');
    expect(stateRoute).not.toContain('import { PublicStatePage }');
    expect(stateRoute).not.toContain("allowedStates");
  });
});
