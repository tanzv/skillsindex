import { headers } from "next/headers";

import { PublicCategoryPage } from "../../../src/features/public/PublicCategoryPage";
import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";
import { fetchMarketplace } from "@/src/lib/api/public";

interface CategoriesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const semanticQuery = typeof resolvedSearchParams.tags === "string" ? resolvedSearchParams.tags : "";
  let marketplace = buildPublicMarketplaceFallback(resolvedSearchParams);

  try {
    const requestHeaders = new Headers(await headers());
    marketplace = await fetchMarketplace(requestHeaders, resolvedSearchParams);
  } catch {}

  return <PublicCategoryPage marketplace={marketplace} query={query} semanticQuery={semanticQuery} />;
}
