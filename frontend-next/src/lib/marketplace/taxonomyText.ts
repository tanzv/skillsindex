export function normalizeMarketplaceSlug(value: string | undefined | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function humanizeMarketplaceSlug(value: string | undefined | null, fallback = "General"): string {
  const normalized = normalizeMarketplaceSlug(value);
  if (!normalized) {
    return fallback;
  }

  return normalized
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function tokenizeMarketplaceValue(value: string | undefined | null): string[] {
  return String(value || "")
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function buildMarketplaceKeywordSet(...values: Array<string | undefined | null | string[]>): Set<string> {
  const keywords = new Set<string>();

  for (const value of values) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        for (const token of tokenizeMarketplaceValue(entry)) {
          keywords.add(token);
        }
      }
      continue;
    }

    for (const token of tokenizeMarketplaceValue(value)) {
      keywords.add(token);
    }
  }

  return keywords;
}

export function hasMarketplaceKeywordMatch(keywords: Set<string>, candidates: string[] = []): boolean {
  return candidates.some((candidate) => {
    const normalizedCandidate = normalizeMarketplaceSlug(candidate);
    if (normalizedCandidate && keywords.has(normalizedCandidate)) {
      return true;
    }

    return tokenizeMarketplaceValue(candidate).every((token) => keywords.has(token));
  });
}
