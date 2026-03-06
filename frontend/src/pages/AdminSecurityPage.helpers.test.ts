import { describe, expect, it } from "vitest";

import { statusColorStyle } from "./AdminSecurityPage.helpers";

describe("AdminSecurityPage helpers", () => {
  it("maps active-like status values to success semantic tokens", () => {
    expect(statusColorStyle("active")).toEqual({
      color: "var(--si-color-success-text)",
      background: "color-mix(in srgb, var(--si-color-success-bg) 82%, transparent)"
    });
  });

  it("maps warning-like status values to warning semantic tokens", () => {
    expect(statusColorStyle("pending")).toEqual({
      color: "var(--si-color-warning-text)",
      background: "color-mix(in srgb, var(--si-color-warning-bg) 78%, transparent)"
    });
  });

  it("maps other status values to danger semantic tokens", () => {
    expect(statusColorStyle("revoked")).toEqual({
      color: "var(--si-color-danger-text)",
      background: "color-mix(in srgb, var(--si-color-danger-bg) 78%, transparent)"
    });
  });
});
