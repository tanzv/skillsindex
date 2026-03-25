import { describe, expect, it } from "vitest";

import { createInitialMockState } from "@/scripts/mock-backend-data.mjs";

const supportedUserRoles = new Set(["super_admin", "admin", "member", "viewer"]);

describe("mock backend data", () => {
  it("keeps account and organization member user roles aligned with supported assignable roles", () => {
    const state = createInitialMockState();

    const accountRoles = state.accounts.items.map((item) => item.role);
    const organizationUserRoles = Object.values(state.organizationMembers)
      .flatMap((items) => items.map((item) => item.user_role));

    expect(accountRoles.every((role) => supportedUserRoles.has(role))).toBe(true);
    expect(organizationUserRoles.every((role) => supportedUserRoles.has(role))).toBe(true);
  });
});
