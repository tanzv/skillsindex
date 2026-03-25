import { sessionCookieName } from "@/src/lib/auth/middleware";

export const anonymousMarketplaceRevalidateSeconds = 30;

export interface MarketplaceRequestStrategy {
  includeViewerContext: boolean;
  revalidateSeconds?: number;
  cache?: RequestCache;
}

export interface PublicRequestJSONOptions {
  cache?: RequestCache;
  next?: {
    revalidate: number;
  };
  requestHeaders: Headers;
}

export function buildMarketplaceQuery(searchParams?: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  if (!searchParams) {
    return "";
  }

  for (const [key, rawValue] of Object.entries(searchParams)) {
    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        if (value) {
          params.append(key, value);
        }
      }
      continue;
    }

    if (rawValue) {
      params.set(key, rawValue);
    }
  }

  const suffix = params.toString();
  return suffix ? `?${suffix}` : "";
}

export function resolveMarketplaceRequestStrategy(requestHeaders: Headers): MarketplaceRequestStrategy {
  const cookieHeader = String(requestHeaders.get("cookie") || "").trim();
  const hasSessionCookie = cookieHeader
    .split(";")
    .map((segment) => segment.trim())
    .some((segment) => segment.startsWith(`${sessionCookieName}=`));

  if (hasSessionCookie) {
    return {
      includeViewerContext: true,
      cache: "no-store"
    };
  }

  return {
    includeViewerContext: false,
    revalidateSeconds: anonymousMarketplaceRevalidateSeconds
  };
}

export function buildPublicRequestJSONOptions(requestHeaders: Headers): PublicRequestJSONOptions {
  const requestStrategy = resolveMarketplaceRequestStrategy(requestHeaders);

  return {
    cache: requestStrategy.cache,
    requestHeaders: requestStrategy.includeViewerContext ? requestHeaders : new Headers(),
    next: requestStrategy.revalidateSeconds
      ? {
        revalidate: requestStrategy.revalidateSeconds
        }
      : undefined
  };
}
