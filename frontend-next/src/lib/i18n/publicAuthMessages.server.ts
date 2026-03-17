import "server-only";

import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { publicAuthMessageKeyMap, type PublicAuthMessages } from "./publicAuthMessages";
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

const readPublicAuthMessageFile = cache(async (locale: PublicLocale): Promise<Record<string, string>> => {
  const documentPath = path.resolve(process.cwd(), "..", "docs", "i18n", `public-auth.${locale}.md`);
  const fileContent = await readFile(documentPath, "utf8");
  return parseKeyValueDocument(fileContent);
});

export const loadPublicAuthMessages = cache(async (localeValue: string | null | undefined): Promise<PublicAuthMessages> => {
  const locale = normalizePublicLocale(localeValue);
  const dictionary = await readPublicAuthMessageFile(locale);

  return Object.fromEntries(
    Object.entries(publicAuthMessageKeyMap).map(([propertyKey, dictionaryKey]) => [
      propertyKey,
      dictionary[dictionaryKey] || dictionaryKey
    ])
  ) as unknown as PublicAuthMessages;
});
