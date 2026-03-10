import { describe, expect, it } from "vitest";
import { resolveLoginThemeMode } from "./loginThemeMode";

describe("resolveLoginThemeMode", () => {
  it("returns explicit mode when provided", () => {
    expect(resolveLoginThemeMode("/login", "light")).toBe("light");
    expect(resolveLoginThemeMode("/light/login", "dark")).toBe("dark");
  });

  it("returns light mode for light login routes", () => {
    expect(resolveLoginThemeMode("/light/login")).toBe("light");
    expect(resolveLoginThemeMode("/mobile/light/login")).toBe("light");
  });

  it("returns dark mode for default login route", () => {
    expect(resolveLoginThemeMode("/login")).toBe("dark");
    expect(resolveLoginThemeMode("/mobile/login")).toBe("dark");
  });
});
