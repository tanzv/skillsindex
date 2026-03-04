import { describe, expect, it } from "vitest";
import { buildPathWithThemeMode, resolveThemeMode } from "./themeModePath";

describe("resolveThemeMode", () => {
  it("resolves dark mode for default and mobile paths", () => {
    expect(resolveThemeMode("/")).toBe("dark");
    expect(resolveThemeMode("/results")).toBe("dark");
    expect(resolveThemeMode("/mobile/compare")).toBe("dark");
  });

  it("resolves light mode for light-prefixed paths", () => {
    expect(resolveThemeMode("/light")).toBe("light");
    expect(resolveThemeMode("/light/docs")).toBe("light");
    expect(resolveThemeMode("/mobile/light/skills/12")).toBe("light");
  });
});

describe("buildPathWithThemeMode", () => {
  it("switches desktop dark path to light while preserving query/hash", () => {
    const output = buildPathWithThemeMode("/results", "light", "?q=repo&page=2", "#top");
    expect(output).toBe("/light/results?q=repo&page=2#top");
  });

  it("switches desktop light path to dark while preserving query/hash", () => {
    const output = buildPathWithThemeMode("/light/results", "dark", "q=repo&page=2", "top");
    expect(output).toBe("/results?q=repo&page=2#top");
  });

  it("switches mobile dark path to light while preserving route core", () => {
    const output = buildPathWithThemeMode("/mobile/docs", "light");
    expect(output).toBe("/mobile/light/docs");
  });

  it("switches mobile light path to dark while preserving route core", () => {
    const output = buildPathWithThemeMode("/mobile/light/compare", "dark", "?left=1&right=2");
    expect(output).toBe("/mobile/compare?left=1&right=2");
  });

  it("switches root between light and dark prefixes", () => {
    expect(buildPathWithThemeMode("/", "light")).toBe("/light");
    expect(buildPathWithThemeMode("/light", "dark")).toBe("/");
    expect(buildPathWithThemeMode("/mobile", "light")).toBe("/mobile/light");
    expect(buildPathWithThemeMode("/mobile/light", "dark")).toBe("/mobile");
  });
});
