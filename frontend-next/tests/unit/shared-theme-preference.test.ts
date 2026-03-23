import { describe, expect, it } from "vitest";

import {
  buildMarketplaceHrefForTheme,
  resolveStoredThemePreference,
  sharedThemeStorageKey
} from "@/src/lib/theme/sharedThemePreference";

function createStorageSnapshot(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    }
  };
}

describe("sharedThemePreference", () => {
  it("prefers the shared theme storage key and falls back to dark when nothing is stored", () => {
    const emptyStorage = createStorageSnapshot();
    const darkStorage = createStorageSnapshot({
      [sharedThemeStorageKey]: "dark"
    });

    expect(resolveStoredThemePreference(emptyStorage)).toBe("dark");
    expect(resolveStoredThemePreference(darkStorage)).toBe("dark");
  });

  it("accepts the legacy protected key while shared preference has not been written yet", () => {
    const storage = createStorageSnapshot({
      "skillsindex.protected.theme": "light"
    });

    expect(resolveStoredThemePreference(storage)).toBe("light");
  });

  it("builds marketplace entry links that preserve the active shared theme", () => {
    expect(buildMarketplaceHrefForTheme("dark", "/")).toBe("/");
    expect(buildMarketplaceHrefForTheme("light", "/")).toBe("/light");
    expect(buildMarketplaceHrefForTheme("light", "/rankings")).toBe("/light/rankings");
  });
});
