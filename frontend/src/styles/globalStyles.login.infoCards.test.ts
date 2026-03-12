import { describe, expect, it } from "vitest";
import { globalLoginStylesInfoCards } from "./globalStyles.login.infoCards";

describe("globalLoginStylesInfoCards", () => {
  it("uses compact guidance surfaces for login info points", () => {
    expect(globalLoginStylesInfoCards).toContain(".login-info-copy-group::before");
    expect(globalLoginStylesInfoCards).toContain("grid-template-columns: 34px minmax(0, 1fr)");
    expect(globalLoginStylesInfoCards).toContain("border-radius: 18px");
    expect(globalLoginStylesInfoCards).toContain("text-wrap: balance");
  });
});
