const MINIMUM_PREVIEW_COMPARISON_CHARS = 240;
const MAXIMUM_PREVIEW_COMPARISON_CHARS = 960;
const PREVIEW_COMPARISON_MULTIPLIER = 4;

function normalizeComparableText(value: string): string {
  return String(value || "")
    .replace(/\r/g, "\n")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function resolvePreviewComparisonWindow(summary: string, previewContent: string): string {
  const summaryLength = String(summary || "").trim().length;
  const windowLength = Math.min(
    MAXIMUM_PREVIEW_COMPARISON_CHARS,
    Math.max(MINIMUM_PREVIEW_COMPARISON_CHARS, summaryLength * PREVIEW_COMPARISON_MULTIPLIER)
  );

  return String(previewContent || "").slice(0, windowLength);
}

export function shouldRenderSkillDetailSummary(summary: string, previewContent: string): boolean {
  const normalizedSummary = normalizeComparableText(summary);

  if (!normalizedSummary) {
    return false;
  }

  const normalizedPreviewWindow = normalizeComparableText(resolvePreviewComparisonWindow(summary, previewContent));
  return !normalizedPreviewWindow.includes(normalizedSummary);
}
