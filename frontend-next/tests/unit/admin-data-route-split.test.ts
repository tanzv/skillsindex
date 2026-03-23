import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("admin data route split", () => {
  it("keeps renderAdminRoute focused on render-target dispatch and delegates server data pages to the dedicated helper", () => {
    const source = readSourceFile("src/features/admin/renderAdminRoute.tsx");

    expect(source).toContain('from "./renderAdminDataRoute"');
    expect(source).not.toContain('from "@/src/lib/api/admin"');
    expect(source).not.toContain('from "@/src/lib/i18n/protectedMessages.server"');
    expect(source).not.toContain('from "@/src/lib/routing/adminRoutePageMeta"');
    expect(source).not.toContain('from "next/headers"');
  });
});
