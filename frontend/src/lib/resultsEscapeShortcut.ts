import { buildMarketplacePath, parseQueryState } from "../pages/marketplaceHome/MarketplaceHomePage.helpers";

const resultsPathSuffix = "/results";

function resolveHomePathFromResults(pathname: string): string | null {
  if (pathname === resultsPathSuffix) {
    return "/";
  }
  if (!pathname.endsWith(resultsPathSuffix)) {
    return null;
  }
  const prefix = pathname.slice(0, -resultsPathSuffix.length);
  return prefix || "/";
}

export function installResultsEscapeShortcut(win: Window = window, doc: Document = document): () => void {
  const createPopStateEvent = (): Event => {
    if (typeof globalThis.PopStateEvent === "function") {
      return new PopStateEvent("popstate");
    }
    return new Event("popstate");
  };

  function handleResultsEscape(event: KeyboardEvent) {
    if (event.key !== "Escape" && event.code !== "Escape") {
      return;
    }

    const homePath = resolveHomePathFromResults(win.location.pathname);
    if (!homePath) {
      return;
    }

    event.preventDefault();
    const query = parseQueryState(win.location.search);
    const nextPath = buildMarketplacePath(query, homePath);
    if (nextPath === `${win.location.pathname}${win.location.search}`) {
      return;
    }
    win.history.pushState({}, "", nextPath);
    win.dispatchEvent(createPopStateEvent());
  }

  doc.addEventListener("keydown", handleResultsEscape, true);
  return () => {
    doc.removeEventListener("keydown", handleResultsEscape, true);
  };
}
