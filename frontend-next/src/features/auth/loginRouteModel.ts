import {
  normalizePublicLocale,
  resolvePreferredPublicLocale,
  type PublicLocale
} from "@/src/lib/i18n/publicLocale";

export type LoginRouteSearchParams = Record<string, string | string[] | undefined>;

export const defaultLoginRedirectTarget = "/workspace";

export function resolveLoginRedirectTarget(searchParams: LoginRouteSearchParams): string {
  return typeof searchParams.redirect === "string" ? searchParams.redirect : defaultLoginRedirectTarget;
}

export function normalizeLoginRedirectTarget(redirectTarget: string): string {
  if (!redirectTarget.startsWith("/") || redirectTarget.startsWith("//")) {
    return defaultLoginRedirectTarget;
  }

  return redirectTarget;
}

export function resolveLoginRouteLocale(
  localeCookieValue: string | undefined,
  acceptLanguageHeader: string | null
): PublicLocale {
  return normalizePublicLocale(localeCookieValue || resolvePreferredPublicLocale(acceptLanguageHeader));
}
