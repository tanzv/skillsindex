import "server-only";

import { requireRouteSession } from "@/src/lib/auth/guards";
import { getServerSessionContext } from "@/src/lib/auth/session";
import { loadProtectedPageMessages } from "@/src/lib/i18n/protectedPageMessages.server";
import { loadProtectedMessages } from "@/src/lib/i18n/protectedMessages.server";
import { resolveServerLocale } from "@/src/lib/i18n/serverLocale";

export async function loadProtectedLayoutContext(requiredRoute: string) {
  const [session, locale] = await Promise.all([getServerSessionContext(), resolveServerLocale()]);

  requireRouteSession(session, requiredRoute);

  const [messages, pageMessages] = await Promise.all([loadProtectedMessages(locale), loadProtectedPageMessages(locale)]);

  return {
    session,
    locale,
    messages,
    pageMessages
  };
}
