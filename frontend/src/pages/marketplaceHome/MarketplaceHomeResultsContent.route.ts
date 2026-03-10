interface ResultsToolbarLabels {
  latestTitle: string;
  resultsTitle: string;
  categoryResultsTitle: string;
}

interface ResolveResultsToolbarTitleInput {
  isResultsPage: boolean;
  pathname: string;
  labels: ResultsToolbarLabels;
}

function normalizeRoutePath(pathname: string): string {
  const normalizedPath = (String(pathname || "").trim().toLowerCase() || "/").replace(/\/+$/, "");
  return normalizedPath || "/";
}

export function isResultsRoutePath(pathname: string): boolean {
  return /^(?:\/light|\/mobile\/light)?\/results$/.test(normalizeRoutePath(pathname));
}

export function isCategoryDetailResultsRoutePath(pathname: string): boolean {
  return /^(?:\/light|\/mobile\/light)?\/categories\/[^/]+$/.test(normalizeRoutePath(pathname));
}

export function resolveResultsToolbarTitle({
  isResultsPage,
  pathname,
  labels
}: ResolveResultsToolbarTitleInput): string {
  if (!isResultsPage) {
    return labels.latestTitle;
  }
  if (isCategoryDetailResultsRoutePath(pathname)) {
    return labels.categoryResultsTitle;
  }
  return labels.resultsTitle;
}
