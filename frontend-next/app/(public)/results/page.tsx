import { headers } from "next/headers";

import { PublicSearchPage } from "@/src/features/public/PublicSearchPage";
import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";
import { fetchMarketplace } from "@/src/lib/api/public";

interface ResultsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const semanticQuery = typeof resolvedSearchParams.tags === "string" ? resolvedSearchParams.tags : "";
  let marketplace = buildPublicMarketplaceFallback(resolvedSearchParams);

  try {
    const requestHeaders = new Headers(await headers());
    marketplace = await fetchMarketplace(requestHeaders, resolvedSearchParams);
  } catch {}

  return (
    <PublicSearchPage
      marketplace={marketplace}
      query={query}
      semanticQuery={semanticQuery}
      formAction="/results"
    />
  );
}
