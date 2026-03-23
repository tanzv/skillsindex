import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("protected layout split", () => {
  it("keeps protected layouts on the shared layout context loader", () => {
    const workspaceLayout = readAppFile("app/(workspace)/workspace/layout.tsx");
    const adminLayout = readAppFile("app/(admin)/admin/layout.tsx");
    const accountLayout = readAppFile("app/(account)/account/layout.tsx");

    for (const layoutSource of [workspaceLayout, adminLayout, accountLayout]) {
      expect(layoutSource).toContain('from "@/src/features/protected/loadProtectedLayoutContext"');
      expect(layoutSource).not.toContain('from "@/src/lib/auth/guards"');
      expect(layoutSource).not.toContain('from "@/src/lib/auth/session"');
      expect(layoutSource).not.toContain('from "@/src/lib/i18n/protectedMessages.server"');
      expect(layoutSource).not.toContain('from "@/src/lib/i18n/protectedPageMessages.server"');
      expect(layoutSource).not.toContain('from "@/src/lib/i18n/serverLocale"');
    }
  });
});
