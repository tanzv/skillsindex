import { redirect } from "next/navigation";

export interface PublicCompatibilityRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface RedirectPublicCompatibilityRouteOptions {
  canonicalRoute: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  defaultParams?: Record<string, string>;
}

function buildSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
  defaultParams: Record<string, string>
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(searchParams)) {
    if (Array.isArray(rawValue)) {
      rawValue.filter(Boolean).forEach((value) => params.append(key, value));
      continue;
    }

    if (rawValue) {
      params.set(key, rawValue);
    }
  }

  for (const [key, value] of Object.entries(defaultParams)) {
    if (!params.has(key)) {
      params.set(key, value);
    }
  }

  return params;
}

export async function redirectPublicCompatibilityRoute({
  canonicalRoute,
  searchParams,
  defaultParams = {}
}: RedirectPublicCompatibilityRouteOptions): Promise<never> {
  const resolvedSearchParams = await searchParams;
  const params = buildSearchParams(resolvedSearchParams, defaultParams);
  const suffix = params.toString();

  redirect(suffix ? `${canonicalRoute}?${suffix}` : canonicalRoute);
}
