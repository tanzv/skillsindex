import { describe, expect, it, vi } from "vitest";
import { applyThemeTokens, getThemeTokens, standardThemeTokens } from "./themeSystem";

describe("themeSystem", () => {
  it("returns token map for each mode", () => {
    expect(getThemeTokens("dark")).toEqual(standardThemeTokens.dark);
    expect(getThemeTokens("light")).toEqual(standardThemeTokens.light);
  });

  it("applies theme mode and variables to target element", () => {
    const setAttribute = vi.fn();
    const setProperty = vi.fn();
    const target = {
      setAttribute,
      style: {
        setProperty
      }
    } as unknown as HTMLElement;

    applyThemeTokens("light", target);

    expect(setAttribute).toHaveBeenCalledWith("data-theme-mode", "light");
    expect(setProperty).toHaveBeenCalledWith("--si-color-canvas", "#eef1f5");
    expect(setProperty).toHaveBeenCalledWith("--si-color-overlay-mask", "rgba(15, 23, 42, 0.34)");
    expect(setProperty).toHaveBeenCalledTimes(Object.keys(standardThemeTokens.light).length);
  });
});
