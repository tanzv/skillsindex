import "server-only";

import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  adminIntegrationsMessageFallbacks,
  protectedPageMessageKeyMap,
  type ProtectedPageMessages
} from "./protectedPageMessages";
import { workspaceMessageFallbacks } from "./protectedPageMessages.workspace";
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

const readProtectedPageMessageFile = cache(async (locale: PublicLocale): Promise<Record<string, string>> => {
  const documentPath = path.resolve(process.cwd(), "..", "docs", "i18n", `protected-pages.${locale}.md`);
  const fileContent = await readFile(documentPath, "utf8");
  return parseKeyValueDocument(fileContent);
});

function mapMessageGroup<TGroup extends Record<string, string>>(
  dictionary: Record<string, string>,
  keyMap: TGroup,
  fallbackGroup?: Partial<{ [K in keyof TGroup]: string }>
) {
  return Object.fromEntries(
    Object.entries(keyMap).map(([propertyKey, dictionaryKey]) => [
      propertyKey,
      dictionary[dictionaryKey] || fallbackGroup?.[propertyKey as keyof TGroup] || dictionaryKey
    ])
  ) as unknown as { [K in keyof TGroup]: string };
}

export const loadProtectedPageMessages = cache(async (localeValue: string | null | undefined): Promise<ProtectedPageMessages> => {
  const locale = normalizePublicLocale(localeValue);
  const dictionary = await readProtectedPageMessageFile(locale);

  return {
    adminCommon: mapMessageGroup(dictionary, protectedPageMessageKeyMap.adminCommon),
    accountCenter: mapMessageGroup(dictionary, protectedPageMessageKeyMap.accountCenter),
    adminApiKeys: mapMessageGroup(dictionary, protectedPageMessageKeyMap.adminApiKeys),
    adminOverview: mapMessageGroup(dictionary, protectedPageMessageKeyMap.adminOverview),
    adminOperations: mapMessageGroup(dictionary, protectedPageMessageKeyMap.adminOperations),
    adminOrganizations: mapMessageGroup(dictionary, protectedPageMessageKeyMap.adminOrganizations),
    adminModeration: mapMessageGroup(dictionary, protectedPageMessageKeyMap.adminModeration),
    adminAccess: mapMessageGroup(dictionary, protectedPageMessageKeyMap.adminAccess),
    adminAccounts: mapMessageGroup(dictionary, protectedPageMessageKeyMap.adminAccounts),
    adminCatalog: mapMessageGroup(dictionary, protectedPageMessageKeyMap.adminCatalog),
    adminIngestion: mapMessageGroup(dictionary, protectedPageMessageKeyMap.adminIngestion),
    adminIntegrations: mapMessageGroup(
      dictionary,
      protectedPageMessageKeyMap.adminIntegrations,
      adminIntegrationsMessageFallbacks
    ),
    workspace: mapMessageGroup(dictionary, protectedPageMessageKeyMap.workspace, workspaceMessageFallbacks)
  };
});
