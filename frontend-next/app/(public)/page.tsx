import { headers } from "next/headers";

import { PublicLanding } from "@/src/features/public/PublicLanding";
import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";
import { fetchMarketplace } from "@/src/lib/api/public";

export default async function PublicLandingPage() {
  let marketplace = buildPublicMarketplaceFallback();

  try {
    const requestHeaders = new Headers(await headers());
    marketplace = await fetchMarketplace(requestHeaders);
  } catch {}

  return <PublicLanding marketplace={marketplace} />;
}
