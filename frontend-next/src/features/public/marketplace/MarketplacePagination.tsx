"use client";

import Link from "next/link";

interface MarketplacePaginationProps {
  basePath: string;
  currentPage: number;
  totalPages: number;
  prevPage: number;
  nextPage: number;
  summaryLabel: string;
  previousLabel: string;
  nextLabel: string;
  query?: Record<string, string | number | undefined>;
}

function buildMarketplacePaginationHref(
  basePath: string,
  query: Record<string, string | number | undefined>,
  page: number
): string {
  const params = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(query)) {
    const normalizedValue = String(rawValue || "").trim();
    if (!normalizedValue || key === "page") {
      continue;
    }

    params.set(key, normalizedValue);
  }

  if (page > 0) {
    params.set("page", String(page));
  }

  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

function MarketplacePaginationLink({
  href,
  label,
  disabled
}: {
  href: string;
  label: string;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <span className="marketplace-topbar-button is-subtle" aria-disabled="true">
        {label}
      </span>
    );
  }

  return (
    <Link href={href} className="marketplace-topbar-button">
      {label}
    </Link>
  );
}

export function MarketplacePagination({
  basePath,
  currentPage,
  totalPages,
  prevPage,
  nextPage,
  summaryLabel,
  previousLabel,
  nextLabel,
  query = {}
}: MarketplacePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="marketplace-pill-row" aria-label={summaryLabel} data-testid="marketplace-pagination">
      <MarketplacePaginationLink
        href={buildMarketplacePaginationHref(basePath, query, prevPage)}
        label={previousLabel}
        disabled={prevPage <= 0}
      />
      <span className="marketplace-search-utility-pill">
        {summaryLabel}
        <span className="marketplace-visually-hidden">{` ${currentPage} ${totalPages}`}</span>
      </span>
      <MarketplacePaginationLink
        href={buildMarketplacePaginationHref(basePath, query, nextPage)}
        label={nextLabel}
        disabled={nextPage <= 0}
      />
    </nav>
  );
}
