export interface PrototypePagePalette {
  shellBackground: string;
  headerBackground: string;
  headerBorder: string;
  headerTitle: string;
  headerSubtitle: string;
  cardBackground: string;
  cardBorder: string;
  cardTitle: string;
  cardText: string;
  metricLabel: string;
  metricValue: string;
  sideHighlightBackground: string;
  sideHighlightBorder: string;
}

export function isLightPrototypePath(pathname: string): boolean {
  return pathname.startsWith("/light") || pathname.startsWith("/mobile/light");
}

export function resolveAdminBase(pathname: string): string {
  const publicBase = resolvePublicBase(pathname);
  if (!publicBase) {
    return "/admin";
  }
  return `${publicBase}/admin`;
}

export function resolvePublicBase(pathname: string): string {
  if (pathname.startsWith("/mobile/light")) {
    return "/mobile/light";
  }
  if (pathname.startsWith("/mobile")) {
    return "/mobile";
  }
  if (pathname.startsWith("/light")) {
    return "/light";
  }
  return "";
}

export function toPublicRoute(base: string, route: string): string {
  return base ? `${base}${route}` : route;
}

export function createPrototypePalette(isLight: boolean): PrototypePagePalette {
  if (isLight) {
    return {
      shellBackground: "transparent",
      headerBackground: "#d5deeb",
      headerBorder: "#c1ccd9",
      headerTitle: "#14263d",
      headerSubtitle: "#3f5671",
      cardBackground: "#edf2f8",
      cardBorder: "#ced8e6",
      cardTitle: "#1a2f4a",
      cardText: "#3d5673",
      metricLabel: "#567292",
      metricValue: "#14263d",
      sideHighlightBackground: "linear-gradient(150deg, #1da39b, #168f8a)",
      sideHighlightBorder: "#0f8f88"
    };
  }

  return {
    shellBackground: "transparent",
    headerBackground: "#0e2346",
    headerBorder: "#2c4f84",
    headerTitle: "#f4fbff",
    headerSubtitle: "#c8dcfb",
    cardBackground: "#14335f",
    cardBorder: "#2d4f82",
    cardTitle: "#f3fbff",
    cardText: "#c6ddff",
    metricLabel: "#9dc3ee",
    metricValue: "#f1f8ff",
    sideHighlightBackground: "linear-gradient(150deg, #1392aa, #1a567b)",
    sideHighlightBorder: "#22b6cb"
  };
}
