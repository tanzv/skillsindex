import "server-only";

import { cookies, headers } from "next/headers";

import {
  normalizePublicLocale,
  publicLocaleCookieName,
  resolvePreferredPublicLocale,
  type PublicLocale
} from "./publicLocale";

export async function resolveServerLocale(): Promise<PublicLocale> {
  const cookieStore = await cookies();
  const requestHeaders = await headers();

  return normalizePublicLocale(
    cookieStore.get(publicLocaleCookieName)?.value || resolvePreferredPublicLocale(requestHeaders.get("accept-language"))
  );
}
