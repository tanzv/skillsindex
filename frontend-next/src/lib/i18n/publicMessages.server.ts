import "server-only";

import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { publicMarketplaceMessageKeyMap, type PublicMarketplaceMessages } from "./publicMessages";
import { normalizePublicLocale, type PublicLocale } from "./publicLocale";

function parseKeyValueDocument(content: string): Record<string, string> {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        if (separatorIndex <= 0) {
          return null;
        }

        return [line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim()];
      })
      .filter((entry): entry is [string, string] => entry !== null)
  );
}

const readPublicMessageFile = cache(async (locale: PublicLocale): Promise<Record<string, string>> => {
  const documentPath = path.resolve(process.cwd(), "..", "docs", "i18n", `public-marketplace.${locale}.md`);
  const fileContent = await readFile(documentPath, "utf8");
  return parseKeyValueDocument(fileContent);
});

export const loadPublicMarketplaceMessages = cache(async (localeValue: string | null | undefined): Promise<PublicMarketplaceMessages> => {
  const locale = normalizePublicLocale(localeValue);
  const dictionary = await readPublicMessageFile(locale);

  return Object.fromEntries(
    Object.entries(publicMarketplaceMessageKeyMap).map(([propertyKey, dictionaryKey]) => [propertyKey, dictionary[dictionaryKey] || dictionaryKey])
  ) as unknown as PublicMarketplaceMessages;
});
