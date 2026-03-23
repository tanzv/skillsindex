import { headers } from "next/headers";

import { fetchMarketplace } from "@/src/lib/api/public";
import { reportPublicFallbackError } from "@/src/lib/api/publicFallbackLogging";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { resolvePublicLoadErrorMessage, type PublicLoadFailure } from "./publicLoadFailure";

interface LoadPublicMarketplaceRouteInput {
  requestQuery?: Record<string, string>;
  fallbackScope: string;
  fallbackContext?: Record<string, string | number | boolean | null | undefined>;
}

interface PublicMarketplaceRouteLoadSuccess {
  ok: true;
  marketplace: PublicMarketplaceResponse;
}

export type PublicMarketplaceRouteLoadResult = PublicMarketplaceRouteLoadSuccess | PublicLoadFailure;

export async function loadPublicMarketplaceRoute({
  requestQuery,
  fallbackScope,
  fallbackContext = {}
}: LoadPublicMarketplaceRouteInput): Promise<PublicMarketplaceRouteLoadResult> {
  try {
    const requestHeaders = new Headers(await headers());
    const marketplace = await fetchMarketplace(requestHeaders, requestQuery);

    return {
      ok: true,
      marketplace
    };
  } catch (error) {
    reportPublicFallbackError(fallbackScope, error, fallbackContext);

    return {
      ok: false,
      errorMessage: resolvePublicLoadErrorMessage(error, "Failed to load marketplace data.")
    };
  }
}
