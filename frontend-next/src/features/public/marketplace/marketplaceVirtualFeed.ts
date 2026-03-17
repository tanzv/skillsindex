export interface MarketplaceVirtualWindowState {
  startIndex: number;
  endIndex: number;
  paddingTop: number;
  paddingBottom: number;
}

function clampInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

function calculateRowsBlockHeight(rowCount: number, rowHeight: number, rowGap: number): number {
  if (rowCount <= 0) {
    return 0;
  }

  return rowCount * rowHeight + Math.max(0, rowCount - 1) * rowGap;
}

export function groupMarketplaceRows<T>(items: T[], itemsPerRow = 3): T[][] {
  const rowSize = Math.max(1, Math.floor(itemsPerRow));
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += rowSize) {
    rows.push(items.slice(index, index + rowSize));
  }

  return rows;
}

interface ComputeMarketplaceVirtualWindowInput {
  totalRows: number;
  rowHeight: number;
  rowGap: number;
  overscanRows: number;
  viewportTop: number;
  viewportBottom: number;
}

export function computeMarketplaceVirtualWindow({
  totalRows,
  rowHeight,
  rowGap,
  overscanRows,
  viewportTop,
  viewportBottom
}: ComputeMarketplaceVirtualWindowInput): MarketplaceVirtualWindowState {
  if (totalRows <= 0) {
    return {
      startIndex: 0,
      endIndex: 0,
      paddingTop: 0,
      paddingBottom: 0
    };
  }

  const normalizedRowHeight = Math.max(1, clampInteger(rowHeight));
  const normalizedRowGap = clampInteger(rowGap);
  const normalizedOverscan = clampInteger(overscanRows);
  const rowStride = normalizedRowHeight + normalizedRowGap;
  const totalHeight = calculateRowsBlockHeight(totalRows, normalizedRowHeight, normalizedRowGap);
  const boundedViewportTop = Math.max(0, Math.min(totalHeight, Number(viewportTop || 0)));
  const boundedViewportBottom = Math.max(boundedViewportTop, Math.min(totalHeight, Number(viewportBottom || 0)));
  const firstVisibleIndex = Math.min(totalRows - 1, Math.max(0, Math.floor(boundedViewportTop / rowStride)));
  const lastVisibleIndex = Math.min(totalRows - 1, Math.max(0, Math.floor(Math.max(0, boundedViewportBottom - 1) / rowStride)));
  const startIndex = Math.max(0, firstVisibleIndex - normalizedOverscan);
  const endIndex = Math.min(totalRows, lastVisibleIndex + normalizedOverscan + 1);

  return {
    startIndex,
    endIndex,
    paddingTop: calculateRowsBlockHeight(startIndex, normalizedRowHeight, normalizedRowGap),
    paddingBottom: calculateRowsBlockHeight(totalRows - endIndex, normalizedRowHeight, normalizedRowGap)
  };
}
