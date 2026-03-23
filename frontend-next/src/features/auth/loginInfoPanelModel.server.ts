import "server-only";

import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { buildLoginInfoPanelModel, type LoginInfoPanelModel } from "./loginInfoPanelModel";
import { type PublicLocale } from "@/src/lib/i18n/publicLocale";

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

const readLoginInfoPanelFile = cache(async (locale: PublicLocale): Promise<Record<string, string>> => {
  const documentPath = path.resolve(process.cwd(), "..", "docs", "i18n", `public-auth-panel.${locale}.md`);
  const fileContent = await readFile(documentPath, "utf8");
  return parseKeyValueDocument(fileContent);
});

export const loadLoginInfoPanelModel = cache(
  async (locale: PublicLocale, redirectTarget: string): Promise<LoginInfoPanelModel> => {
    const dictionary = await readLoginInfoPanelFile(locale);
    return buildLoginInfoPanelModel({
      dictionary,
      redirectTarget
    });
  }
);
