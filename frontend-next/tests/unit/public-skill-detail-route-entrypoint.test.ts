import { describe, expect, it } from "vitest";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

describe("public skill detail route entrypoint", () => {
  it("routes skill detail pages through the shared route entry helper", () => {
    const routeSource = expectRouteEntrypoint("app/(public)/skills/[skillId]/page.tsx", {
      requiredSnippets: ['from "@/src/features/public/publicSkillDetailRouteEntry"'],
      forbiddenSnippets: ["loadInitialSkillDetailPageData", "PublicSkillInteractiveDetail", "next/headers"]
    });

    expect(routeSource).toContain("renderPublicSkillDetailRoute");
  });
});
