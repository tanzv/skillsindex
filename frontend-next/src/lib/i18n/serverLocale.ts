import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";

import {
  normalizePublicLocale,
  publicLocaleCookieName,
  resolvePreferredPublicLocale,
  type PublicLocale
} from "./publicLocale";

export const resolveServerLocale = cache(async (): Promise<PublicLocale> => {
  const cookieStore = await cookies();
  const requestHeaders = await headers();

  return normalizePublicLocale(
    cookieStore.get(publicLocaleCookieName)?.value || resolvePreferredPublicLocale(requestHeaders.get("accept-language"))
  );
});
