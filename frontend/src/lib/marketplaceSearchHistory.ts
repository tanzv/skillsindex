export interface MarketplaceSearchHistoryEntry {
  q: string;
  tags: string;
  timestamp: number;
}

export interface MarketplaceSearchHistoryInput {
  q?: string;
  tags?: string;
}

interface MarketplaceSearchHistoryStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

interface ReadMarketplaceSearchHistoryOptions {
  storage?: MarketplaceSearchHistoryStorage;
  limit?: number;
}

interface AppendMarketplaceSearchHistoryOptions extends ReadMarketplaceSearchHistoryOptions {
  now?: number;
}

const marketplaceSearchHistoryStorageKey = "skillsindex.marketplace.search-history";
const defaultSearchHistoryLimit = 6;

function normalizeSearchField(rawValue: string | undefined): string {
  return String(rawValue || "").trim();
}

function normalizeSearchHistoryLimit(rawLimit: number | undefined): number {
  const resolvedLimit = Number(rawLimit);
  if (!Number.isFinite(resolvedLimit) || resolvedLimit <= 0) {
    return defaultSearchHistoryLimit;
  }
  return Math.max(1, Math.floor(resolvedLimit));
}

function resolveStorage(
  providedStorage: MarketplaceSearchHistoryStorage | undefined
): MarketplaceSearchHistoryStorage | null {
  if (providedStorage) {
    return providedStorage;
  }
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

function buildSearchHistoryEntryKey(entry: MarketplaceSearchHistoryEntry): string {
  return `${entry.q.toLowerCase()}|${entry.tags.toLowerCase()}`;
}

function normalizeSearchHistoryEntry(rawValue: unknown): MarketplaceSearchHistoryEntry | null {
  if (!rawValue || typeof rawValue !== "object") {
    return null;
  }

  const record = rawValue as Partial<MarketplaceSearchHistoryEntry>;
  const normalizedQuery = normalizeSearchField(record.q);
  const normalizedTags = normalizeSearchField(record.tags);
  if (!normalizedQuery && !normalizedTags) {
    return null;
  }

  const normalizedTimestamp = Number(record.timestamp);
  return {
    q: normalizedQuery,
    tags: normalizedTags,
    timestamp: Number.isFinite(normalizedTimestamp) && normalizedTimestamp > 0 ? normalizedTimestamp : Date.now()
  };
}

function normalizeSearchHistoryEntries(rawEntries: unknown, limit: number): MarketplaceSearchHistoryEntry[] {
  if (!Array.isArray(rawEntries)) {
    return [];
  }

  const dedupedEntries: MarketplaceSearchHistoryEntry[] = [];
  const seenKeys = new Set<string>();

  for (const rawEntry of rawEntries) {
    const entry = normalizeSearchHistoryEntry(rawEntry);
    if (!entry) {
      continue;
    }
    const entryKey = buildSearchHistoryEntryKey(entry);
    if (seenKeys.has(entryKey)) {
      continue;
    }
    seenKeys.add(entryKey);
    dedupedEntries.push(entry);
    if (dedupedEntries.length >= limit) {
      break;
    }
  }

  return dedupedEntries;
}

function readRawSearchHistory(storage: MarketplaceSearchHistoryStorage): unknown {
  const rawValue = storage.getItem(marketplaceSearchHistoryStorageKey);
  if (!rawValue) {
    return [];
  }
  return JSON.parse(rawValue) as unknown;
}

function writeSearchHistory(storage: MarketplaceSearchHistoryStorage, entries: MarketplaceSearchHistoryEntry[]): void {
  storage.setItem(marketplaceSearchHistoryStorageKey, JSON.stringify(entries));
}

function buildEntryFromInput(
  input: MarketplaceSearchHistoryInput,
  now: number | undefined
): MarketplaceSearchHistoryEntry | null {
  const normalizedQuery = normalizeSearchField(input.q);
  const normalizedTags = normalizeSearchField(input.tags);
  if (!normalizedQuery && !normalizedTags) {
    return null;
  }

  const resolvedNow = Number(now);
  return {
    q: normalizedQuery,
    tags: normalizedTags,
    timestamp: Number.isFinite(resolvedNow) && resolvedNow > 0 ? resolvedNow : Date.now()
  };
}

export function readMarketplaceSearchHistory(options: ReadMarketplaceSearchHistoryOptions = {}): MarketplaceSearchHistoryEntry[] {
  const storage = resolveStorage(options.storage);
  if (!storage) {
    return [];
  }

  const limit = normalizeSearchHistoryLimit(options.limit);

  try {
    return normalizeSearchHistoryEntries(readRawSearchHistory(storage), limit);
  } catch {
    return [];
  }
}

export function appendMarketplaceSearchHistory(
  input: MarketplaceSearchHistoryInput,
  options: AppendMarketplaceSearchHistoryOptions = {}
): MarketplaceSearchHistoryEntry[] {
  const storage = resolveStorage(options.storage);
  const limit = normalizeSearchHistoryLimit(options.limit);
  const incomingEntry = buildEntryFromInput(input, options.now);

  if (!storage) {
    return incomingEntry ? [incomingEntry] : [];
  }

  try {
    const existingEntries = normalizeSearchHistoryEntries(readRawSearchHistory(storage), limit);
    if (!incomingEntry) {
      return existingEntries;
    }

    const incomingKey = buildSearchHistoryEntryKey(incomingEntry);
    const nextEntries = [incomingEntry, ...existingEntries.filter((entry) => buildSearchHistoryEntryKey(entry) !== incomingKey)].slice(0, limit);
    writeSearchHistory(storage, nextEntries);
    return nextEntries;
  } catch {
    if (!incomingEntry) {
      return [];
    }

    const nextEntries = [incomingEntry];
    try {
      writeSearchHistory(storage, nextEntries);
    } catch {
      return nextEntries;
    }
    return nextEntries;
  }
}

export function clearMarketplaceSearchHistory(storage?: MarketplaceSearchHistoryStorage): void {
  const resolvedStorage = resolveStorage(storage);
  if (!resolvedStorage) {
    return;
  }
  try {
    resolvedStorage.removeItem(marketplaceSearchHistoryStorageKey);
  } catch {
    // Ignore storage clear errors to keep search flow stable.
  }
}
