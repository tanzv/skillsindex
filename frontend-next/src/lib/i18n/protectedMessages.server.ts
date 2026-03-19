import "server-only";

import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { protectedMessageKeyMap, protectedTopbarMessageFallbacks, type ProtectedMessages } from "./protectedMessages";
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

const readProtectedMessageFile = cache(async (locale: PublicLocale): Promise<Record<string, string>> => {
  const documentPath = path.resolve(process.cwd(), "..", "docs", "i18n", `protected-shell.${locale}.md`);
  const fileContent = await readFile(documentPath, "utf8");
  return parseKeyValueDocument(fileContent);
});

function mapMessageGroup<TGroup extends Record<string, string>>(
  dictionary: Record<string, string>,
  keyMap: TGroup,
  fallbackGroup?: { [K in keyof TGroup]?: string }
) {
  return Object.fromEntries(
    Object.entries(keyMap).map(([propertyKey, dictionaryKey]) => [
      propertyKey,
      dictionary[dictionaryKey] || fallbackGroup?.[propertyKey as keyof TGroup] || dictionaryKey
    ])
  ) as unknown as { [K in keyof TGroup]: string };
}

export const loadProtectedMessages = cache(async (localeValue: string | null | undefined): Promise<ProtectedMessages> => {
  const locale = normalizePublicLocale(localeValue);
  const dictionary = await readProtectedMessageFile(locale);

  return {
    topbar: mapMessageGroup(dictionary, protectedMessageKeyMap.topbar, protectedTopbarMessageFallbacks),
    adminShell: mapMessageGroup(dictionary, protectedMessageKeyMap.adminShell),
    adminNavigation: mapMessageGroup(dictionary, protectedMessageKeyMap.adminNavigation),
    adminRoute: mapMessageGroup(dictionary, protectedMessageKeyMap.adminRoute),
    workspaceShell: mapMessageGroup(dictionary, protectedMessageKeyMap.workspaceShell),
    accountShell: mapMessageGroup(dictionary, protectedMessageKeyMap.accountShell)
  };
});
