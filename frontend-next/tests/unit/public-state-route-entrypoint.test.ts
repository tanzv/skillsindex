import { describe, expect, it } from "vitest";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

describe("public state route entrypoint", () => {
  it("routes state prototype pages through the shared state route helper", () => {
    const stateRoute = expectRouteEntrypoint("app/(public)/states/[state]/page.tsx", {
      requiredSnippets: ['from "@/src/features/public/publicStateRouteEntry"'],
      forbiddenSnippets: ['from "next/navigation"', 'import { PublicStatePage }', "allowedStates"]
    });

    expect(stateRoute).toContain("renderPublicStateRoute");
  });
});
