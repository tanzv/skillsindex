import { MarketplaceQueryParams, PublicMarketplaceResponse, SessionUser, fetchPublicMarketplace } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import { buildMarketplaceFallback } from "./MarketplaceHomePage.fallback";

export type PrototypeDataMode = "prototype" | "live";

export interface MarketplaceFallbackResult {
  payload: PublicMarketplaceResponse;
  degraded: boolean;
  errorMessage: string;
}

export interface MarketplaceFallbackOptions {
  query: MarketplaceQueryParams;
  locale: AppLocale;
  sessionUser: SessionUser | null;
  mode: PrototypeDataMode;
  prototypeDelayMs?: number;
}

export function resolvePrototypeDataMode(rawMode: string | undefined): PrototypeDataMode {
  const normalized = String(rawMode || "").trim().toLowerCase();
  return normalized === "live" ? "live" : "prototype";
}

function normalizeDelay(delayMs: number | undefined): number {
  if (!Number.isFinite(delayMs)) {
    return 0;
  }
  return Math.max(0, Math.floor(Number(delayMs)));
}

async function waitForDelay(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return;
  }
  await new Promise<void>((resolve) => {
    globalThis.setTimeout(() => resolve(), delayMs);
  });
}

export async function loadMarketplaceWithFallback(options: MarketplaceFallbackOptions): Promise<MarketplaceFallbackResult> {
  const fallbackPayload = buildMarketplaceFallback(options.query, options.locale, options.sessionUser);
  if (options.mode === "prototype") {
    const delayMs = normalizeDelay(options.prototypeDelayMs);
    await waitForDelay(delayMs);
    return {
      payload: fallbackPayload,
      degraded: false,
      errorMessage: ""
    };
  }

  try {
    const payload = await fetchPublicMarketplace(options.query);
    return {
      payload,
      degraded: false,
      errorMessage: ""
    };
  } catch (error) {
    return {
      payload: fallbackPayload,
      degraded: true,
      errorMessage: error instanceof Error ? error.message : "Request failed"
    };
  }
}
