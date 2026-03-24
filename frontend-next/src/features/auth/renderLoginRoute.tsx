import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { defaultAuthenticatedRedirect, hasSessionCookie } from "@/src/lib/auth/middleware";
import { getServerSessionContext, isAuthenticatedSession } from "@/src/lib/auth/session";
import { loadPublicAuthProviders } from "@/src/lib/api/publicAuthProviders.server";
import { loadPublicAuthMessages } from "@/src/lib/i18n/publicAuthMessages.server";
import { publicLocaleCookieName } from "@/src/lib/i18n/publicLocale";

import { LoginForm } from "./LoginForm";
import { loadLoginInfoPanelModel } from "./loginInfoPanelModel.server";
import {
  normalizeLoginRedirectTarget,
  resolveLoginRedirectTarget,
  resolveLoginRouteLocale,
  type LoginRouteSearchParams
} from "./loginRouteModel";

export interface LoginRoutePageProps {
  searchParams: Promise<LoginRouteSearchParams>;
}

async function redirectAuthenticatedSession(requestHeaders: Headers): Promise<void> {
  if (!hasSessionCookie(requestHeaders)) {
    return;
  }

  const session = await getServerSessionContext();
  if (isAuthenticatedSession(session)) {
    redirect(defaultAuthenticatedRedirect);
  }
}

export async function renderLoginRoute(searchParams: Promise<LoginRouteSearchParams>): Promise<ReactElement> {
  const [resolvedSearchParams, cookieStore, incomingHeaders] = await Promise.all([searchParams, cookies(), headers()]);
  const requestHeaders = new Headers(incomingHeaders);

  await redirectAuthenticatedSession(requestHeaders);

  const locale = resolveLoginRouteLocale(
    cookieStore.get(publicLocaleCookieName)?.value,
    requestHeaders.get("accept-language")
  );
  const redirectTarget = normalizeLoginRedirectTarget(resolveLoginRedirectTarget(resolvedSearchParams));
  const [messages, infoPanelModel, providers] = await Promise.all([
    loadPublicAuthMessages(locale),
    loadLoginInfoPanelModel(locale, redirectTarget),
    loadPublicAuthProviders(requestHeaders.get("accept-language"))
  ]);

  return (
    <LoginForm
      redirectTarget={redirectTarget}
      initialLocale={locale}
      providers={providers}
      infoPanelModel={infoPanelModel}
      messages={messages}
    />
  );
}
