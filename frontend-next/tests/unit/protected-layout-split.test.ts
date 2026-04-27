import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("protected layout split", () => {
  it("keeps protected layouts on the shared layout context loader", () => {
    const workspaceLayout = readRepoFile("app/(workspace)/workspace/layout.tsx");
    const adminLayout = readRepoFile("app/(admin)/admin/layout.tsx");
    const accountLayout = readRepoFile("app/(account)/account/layout.tsx");

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
