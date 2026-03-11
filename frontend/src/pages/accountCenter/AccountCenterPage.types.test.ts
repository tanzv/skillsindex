import { describe, expect, it } from "vitest";

import { accountRouteBySection, accountSectionByRoute } from "./AccountCenterPage.types";

describe("AccountCenterPage route map", () => {
  it("maps route to section and section back to route", () => {
    expect(accountSectionByRoute["/account/profile"]).toBe("profile");
    expect(accountSectionByRoute["/account/security"]).toBe("security");
    expect(accountSectionByRoute["/account/sessions"]).toBe("sessions");
    expect(accountSectionByRoute["/account/api-credentials"]).toBe("credentials");

    expect(accountRouteBySection.profile).toBe("/account/profile");
    expect(accountRouteBySection.security).toBe("/account/security");
    expect(accountRouteBySection.sessions).toBe("/account/sessions");
    expect(accountRouteBySection.credentials).toBe("/account/api-credentials");
  });
});
