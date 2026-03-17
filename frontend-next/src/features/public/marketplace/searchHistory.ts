export interface MarketplaceRecentSearchEntry {
  route: string;
  query: string;
  tags?: string;
  createdAt: string;
}

interface LegacyMarketplaceRecentSearchEntry {
  q?: string;
  tags?: string;
  timestamp?: number;
}

export const marketplaceSearchHistoryStorageKey = "skillsindex.marketplace.search-history";
const maxRecentSearchEntries = 6;

function normalizeRoute(route: string): string {
  const trimmed = String(route || "").trim();
  if (!trimmed) {
    return "/results";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function normalizeQuery(query: string): string {
  return String(query || "").trim().replace(/\s+/g, " ");
}

function normalizeTags(tags: string | undefined): string {
  return String(tags || "").trim().replace(/\s+/g, " ");
}

function normalizeLegacyEntry(rawValue: unknown): MarketplaceRecentSearchEntry | null {
  if (!rawValue || typeof rawValue !== "object") {
    return null;
  }

  const legacyEntry = rawValue as LegacyMarketplaceRecentSearchEntry;
  const query = normalizeQuery(legacyEntry.q || "");
  const tags = normalizeTags(legacyEntry.tags);
  const createdAtValue = Number(legacyEntry.timestamp);

  if ((!query && !tags) || !Number.isFinite(createdAtValue) || createdAtValue <= 0) {
    return null;
  }

  return {
    route: "/results",
    query,
    tags: tags || undefined,
    createdAt: new Date(createdAtValue).toISOString()
  };
}

export function readMarketplaceRecentSearches(rawValue: string | null | undefined): MarketplaceRecentSearchEntry[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        if ("q" in item || "tags" in item || "timestamp" in item) {
          return normalizeLegacyEntry(item);
        }

        const query = normalizeQuery("query" in item ? String(item.query || "") : "");
        const route = normalizeRoute("route" in item ? String(item.route || "") : "/results");
        const tags = normalizeTags("tags" in item ? String(item.tags || "") : "");
        const createdAt = "createdAt" in item ? String(item.createdAt || "") : "";

        if ((!query && !tags) || !createdAt) {
          return null;
        }

        return { route, query, tags: tags || undefined, createdAt };
      })
      .filter((item): item is MarketplaceRecentSearchEntry => item !== null)
      .slice(0, maxRecentSearchEntries);
  } catch {
    return [];
  }
}

export function createMarketplaceSearchHref(route: string, query: string, tags?: string): string {
  const normalizedRoute = normalizeRoute(route);
  const normalizedQuery = normalizeQuery(query);
  const normalizedTags = normalizeTags(tags);
  const params = new URLSearchParams();

  if (normalizedQuery) {
    params.set("q", normalizedQuery);
  }
  if (normalizedTags) {
    params.set("tags", normalizedTags);
  }

  const encoded = params.toString();
  return encoded ? `${normalizedRoute}?${encoded}` : normalizedRoute;
}

export function buildMarketplaceRecentSearchLabel(entry: MarketplaceRecentSearchEntry): string {
  const normalizedQuery = normalizeQuery(entry.query);
  const normalizedTags = normalizeTags(entry.tags);

  if (normalizedQuery && normalizedTags) {
    return `${normalizedQuery} · ${normalizedTags}`;
  }
  if (normalizedQuery) {
    return normalizedQuery;
  }
  if (normalizedTags) {
    return normalizedTags;
  }
  return "";
}

export function recordMarketplaceRecentSearch(
  entries: MarketplaceRecentSearchEntry[],
  route: string,
  query: string,
  tags?: string,
  createdAt: string = new Date().toISOString()
): MarketplaceRecentSearchEntry[] {
  const normalizedRoute = normalizeRoute(route);
  const normalizedQuery = normalizeQuery(query);
  const normalizedTags = normalizeTags(tags);

  if (!normalizedQuery && !normalizedTags) {
    return entries.slice(0, maxRecentSearchEntries);
  }

  const nextEntry: MarketplaceRecentSearchEntry = {
    route: normalizedRoute,
    query: normalizedQuery,
    tags: normalizedTags || undefined,
    createdAt
  };

  const deduplicatedEntries = entries.filter(
    (entry) =>
      !(
        entry.route === nextEntry.route &&
        entry.query.toLowerCase() === nextEntry.query.toLowerCase() &&
        normalizeTags(entry.tags).toLowerCase() === normalizedTags.toLowerCase()
      )
  );

  return [nextEntry, ...deduplicatedEntries].slice(0, maxRecentSearchEntries);
}
