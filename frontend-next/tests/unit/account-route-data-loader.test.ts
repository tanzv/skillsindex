import { describe, expect, it, vi } from "vitest";

import {
  hasRequiredAccountRouteData,
  loadAccountRouteData,
  resolveAccountRouteDataRequirements
} from "@/src/features/accountCenter/accountRouteDataLoader";
import {
  accountAPIKeysBFFEndpoint,
  accountProfileBFFEndpoint,
  accountSessionsBFFEndpoint
} from "@/src/lib/routing/protectedSurfaceEndpoints";
import { readFileSync } from "node:fs";
import path from "node:path";

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("account route data loader", () => {
  it("loads only the data required by each account route", async () => {
    const fetchJSON = vi.fn(async (input: string) => ({ input }));

    await loadAccountRouteData("/account/profile", fetchJSON);
    await loadAccountRouteData("/account/security", fetchJSON);
    await loadAccountRouteData("/account/sessions", fetchJSON);
    await loadAccountRouteData("/account/api-credentials", fetchJSON);

    expect(fetchJSON.mock.calls.map(([input]) => input)).toEqual([
      accountProfileBFFEndpoint,
      accountProfileBFFEndpoint,
      accountSessionsBFFEndpoint,
      accountProfileBFFEndpoint,
      accountSessionsBFFEndpoint,
      accountProfileBFFEndpoint,
      accountAPIKeysBFFEndpoint
    ]);
  });

  it("reports the required payloads per account route", () => {
    expect(resolveAccountRouteDataRequirements("/account/profile")).toEqual({
      profile: true,
      sessions: false,
      credentials: false
    });
    expect(resolveAccountRouteDataRequirements("/account/security")).toEqual({
      profile: true,
      sessions: true,
      credentials: false
    });
    expect(resolveAccountRouteDataRequirements("/account/api-credentials")).toEqual({
      profile: true,
      sessions: false,
      credentials: true
    });
  });

  it("marks account route data as ready only when the route requirements are present", () => {
    const baseSnapshot = {
      profilePayload: { user: {} } as never,
      sessionsPayload: null,
      credentialsPayload: null
    };

    expect(hasRequiredAccountRouteData("/account/profile", baseSnapshot)).toBe(true);
    expect(hasRequiredAccountRouteData("/account/security", baseSnapshot)).toBe(false);
    expect(hasRequiredAccountRouteData("/account/api-credentials", baseSnapshot)).toBe(false);
    expect(
      hasRequiredAccountRouteData("/account/security", {
        ...baseSnapshot,
        sessionsPayload: { total: 1 } as never
      })
    ).toBe(true);
    expect(
      hasRequiredAccountRouteData("/account/api-credentials", {
        ...baseSnapshot,
        credentialsPayload: { total: 1 } as never
      })
    ).toBe(true);
  });

  it("keeps account route data requirements delegated to the shared account route contract", () => {
    const source = readRepoFile("src/features/accountCenter/accountRouteDataLoader.ts");

    expect(source).toContain('from "@/src/lib/routing/accountRouteMeta"');
    expect(source).not.toContain("route === accountSecurityRoute");
    expect(source).not.toContain("route === accountSessionsRoute");
    expect(source).not.toContain("route === accountApiCredentialsRoute");
  });
});
