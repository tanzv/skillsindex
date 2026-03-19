import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { protectedMessageKeyMap } from "@/src/lib/i18n/protectedMessages";

function readDictionaryKeys(locale: "en" | "zh") {
  const documentPath = path.resolve(process.cwd(), "..", "docs", "i18n", `protected-shell.${locale}.md`);
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

function getProtectedShellKeys() {
  return Object.values(protectedMessageKeyMap)
    .flatMap((group) => Object.values(group))
    .sort();
}

describe("protected shell dictionaries", () => {
  it("cover every protected shell message key in english", () => {
    const dictionaryKeys = readDictionaryKeys("en");
    const missingKeys = getProtectedShellKeys().filter((key) => !dictionaryKeys.has(key));

    expect(missingKeys).toEqual([]);
  });

  it("cover every protected shell message key in chinese", () => {
    const dictionaryKeys = readDictionaryKeys("zh");
    const missingKeys = getProtectedShellKeys().filter((key) => !dictionaryKeys.has(key));

    expect(missingKeys).toEqual([]);
  });
});
