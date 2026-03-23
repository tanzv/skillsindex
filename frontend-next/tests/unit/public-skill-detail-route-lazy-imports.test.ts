import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("public skill detail route lazy imports", () => {
  it("lazy-loads the interactive detail page from the shared route helper", () => {
    const routeEntrySource = readSourceFile("src/features/public/publicSkillDetailRouteEntry.tsx");

    expect(routeEntrySource).toContain('await import("./PublicSkillInteractiveDetail")');
    expect(routeEntrySource).not.toContain('import { PublicSkillInteractiveDetail } from "./PublicSkillInteractiveDetail";');
  });
});
