import { MarketplaceText } from "../marketplacePublic/marketplaceText";

export type MarketplaceHomeMode = "prototype" | "live";

export interface HomeChipFilter {
  id: string;
  label: string;
  queryTags: string;
}

export interface MarketplaceAutoLoadConfig {
  armDistancePx: number;
  triggerDistancePx: number;
  bottomHoldDelayMs: number;
  minimumLoadingDurationMs: number;
  successResetDelayMs: number;
  prototypeDataDelayMs: number;
}

export const canvasWidth = 1440;
export const darkCanvasHeight = 1776;
export const lightCanvasHeight = 1940;
export const statsTrendBars = [25, 30, 38, 46, 62, 84, 120];
export const statsTrendYAxis = ["6k", "4k", "2k", "0"];
export const statsTrendXAxis = ["M", "T", "W", "T", "F", "S", "S"];

export const defaultMarketplaceAutoLoadConfig: MarketplaceAutoLoadConfig = {
  armDistancePx: 320,
  triggerDistancePx: 180,
  bottomHoldDelayMs: 0,
  minimumLoadingDurationMs: 120,
  successResetDelayMs: 680,
  prototypeDataDelayMs: 260
};

function parseClampedInteger(value: unknown, fallback: number, minValue: number, maxValue: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(maxValue, Math.max(minValue, Math.round(parsed)));
}

export function resolveMarketplaceAutoLoadConfig(rawEnv: Record<string, unknown>): MarketplaceAutoLoadConfig {
  return {
    armDistancePx: parseClampedInteger(
      rawEnv.VITE_MARKETPLACE_AUTOLOAD_ARM_DISTANCE_PX,
      defaultMarketplaceAutoLoadConfig.armDistancePx,
      80,
      800
    ),
    triggerDistancePx: parseClampedInteger(
      rawEnv.VITE_MARKETPLACE_AUTOLOAD_TRIGGER_DISTANCE_PX,
      defaultMarketplaceAutoLoadConfig.triggerDistancePx,
      8,
      560
    ),
    bottomHoldDelayMs: parseClampedInteger(
      rawEnv.VITE_MARKETPLACE_AUTOLOAD_HOLD_DELAY_MS,
      defaultMarketplaceAutoLoadConfig.bottomHoldDelayMs,
      0,
      1200
    ),
    minimumLoadingDurationMs: parseClampedInteger(
      rawEnv.VITE_MARKETPLACE_AUTOLOAD_MIN_LOADING_MS,
      defaultMarketplaceAutoLoadConfig.minimumLoadingDurationMs,
      0,
      2000
    ),
    successResetDelayMs: parseClampedInteger(
      rawEnv.VITE_MARKETPLACE_AUTOLOAD_SUCCESS_RESET_MS,
      defaultMarketplaceAutoLoadConfig.successResetDelayMs,
      160,
      2600
    ),
    prototypeDataDelayMs: parseClampedInteger(
      rawEnv.VITE_MARKETPLACE_PROTOTYPE_FETCH_DELAY_MS,
      defaultMarketplaceAutoLoadConfig.prototypeDataDelayMs,
      0,
      2600
    )
  };
}

export function resolveMarketplaceHomeMode(rawMode: string | undefined): MarketplaceHomeMode {
  const normalized = String(rawMode || "").trim().toLowerCase();
  return normalized === "live" ? "live" : "prototype";
}

export function buildHomeChipFilters(text: MarketplaceText): HomeChipFilter[] {
  return [
    {
      id: "hot-automation",
      label: text.hotAutomation,
      queryTags: "automation testing"
    },
    {
      id: "hot-repository",
      label: text.hotRepository,
      queryTags: "repository sync"
    },
    {
      id: "hot-release",
      label: text.hotRelease,
      queryTags: "release pipeline"
    }
  ];
}
