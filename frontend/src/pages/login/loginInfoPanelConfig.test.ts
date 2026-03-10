import { describe, expect, it } from "vitest";
import {
  buildLoginInfoPanelConfig,
  LoginInfoPanelCopy,
  resolveLoginInfoPanelConfigOverride
} from "./loginInfoPanelConfig";

const baseCopy: LoginInfoPanelCopy = {
  kicker: "Enterprise Intranet",
  title: "Internal Skills Platform",
  lead: "Secure access."
};

describe("buildLoginInfoPanelConfig", () => {
  it("maps copy into a concise panel config", () => {
    const config = buildLoginInfoPanelConfig(baseCopy);

    expect(config.kicker).toBe(baseCopy.kicker);
    expect(config.title).toBe(baseCopy.title);
    expect(config.lead).toBe(baseCopy.lead);
    expect(config.keyPoints).toEqual([]);
  });
});

describe("resolveLoginInfoPanelConfigOverride", () => {
  it("returns undefined when there are no runtime or query overrides", () => {
    const resolvedConfig = resolveLoginInfoPanelConfigOverride({
      locale: "en",
      fallback: baseCopy
    });

    expect(resolvedConfig).toBeUndefined();
  });

  it("applies runtime shared fields when provided", () => {
    const resolvedConfig = resolveLoginInfoPanelConfigOverride({
      locale: "en",
      fallback: baseCopy,
      runtimeConfig: {
        title: "Configured runtime title"
      }
    });

    expect(resolvedConfig).toEqual({
      kicker: baseCopy.kicker,
      title: "Configured runtime title",
      lead: baseCopy.lead,
      keyPoints: []
    });
  });

  it("prefers locale-specific runtime fields over default fields", () => {
    const resolvedConfig = resolveLoginInfoPanelConfigOverride({
      locale: "zh",
      fallback: baseCopy,
      runtimeConfig: {
        default: {
          title: "Default runtime title"
        },
        zh: {
          title: "Chinese runtime title"
        }
      }
    });

    expect(resolvedConfig?.title).toBe("Chinese runtime title");
  });

  it("prefers query overrides over runtime overrides", () => {
    const resolvedConfig = resolveLoginInfoPanelConfigOverride({
      locale: "en",
      fallback: baseCopy,
      search: "?loginTitle=Query+Title",
      runtimeConfig: {
        title: "Runtime title"
      }
    });

    expect(resolvedConfig?.title).toBe("Query Title");
  });

  it("supports locale-specific query keys", () => {
    const resolvedConfig = resolveLoginInfoPanelConfigOverride({
      locale: "zh",
      fallback: baseCopy,
      search: "?loginTitle=General+Title&loginTitleZh=Chinese+Title"
    });

    expect(resolvedConfig?.title).toBe("Chinese Title");
  });

  it("supports hero image override from query and runtime config", () => {
    const resolvedConfig = resolveLoginInfoPanelConfigOverride({
      locale: "en",
      fallback: baseCopy,
      search: "?loginHeroImageSrc=/brand/query-promo.svg",
      runtimeConfig: {
        heroImageSrc: "/brand/runtime-promo.svg"
      }
    });

    expect(resolvedConfig?.heroImageSrc).toBe("/brand/query-promo.svg");
  });

  it("ignores blocked protocol for hero image override", () => {
    const resolvedConfig = resolveLoginInfoPanelConfigOverride({
      locale: "en",
      fallback: baseCopy,
      search: "?loginHeroImageSrc=javascript:alert(1)"
    });

    expect(resolvedConfig).toBeUndefined();
  });

  it("ignores blank override values and falls back to default copy", () => {
    const resolvedConfig = resolveLoginInfoPanelConfigOverride({
      locale: "en",
      fallback: baseCopy,
      search: "?loginLead=%20%20",
      runtimeConfig: {
        lead: "   "
      }
    });

    expect(resolvedConfig).toBeUndefined();
  });
});
