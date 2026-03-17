export function buildPathWithQuery(basePath: string, values: Record<string, unknown>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(","));
      }
      continue;
    }

    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function buildBFFPath(apiPath: string): string {
  const normalizedPath = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  if (normalizedPath.startsWith("/api/v1/")) {
    return `/api/bff/${normalizedPath.slice("/api/v1/".length)}`;
  }
  if (normalizedPath === "/api/v1") {
    return "/api/bff";
  }
  return normalizedPath;
}

export function requiredID(rawValue: unknown): number | null {
  const numericValue = Number(rawValue);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return null;
  }

  return numericValue;
}

export function parseScopes(rawValue: unknown): string[] {
  return Array.from(
    new Set(
      String(rawValue || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

export function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export function asNumber(value: unknown, fallback = 0): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}
