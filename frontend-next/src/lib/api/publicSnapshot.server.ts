import "server-only";

import { headers } from "next/headers";

import { buildPublicSnapshotMarketplaceRequestQuery } from "@/src/features/public/marketplace/marketplaceRequestQuery";
import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { fetchMarketplace } from "./public";

export type PublicSnapshotSearchParams = Record<string, string | string[] | undefined>;

export async function loadPublicMarketplaceSnapshot(
  requestHeaders: Headers,
  searchParams?: PublicSnapshotSearchParams
): Promise<PublicMarketplaceResponse> {
  const requestQuery = buildPublicSnapshotMarketplaceRequestQuery(searchParams || {});
  let marketplace = buildPublicMarketplaceFallback(requestQuery);

  try {
    marketplace = await fetchMarketplace(requestHeaders, requestQuery);
  } catch {}

  return marketplace;
}

export async function loadPublicMarketplaceSnapshotFromRequest(
  searchParams?: Promise<PublicSnapshotSearchParams> | PublicSnapshotSearchParams
): Promise<PublicMarketplaceResponse> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestHeaders = new Headers(await headers());

  return loadPublicMarketplaceSnapshot(requestHeaders, resolvedSearchParams);
}
