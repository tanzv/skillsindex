import { describe, expect, it } from "vitest";

import { formatProtectedSessionRole, protectedTopbarMessageFallbacks } from "@/src/lib/i18n/protectedMessages";

describe("protected messages", () => {
  it("formats the super admin session role without falling back to unknown", () => {
    expect(formatProtectedSessionRole("super_admin", protectedTopbarMessageFallbacks)).toBe("super admin");
  });
});
