import "server-only";

import { cookies } from "next/headers";

import { requireRouteSession } from "@/src/lib/auth/guards";
import { getServerSessionContext } from "@/src/lib/auth/session";
import { loadProtectedPageMessages } from "@/src/lib/i18n/protectedPageMessages.server";
import { loadProtectedMessages } from "@/src/lib/i18n/protectedMessages.server";
import { resolveServerLocale } from "@/src/lib/i18n/serverLocale";
import { resolveThemePreferenceFromCookieValue, sharedThemeCookieName } from "@/src/lib/theme/sharedThemePreference";

interface LoadProtectedLayoutContextOptions {
  requireSession?: boolean;
}

export async function loadProtectedLayoutContext(
  requiredRoute: string,
  options: LoadProtectedLayoutContextOptions = {}
) {
  const [session, locale, cookieStore] = await Promise.all([getServerSessionContext(), resolveServerLocale(), cookies()]);

  if (options.requireSession !== false) {
    requireRouteSession(session, requiredRoute);
  }

  const [messages, pageMessages] = await Promise.all([loadProtectedMessages(locale), loadProtectedPageMessages(locale)]);
  const theme = resolveThemePreferenceFromCookieValue(cookieStore.get(sharedThemeCookieName)?.value);

  return {
    session,
    locale,
    theme,
    messages,
    pageMessages
  };
}
