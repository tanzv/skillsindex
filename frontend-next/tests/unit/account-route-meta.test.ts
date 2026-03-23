import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  accountRouteBySection,
  accountSectionByRoute,
  buildAccountQuickActions,
  listAccountSectionEntries,
  resolveAccountSectionLabel,
  resolveAccountSectionRouteHint,
  resolveAccountRouteActions,
  resolveAccountRouteMeta,
  resolveAccountRouteSignal
} from "@/src/lib/routing/accountRouteMeta";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

const accountMessages = createProtectedPageTestMessages({
  accountCenter: {
    routeProfileKicker: "Profile",
    routeProfileDescription: "Profile description",
    routeSecurityKicker: "Security",
    routeSecurityDescription: "Security description",
    routeSessionsKicker: "Sessions",
    routeSessionsDescription: "Sessions description",
    routeCredentialsKicker: "Credentials",
    routeCredentialsDescription: "Credentials description",
    routeActionOpenMarketplace: "Open Marketplace",
    routeActionOpenAdmin: "Open Admin",
    routeActionReviewSessions: "Review Sessions",
    routeActionOpenSecurity: "Open Security",
    routeActionOpenProfile: "Open Profile",
    sectionProfile: "Profile",
    sectionSecurity: "Security",
    sectionSessions: "Sessions",
    sectionCredentials: "Credentials",
    routeHintProfile: "Profile lane",
    routeHintSecurity: "Security lane",
    routeHintSessions: "Sessions lane",
    routeHintCredentials: "Credentials lane",
    quickActionMarketplace: "Open Marketplace",
    quickActionAdmin: "Open Admin",
    quickActionSessions: "Sessions",
    quickActionApiCredentials: "API Credentials",
    routeSignalProfile: "Profile signal",
    routeSignalSecurity: "Security signal",
    routeSignalSessions: "Sessions signal",
    routeSignalCredentials: "Credentials signal"
  }
}).accountCenter;

function readSourceFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("account route meta", () => {
  it("maps account routes and sections from a shared routing contract", () => {
    expect(accountSectionByRoute["/account/security"]).toBe("security");
    expect(accountRouteBySection.credentials).toBe("/account/api-credentials");
    expect(listAccountSectionEntries()).toEqual([
      { section: "profile", route: "/account/profile" },
      { section: "security", route: "/account/security" },
      { section: "sessions", route: "/account/sessions" },
      { section: "credentials", route: "/account/api-credentials" }
    ]);
  });

  it("resolves account route hero copy and actions from shared routing helpers", () => {
    expect(resolveAccountRouteMeta("/account/profile", accountMessages)).toEqual({
      kicker: "Profile",
      description: "Profile description"
    });
    expect(resolveAccountRouteActions("/account/sessions", accountMessages)).toEqual([
      { href: "/account/security", label: "Open Security" },
      { href: "/admin/overview", label: "Open Admin" }
    ]);
    expect(resolveAccountRouteSignal("/account/api-credentials", accountMessages)).toBe("Credentials signal");
    expect(resolveAccountSectionLabel("security", accountMessages)).toBe("Security");
    expect(resolveAccountSectionRouteHint("sessions", accountMessages)).toBe("Sessions lane");
    expect(buildAccountQuickActions(accountMessages)).toEqual([
      { href: "/", label: "Open Marketplace" },
      { href: "/admin/overview", label: "Open Admin" },
      { href: "/account/sessions", label: "Sessions" },
      { href: "/account/api-credentials", label: "API Credentials" }
    ]);
  });

  it("keeps account route meta centralized in descriptor-based resolvers instead of route switches", () => {
    const source = readSourceFile("src/lib/routing/accountRouteMeta.ts");

    expect(source).toContain("accountRouteDescriptors");
    expect(source).not.toContain("switch (route)");
  });
});
