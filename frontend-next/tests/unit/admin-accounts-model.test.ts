import { describe, expect, it } from "vitest";

import { resolveRoleTargetUserId } from "@/src/features/adminAccounts/model";

describe("admin accounts model", () => {
  it("prefers an explicit role editor target over the selected account", () => {
    expect(resolveRoleTargetUserId("7", 2)).toBe(7);
  });

  it("falls back to the selected account when the role editor target is empty", () => {
    expect(resolveRoleTargetUserId("", 2)).toBe(2);
    expect(resolveRoleTargetUserId("   ", 2)).toBe(2);
  });

  it("rejects invalid role editor targets", () => {
    expect(resolveRoleTargetUserId("invalid", 2)).toBeNull();
    expect(resolveRoleTargetUserId("0", 2)).toBeNull();
  });
});
