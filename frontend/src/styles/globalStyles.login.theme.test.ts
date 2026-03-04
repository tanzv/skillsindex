import { describe, expect, it } from "vitest";
import { globalLoginStylesTheme } from "./globalStyles.login.theme";

describe("globalLoginStylesTheme", () => {
  it("maps login palette to shared theme tokens", () => {
    expect(globalLoginStylesTheme).toContain("var(--si-color-canvas");
    expect(globalLoginStylesTheme).toContain("var(--si-color-surface");
    expect(globalLoginStylesTheme).toContain("var(--si-color-accent");
    expect(globalLoginStylesTheme).toContain("var(--si-color-accent-contrast");
  });

  it("includes topbar theme switch styles", () => {
    expect(globalLoginStylesTheme).toContain(".auth-topbar-theme-switch");
    expect(globalLoginStylesTheme).toContain(".is-theme-toggle");
  });
});
