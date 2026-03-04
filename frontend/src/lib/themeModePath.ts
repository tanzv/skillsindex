export type ThemeMode = "dark" | "light";

interface PathThemeState {
  corePath: string;
  isMobile: boolean;
  mode: ThemeMode;
}

function normalizePath(pathname: string): string {
  const trimmed = String(pathname || "").trim();
  if (!trimmed) {
    return "/";
  }
  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.replace(/\/+$/, "") || "/";
}

function splitPathThemeState(pathname: string): PathThemeState {
  const normalizedPath = normalizePath(pathname);
  if (normalizedPath === "/mobile/light" || normalizedPath.startsWith("/mobile/light/")) {
    const suffix = normalizedPath.slice("/mobile/light".length) || "/";
    return { corePath: normalizePath(suffix), isMobile: true, mode: "light" };
  }
  if (normalizedPath === "/mobile" || normalizedPath.startsWith("/mobile/")) {
    const suffix = normalizedPath.slice("/mobile".length) || "/";
    return { corePath: normalizePath(suffix), isMobile: true, mode: "dark" };
  }
  if (normalizedPath === "/light" || normalizedPath.startsWith("/light/")) {
    const suffix = normalizedPath.slice("/light".length) || "/";
    return { corePath: normalizePath(suffix), isMobile: false, mode: "light" };
  }
  return { corePath: normalizedPath, isMobile: false, mode: "dark" };
}

function normalizeSearch(search: string): string {
  const trimmed = String(search || "").trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.startsWith("?") ? trimmed : `?${trimmed}`;
}

function normalizeHash(hash: string): string {
  const trimmed = String(hash || "").trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function buildPrefix(isMobile: boolean, mode: ThemeMode): string {
  if (isMobile) {
    return mode === "light" ? "/mobile/light" : "/mobile";
  }
  return mode === "light" ? "/light" : "";
}

export function resolveThemeMode(pathname: string): ThemeMode {
  return splitPathThemeState(pathname).mode;
}

export function buildPathWithThemeMode(pathname: string, mode: ThemeMode, search = "", hash = ""): string {
  const pathState = splitPathThemeState(pathname);
  const prefix = buildPrefix(pathState.isMobile, mode);
  const normalizedCorePath = pathState.corePath === "/" ? "" : pathState.corePath;
  const outputPath = `${prefix}${normalizedCorePath}` || "/";
  return `${outputPath}${normalizeSearch(search)}${normalizeHash(hash)}`;
}
