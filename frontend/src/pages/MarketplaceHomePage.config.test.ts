import { describe, expect, it } from "vitest";

import {
  defaultMarketplaceAutoLoadConfig,
  resolveMarketplaceAutoLoadConfig,
  resolveMarketplaceHomeMode
} from "./MarketplaceHomePage.config";

describe("resolveMarketplaceAutoLoadConfig", () => {
  it("returns prototype baseline values when env is missing", () => {
    const config = resolveMarketplaceAutoLoadConfig({});
    expect(config).toEqual(defaultMarketplaceAutoLoadConfig);
  });

  it("reads overridden env values within allowed ranges", () => {
    const config = resolveMarketplaceAutoLoadConfig({
      VITE_MARKETPLACE_AUTOLOAD_ARM_DISTANCE_PX: "300",
      VITE_MARKETPLACE_AUTOLOAD_TRIGGER_DISTANCE_PX: "20",
      VITE_MARKETPLACE_AUTOLOAD_HOLD_DELAY_MS: "260",
      VITE_MARKETPLACE_AUTOLOAD_MIN_LOADING_MS: "420",
      VITE_MARKETPLACE_AUTOLOAD_SUCCESS_RESET_MS: "900",
      VITE_MARKETPLACE_PROTOTYPE_FETCH_DELAY_MS: "380"
    });

    expect(config).toEqual({
      armDistancePx: 300,
      triggerDistancePx: 20,
      bottomHoldDelayMs: 260,
      minimumLoadingDurationMs: 420,
      successResetDelayMs: 900,
      prototypeDataDelayMs: 380
    });
  });

  it("clamps invalid env values to safe boundaries", () => {
    const config = resolveMarketplaceAutoLoadConfig({
      VITE_MARKETPLACE_AUTOLOAD_ARM_DISTANCE_PX: "-1",
      VITE_MARKETPLACE_AUTOLOAD_TRIGGER_DISTANCE_PX: "999",
      VITE_MARKETPLACE_AUTOLOAD_HOLD_DELAY_MS: "not-a-number",
      VITE_MARKETPLACE_AUTOLOAD_MIN_LOADING_MS: "-10",
      VITE_MARKETPLACE_AUTOLOAD_SUCCESS_RESET_MS: "999999",
      VITE_MARKETPLACE_PROTOTYPE_FETCH_DELAY_MS: "-500"
    });

    expect(config).toEqual({
      armDistancePx: 80,
      triggerDistancePx: 560,
      bottomHoldDelayMs: defaultMarketplaceAutoLoadConfig.bottomHoldDelayMs,
      minimumLoadingDurationMs: 0,
      successResetDelayMs: 2600,
      prototypeDataDelayMs: 0
    });
  });
});

describe("resolveMarketplaceHomeMode", () => {
  it("defaults to prototype mode when env is missing or invalid", () => {
    expect(resolveMarketplaceHomeMode(undefined)).toBe("prototype");
    expect(resolveMarketplaceHomeMode("")).toBe("prototype");
    expect(resolveMarketplaceHomeMode("unknown")).toBe("prototype");
  });

  it("supports explicit prototype mode", () => {
    expect(resolveMarketplaceHomeMode("prototype")).toBe("prototype");
    expect(resolveMarketplaceHomeMode(" PROTOTYPE ")).toBe("prototype");
  });

  it("supports explicit live mode", () => {
    expect(resolveMarketplaceHomeMode("live")).toBe("live");
    expect(resolveMarketplaceHomeMode(" LIVE ")).toBe("live");
  });
});
