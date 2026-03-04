import { describe, expect, it } from "vitest";
import { loginPageCopy } from "./LoginPage.copy";

const deprecatedKeys = [
  "nav",
  "discovery",
  "discoveryValue",
  "operations",
  "operationsValue",
  "security",
  "securityValue",
  "badgeEnterprise",
  "badgeWorkflow",
  "quote",
  "quoteMeta",
  "trustPermission",
  "trustAudit",
  "trustIntranet"
] as const;

describe("loginPageCopy", () => {
  it("keeps login info copy minimal without decorative business metrics", () => {
    for (const localeEntry of [loginPageCopy.en, loginPageCopy.zh]) {
      for (const key of deprecatedKeys) {
        expect(Object.prototype.hasOwnProperty.call(localeEntry, key)).toBe(false);
      }
    }
  });
});
