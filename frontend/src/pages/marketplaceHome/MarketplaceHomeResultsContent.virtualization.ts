import type { VirtualRowWindowState } from "./MarketplaceHomeAutoLoad.helpers";

export const virtualizedRowThreshold = 8;

interface ResolveLatestRowsWindowInput {
  isResultsPage: boolean;
  shouldVirtualizeRows: boolean;
  latestRowsLength: number;
  virtualWindow: VirtualRowWindowState;
}

interface LatestRowsWindowState {
  startIndex: number;
  endIndex: number;
  paddingTop: number;
  paddingBottom: number;
}

export function resolveLatestRowsWindow({
  isResultsPage,
  shouldVirtualizeRows,
  latestRowsLength,
  virtualWindow
}: ResolveLatestRowsWindowInput): LatestRowsWindowState {
  if (isResultsPage || !shouldVirtualizeRows) {
    return {
      startIndex: 0,
      endIndex: latestRowsLength,
      paddingTop: 0,
      paddingBottom: 0
    };
  }

  const startIndex = Math.min(virtualWindow.startIndex, latestRowsLength);
  const endIndex = Math.min(Math.max(startIndex, virtualWindow.endIndex), latestRowsLength);

  return {
    startIndex,
    endIndex,
    paddingTop: virtualWindow.paddingTop,
    paddingBottom: virtualWindow.paddingBottom
  };
}
