import { describe, expect, it } from "vitest";
import { resolveLoginBrandConfig } from "./loginBrandConfig";

describe("resolveLoginBrandConfig", () => {
  it("returns default config when no overrides are provided", () => {
    const config = resolveLoginBrandConfig({
      locale: "en"
    });

    expect(config).toEqual({
      logoSrc: "/brand/skillsindex-logo.svg",
      brandText: "SkillsIndex"
    });
  });

  it("applies runtime shared overrides", () => {
    const config = resolveLoginBrandConfig({
      locale: "en",
      runtimeConfig: {
        logoSrc: "/brand/runtime-logo.svg",
        brandText: "Runtime Brand"
      }
    });

    expect(config).toEqual({
      logoSrc: "/brand/runtime-logo.svg",
      brandText: "Runtime Brand"
    });
  });

  it("prefers locale-specific runtime override over default runtime override", () => {
    const config = resolveLoginBrandConfig({
      locale: "zh",
      runtimeConfig: {
        default: {
          brandText: "Default Brand"
        },
        zh: {
          brandText: "Chinese Brand"
        }
      }
    });

    expect(config.brandText).toBe("Chinese Brand");
  });

  it("prefers query override over runtime override", () => {
    const config = resolveLoginBrandConfig({
      locale: "en",
      search: "?loginBrandText=Query+Brand&loginLogoSrc=/brand/query-logo.svg",
      runtimeConfig: {
        brandText: "Runtime Brand",
        logoSrc: "/brand/runtime-logo.svg"
      }
    });

    expect(config).toEqual({
      logoSrc: "/brand/query-logo.svg",
      brandText: "Query Brand"
    });
  });

  it("supports locale-specific query keys", () => {
    const config = resolveLoginBrandConfig({
      locale: "zh",
      search: "?loginBrandText=General+Brand&loginBrandTextZh=Chinese+Brand"
    });

    expect(config.brandText).toBe("Chinese Brand");
  });

  it("falls back to defaults when logo source uses a blocked protocol", () => {
    const config = resolveLoginBrandConfig({
      locale: "en",
      search: "?loginLogoSrc=javascript:alert(1)"
    });

    expect(config.logoSrc).toBe("/brand/skillsindex-logo.svg");
  });
});
