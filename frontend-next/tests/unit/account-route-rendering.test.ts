import { isValidElement } from "react";
import { describe, expect, it } from "vitest";

import { renderAccountRoute } from "@/src/features/accountCenter/renderAccountRoute";

describe("account route rendering", () => {
  it("routes account paths through the shared account center feature", async () => {
    const profilePage = await renderAccountRoute("/account/profile");
    const securityPage = await renderAccountRoute("/account/security");

    expect(isValidElement(profilePage)).toBe(true);
    expect(profilePage.props.route).toBe("/account/profile");

    expect(isValidElement(securityPage)).toBe(true);
    expect(securityPage.props.route).toBe("/account/security");
  });
});
