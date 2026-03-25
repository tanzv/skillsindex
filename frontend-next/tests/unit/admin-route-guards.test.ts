import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("admin route guards", () => {
  it("keeps the shared admin layout free of hardcoded admin redirect targets", () => {
    const layoutSource = readSourceFile("app/(admin)/admin/layout.tsx");

    expect(layoutSource).toContain("requireSession: false");
    expect(layoutSource).not.toContain("scope: \"admin\"");
  });

  it("centralizes admin page guards in the shared route entry", () => {
    const routeEntrySource = readSourceFile("src/features/admin/adminRouteEntry.tsx");

    expect(routeEntrySource).toContain('import { guardAdminPageRoute } from "./guardAdminPageRoute";');
    expect(routeEntrySource).toContain("await guardAdminPageRoute(pathname);");
  });
});
