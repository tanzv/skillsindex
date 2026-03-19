import { describe, expect, it } from "vitest";

import {
  formatProtectedSessionRole,
  formatProtectedSessionStatus,
  protectedTopbarMessageFallbacks
} from "@/src/lib/i18n/protectedMessages";

describe("protected session message formatters", () => {
  it("maps known session roles to localized labels", () => {
    expect(formatProtectedSessionRole("admin", protectedTopbarMessageFallbacks)).toBe("admin");
    expect(formatProtectedSessionRole("owner", protectedTopbarMessageFallbacks)).toBe("owner");
    expect(formatProtectedSessionRole("member", protectedTopbarMessageFallbacks)).toBe("member");
  });

  it("maps known session statuses to localized labels", () => {
    expect(formatProtectedSessionStatus("active", protectedTopbarMessageFallbacks)).toBe("active");
    expect(formatProtectedSessionStatus("disabled", protectedTopbarMessageFallbacks)).toBe("disabled");
    expect(formatProtectedSessionStatus("visitor", protectedTopbarMessageFallbacks)).toBe("visitor");
  });

  it("falls back to localized unknown values for unmapped session values", () => {
    expect(formatProtectedSessionRole("operator", protectedTopbarMessageFallbacks)).toBe("unknown");
    expect(formatProtectedSessionStatus("pending", protectedTopbarMessageFallbacks)).toBe("unknown");
  });
});
