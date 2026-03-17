import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

import { LoginForm } from "@/src/features/auth/LoginForm";
import { isAuthenticatedSession, getServerSessionContext } from "@/src/lib/auth/session";
import { defaultAuthenticatedRedirect } from "@/src/lib/auth/middleware";
import { loadPublicAuthMessages } from "@/src/lib/i18n/publicAuthMessages.server";
import {
  normalizePublicLocale,
  publicLocaleCookieName,
  resolvePreferredPublicLocale
} from "@/src/lib/i18n/publicLocale";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSessionContext();
  if (isAuthenticatedSession(session)) {
    redirect(defaultAuthenticatedRedirect);
  }

  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const redirectTarget = typeof resolvedSearchParams.redirect === "string" ? resolvedSearchParams.redirect : "/workspace";
  const locale = normalizePublicLocale(
    cookieStore.get(publicLocaleCookieName)?.value || resolvePreferredPublicLocale(requestHeaders.get("accept-language"))
  );
  const messages = await loadPublicAuthMessages(locale);

  return <LoginForm redirectTarget={redirectTarget} initialLocale={locale} messages={messages} />;
}
