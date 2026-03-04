export function didVisualCheckPass(mismatchRatio, threshold) {
  return mismatchRatio <= threshold;
}

export function buildComparisonSummary({ diffPixels, width, height, threshold }) {
  const totalPixels = width * height;
  const mismatchRatio = totalPixels === 0 ? 0 : diffPixels / totalPixels;

  return {
    width,
    height,
    diffPixels,
    totalPixels,
    mismatchRatio,
    threshold,
    passed: didVisualCheckPass(mismatchRatio, threshold)
  };
}
