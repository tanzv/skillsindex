import { describe, expect, it } from "vitest";
import {
  appendMarketplaceSearchHistory,
  clearMarketplaceSearchHistory,
  readMarketplaceSearchHistory
} from "./marketplaceSearchHistory";

interface MockStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

function createMockStorage(initialValue: string | null = null): MockStorage {
  let memoryValue = initialValue;
  return {
    getItem: () => memoryValue,
    setItem: (_key, value) => {
      memoryValue = value;
    },
    removeItem: () => {
      memoryValue = null;
    }
  };
}

describe("marketplaceSearchHistory", () => {
  it("returns empty list when storage payload is invalid", () => {
    const storage = createMockStorage("invalid-json");
    expect(readMarketplaceSearchHistory({ storage })).toEqual([]);
  });

  it("writes normalized search entry and keeps newest-first ordering", () => {
    const storage = createMockStorage();
    appendMarketplaceSearchHistory(
      {
        q: "  repo sync ",
        tags: "  automation "
      },
      {
        storage,
        now: 100
      }
    );

    const nextEntries = appendMarketplaceSearchHistory(
      {
        q: "playwright",
        tags: ""
      },
      {
        storage,
        now: 200
      }
    );

    expect(nextEntries).toEqual([
      { q: "playwright", tags: "", timestamp: 200 },
      { q: "repo sync", tags: "automation", timestamp: 100 }
    ]);
  });

  it("deduplicates entries by normalized query and tags", () => {
    const storage = createMockStorage();
    appendMarketplaceSearchHistory(
      {
        q: "Repo",
        tags: "Workflow"
      },
      {
        storage,
        now: 100
      }
    );

    const nextEntries = appendMarketplaceSearchHistory(
      {
        q: "  repo ",
        tags: " workflow "
      },
      {
        storage,
        now: 200
      }
    );

    expect(nextEntries).toEqual([{ q: "repo", tags: "workflow", timestamp: 200 }]);
  });

  it("applies max length limit", () => {
    const storage = createMockStorage();
    appendMarketplaceSearchHistory({ q: "one" }, { storage, now: 100, limit: 2 });
    appendMarketplaceSearchHistory({ q: "two" }, { storage, now: 200, limit: 2 });
    const nextEntries = appendMarketplaceSearchHistory({ q: "three" }, { storage, now: 300, limit: 2 });

    expect(nextEntries).toEqual([
      { q: "three", tags: "", timestamp: 300 },
      { q: "two", tags: "", timestamp: 200 }
    ]);
  });

  it("clears persisted search history", () => {
    const storage = createMockStorage();
    appendMarketplaceSearchHistory({ q: "odoo" }, { storage, now: 100 });
    clearMarketplaceSearchHistory(storage);
    expect(readMarketplaceSearchHistory({ storage })).toEqual([]);
  });
});
