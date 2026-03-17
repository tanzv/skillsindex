import { describe, expect, it } from "vitest";
import { globalLoginStylesInfoCards } from "./globalStyles.login.infoCards";

describe("globalLoginStylesInfoCards", () => {
  it("uses compact guidance surfaces with subtle scene highlights", () => {
    expect(globalLoginStylesInfoCards).toContain(".login-info-glass-card::before");
    expect(globalLoginStylesInfoCards).toContain(".login-info-copy-group::before");
    expect(globalLoginStylesInfoCards).toContain("backdrop-filter: blur(18px)");
    expect(globalLoginStylesInfoCards).toContain("grid-template-columns: 34px minmax(0, 1fr)");
    expect(globalLoginStylesInfoCards).toContain("border-radius: 18px");
    expect(globalLoginStylesInfoCards).toContain(".login-info-points li::before");
    expect(globalLoginStylesInfoCards).toContain("text-wrap: balance");
  });
});
