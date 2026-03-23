import "server-only";

import { headers } from "next/headers";

import { fetchMarketplace } from "@/src/lib/api/public";
import { reportPublicFallbackError } from "@/src/lib/api/publicFallbackLogging";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { buildPublicSnapshotMarketplaceRequestQuery, type MarketplaceRouteSearchParams } from "./marketplace/marketplaceRequestQuery";
import { resolvePublicLoadErrorMessage, type PublicLoadFailure } from "./publicLoadFailure";

export type PublicSnapshotSearchParams = MarketplaceRouteSearchParams;

interface PublicMarketplaceSnapshotLoadSuccess {
  ok: true;
  marketplace: PublicMarketplaceResponse;
}

export type PublicMarketplaceSnapshotLoadResult = PublicMarketplaceSnapshotLoadSuccess | PublicLoadFailure;

export async function loadPublicMarketplaceSnapshot(
  requestHeaders: Headers,
  searchParams?: PublicSnapshotSearchParams
): Promise<PublicMarketplaceSnapshotLoadResult> {
  const requestQuery = buildPublicSnapshotMarketplaceRequestQuery(searchParams || {});
  try {
    const marketplace = await fetchMarketplace(requestHeaders, requestQuery);

    return {
      ok: true,
      marketplace
    };
  } catch (error) {
    reportPublicFallbackError("public-snapshot-marketplace", error, {
      route: "snapshot"
    });

    return {
      ok: false,
      errorMessage: resolvePublicLoadErrorMessage(error, "Failed to load marketplace snapshot.")
    };
  }
}

export async function loadPublicMarketplaceSnapshotFromRequest(
  searchParams?: Promise<PublicSnapshotSearchParams> | PublicSnapshotSearchParams
): Promise<PublicMarketplaceSnapshotLoadResult> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestHeaders = new Headers(await headers());

  return loadPublicMarketplaceSnapshot(requestHeaders, resolvedSearchParams);
}
