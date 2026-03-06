function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

export function resolvePrototypeCatalogFallbackRoute(pathname: string): string | null {
  const normalized = normalizePath(pathname);

  if (/^\/(?:mobile\/light\/|light\/)admin\/permissions\/accounts(?:\/[^/?#]+)?$/.test(normalized)) {
    return "/light/admin/accounts";
  }
  if (/^\/(?:mobile\/)?admin\/permissions\/accounts(?:\/[^/?#]+)?$/.test(normalized)) {
    return "/admin/accounts";
  }

  if (/^\/(?:light\/|mobile\/light\/)workspace(?:\/[^/?#]+)?$/.test(normalized)) {
    return "/light/workspace";
  }
  if (/^\/(?:mobile\/)?workspace(?:\/[^/?#]+)?$/.test(normalized)) {
    return "/workspace";
  }

  return null;
}
