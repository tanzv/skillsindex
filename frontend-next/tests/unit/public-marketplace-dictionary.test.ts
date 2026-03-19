import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { publicMarketplaceMessageKeyMap } from "@/src/lib/i18n/publicMessages";

function readDictionaryKeys(locale: "en" | "zh") {
  const documentPath = path.resolve(process.cwd(), "..", "docs", "i18n", `public-marketplace.${locale}.md`);
  return new Set(
    readFileSync(documentPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"))
      .map((line) => line.split("=")[0]?.trim())
      .filter((key): key is string => Boolean(key))
  );
}

function getPublicMarketplaceKeys() {
  return Object.values(publicMarketplaceMessageKeyMap).sort();
}

describe("public marketplace dictionaries", () => {
  it("cover every public marketplace message key in english", () => {
    const dictionaryKeys = readDictionaryKeys("en");
    const missingKeys = getPublicMarketplaceKeys().filter((key) => !dictionaryKeys.has(key));

    expect(missingKeys).toEqual([]);
  });

  it("cover every public marketplace message key in chinese", () => {
    const dictionaryKeys = readDictionaryKeys("zh");
    const missingKeys = getPublicMarketplaceKeys().filter((key) => !dictionaryKeys.has(key));

    expect(missingKeys).toEqual([]);
  });
});
