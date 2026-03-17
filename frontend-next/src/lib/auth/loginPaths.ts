import { withPublicPathPrefix } from "../routing/publicCompat";

function normalizeRedirectTarget(targetPath: string): string {
  const normalized = String(targetPath || "").trim();
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return "/workspace";
  }

  return normalized;
}

export function buildLoginRedirectPath(targetPath: string): string {
  const params = new URLSearchParams();
  params.set("redirect", normalizeRedirectTarget(targetPath));
  return `/login?${params.toString()}`;
}

export function buildPublicLoginPath(prefix: string, corePath: string, searchSuffix = ""): string {
  return buildLoginRedirectPath(`${withPublicPathPrefix(prefix, corePath)}${searchSuffix}`);
}
