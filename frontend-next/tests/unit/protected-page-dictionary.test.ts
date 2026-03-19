import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { protectedPageMessageKeyMap } from "@/src/lib/i18n/protectedPageMessages";

function readDictionaryKeys(locale: "en" | "zh") {
  const documentPath = path.resolve(process.cwd(), "..", "docs", "i18n", `protected-pages.${locale}.md`);
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

function getProtectedPageKeys() {
  return Object.values(protectedPageMessageKeyMap)
    .flatMap((group) => Object.values(group))
    .sort();
}

describe("protected page dictionaries", () => {
  it("cover every protected page message key in english", () => {
    const dictionaryKeys = readDictionaryKeys("en");
    const missingKeys = getProtectedPageKeys().filter((key) => !dictionaryKeys.has(key));

    expect(missingKeys).toEqual([]);
  });

  it("cover every protected page message key in chinese", () => {
    const dictionaryKeys = readDictionaryKeys("zh");
    const missingKeys = getProtectedPageKeys().filter((key) => !dictionaryKeys.has(key));

    expect(missingKeys).toEqual([]);
  });
});
