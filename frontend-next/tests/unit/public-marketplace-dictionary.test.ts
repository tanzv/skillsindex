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

const sourceAnalysisDictionaryKeys = [
  "skill_detail_source_analysis_title",
  "skill_detail_source_entry_file_label",
  "skill_detail_source_mechanism_label",
  "skill_detail_source_metadata_sources_label",
  "skill_detail_source_reference_paths_label",
  "skill_detail_source_dependencies_label",
  "skill_detail_source_no_metadata_sources",
  "skill_detail_source_no_reference_paths",
  "skill_detail_source_no_dependencies",
] as const;

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

  it("keep the source analysis dictionary entries in both locales", () => {
    const englishDictionaryKeys = readDictionaryKeys("en");
    const chineseDictionaryKeys = readDictionaryKeys("zh");

    for (const key of sourceAnalysisDictionaryKeys) {
      expect(englishDictionaryKeys.has(key), `missing english dictionary key: ${key}`).toBe(true);
      expect(chineseDictionaryKeys.has(key), `missing chinese dictionary key: ${key}`).toBe(true);
    }
  });
});
