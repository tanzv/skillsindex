import { headers } from "next/headers";

import { PublicCategoryPage } from "../../../../src/features/public/PublicCategoryPage";
import { buildCategoryDetailMarketplaceRequestQuery } from "@/src/features/public/marketplace/marketplaceRequestQuery";
import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";
import { fetchMarketplace } from "@/src/lib/api/public";

interface CategoryDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const semanticQuery = typeof resolvedSearchParams.tags === "string" ? resolvedSearchParams.tags : "";
  const activeSubcategory = typeof resolvedSearchParams.subcategory === "string" ? resolvedSearchParams.subcategory : "";
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "relevance";
  const mode = typeof resolvedSearchParams.mode === "string" ? resolvedSearchParams.mode : "hybrid";
  const requestQuery = buildCategoryDetailMarketplaceRequestQuery(slug, resolvedSearchParams);
  let marketplace = buildPublicMarketplaceFallback(requestQuery);

  try {
    const requestHeaders = new Headers(await headers());
    marketplace = await fetchMarketplace(requestHeaders, requestQuery);
  } catch {}

  return (
    <PublicCategoryPage
      marketplace={marketplace}
      activeCategory={slug}
      activeSubcategory={activeSubcategory}
      query={query}
      semanticQuery={semanticQuery}
      sort={sort}
      mode={mode}
    />
  );
}
