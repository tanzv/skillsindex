export interface MarketplaceTrendPathData {
  viewWidth: number;
  viewHeight: number;
  linePath: string;
  areaPath: string;
}

interface TrendPathChartLayout {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const defaultTrendLayout: TrendPathChartLayout = {
  top: 12,
  right: 14,
  bottom: 14,
  left: 14
};

export function buildMarketplaceTrendPathData(
  bars: number[],
  viewWidth = 680,
  viewHeight = 250,
  layout: TrendPathChartLayout = defaultTrendLayout
): MarketplaceTrendPathData {
  const usableWidth = viewWidth - layout.left - layout.right;
  const usableHeight = viewHeight - layout.top - layout.bottom;
  const maxValue = Math.max(...bars, 1);
  const points = bars.map((value, index) => {
    const denominator = Math.max(1, bars.length - 1);
    const x = layout.left + (index / denominator) * usableWidth;
    const y = layout.top + (1 - value / maxValue) * usableHeight;
    return { x, y };
  });
  const pointSegments = points.map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  const linePath = pointSegments.length > 0 ? `M ${pointSegments.join(" L ")}` : "";
  const areaPath =
    points.length > 0
      ? `M ${points[0].x.toFixed(2)} ${(layout.top + usableHeight).toFixed(2)} L ${pointSegments.join(" L ")} L ${points[
          points.length - 1
        ].x.toFixed(2)} ${(layout.top + usableHeight).toFixed(2)} Z`
      : "";
  return {
    viewWidth,
    viewHeight,
    linePath,
    areaPath
  };
}
