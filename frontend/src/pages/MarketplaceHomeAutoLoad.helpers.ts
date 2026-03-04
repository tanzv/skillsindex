import type { MarketplaceQueryParams, MarketplaceSkill, PublicMarketplaceResponse } from "../lib/api";

interface MergeMarketplacePayloadForHomeAutoLoadInput {
  previousPayload: PublicMarketplaceResponse | null;
  nextPayload: PublicMarketplaceResponse;
  nextQuery: MarketplaceQueryParams;
}

interface ComputeVirtualRowWindowInput {
  totalRows: number;
  rowHeight: number;
  rowGap: number;
  overscanRows: number;
  viewportTop: number;
  viewportBottom: number;
}

interface AutoLoadScrollReadinessInput {
  scrollTop: number;
  scrollHeight: number;
  viewportHeight: number;
  triggerDistancePx: number;
}

export interface VirtualRowWindowState {
  startIndex: number;
  endIndex: number;
  paddingTop: number;
  paddingBottom: number;
}

function toNormalizedToken(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function clampToPositiveInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
}

function calculateRowsBlockHeight(rowsCount: number, rowHeight: number, rowGap: number): number {
  if (rowsCount <= 0) {
    return 0;
  }
  return rowsCount * rowHeight + Math.max(0, rowsCount - 1) * rowGap;
}

export function buildHomeQuerySignature(query: MarketplaceQueryParams): string {
  const normalized = {
    q: toNormalizedToken(query.q),
    tags: toNormalizedToken(query.tags),
    category: toNormalizedToken(query.category),
    subcategory: toNormalizedToken(query.subcategory),
    sort: toNormalizedToken(query.sort || "recent"),
    mode: toNormalizedToken(query.mode || "keyword")
  };
  return JSON.stringify(normalized);
}

function dedupeSkillsByID(items: MarketplaceSkill[]): MarketplaceSkill[] {
  const seen = new Set<number>();
  const result: MarketplaceSkill[] = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

function clampPage(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(1, Math.floor(value));
}

function resolveRequestedPage(nextQuery: MarketplaceQueryParams, nextPayload: PublicMarketplaceResponse): number {
  const queryPage = Number(nextQuery.page || "");
  if (Number.isFinite(queryPage) && queryPage > 0) {
    return clampPage(queryPage);
  }
  return clampPage(Number(nextPayload.pagination.page || 1));
}

function normalizePageMetadata(
  payload: PublicMarketplaceResponse,
  page: number,
  nextPageOverride?: number
): PublicMarketplaceResponse["pagination"] {
  const pageSize = Math.max(1, Math.floor(Number(payload.pagination.page_size || 24)));
  const totalItems = Math.max(0, Math.floor(Number(payload.pagination.total_items || 0)));
  const reportedPage = clampPage(Number(payload.pagination.page || page || 1));
  const reportedTotalPages = clampPage(Number(payload.pagination.total_pages || 1));
  const hasVisibleItems = Array.isArray(payload.items) && payload.items.length > 0;
  const isClampedTerminalPage = hasVisibleItems && reportedPage < page && reportedPage >= reportedTotalPages;
  const effectivePage = isClampedTerminalPage ? reportedPage : page;
  const shouldExtendTotalPages = hasVisibleItems && reportedTotalPages < effectivePage;
  const totalPages = shouldExtendTotalPages ? effectivePage + 1 : Math.max(effectivePage, reportedTotalPages);
  const nextPage = nextPageOverride !== undefined ? nextPageOverride : effectivePage < totalPages ? effectivePage + 1 : 0;
  return {
    ...payload.pagination,
    page: effectivePage,
    page_size: pageSize,
    total_items: totalItems,
    total_pages: totalPages,
    prev_page: effectivePage > 1 ? effectivePage - 1 : 0,
    next_page: nextPage
  };
}

export function normalizeUnavailableLiveMarketplacePayload(
  payload: PublicMarketplaceResponse,
  requestedPageValue: number | string | undefined
): PublicMarketplaceResponse {
  const requestedPage = clampPage(Number(requestedPageValue || payload.pagination.page || 1));
  const pageSize = Math.max(1, Math.floor(Number(payload.pagination.page_size || 24)));
  return {
    ...payload,
    stats: {
      ...payload.stats,
      matching_skills: 0
    },
    pagination: {
      ...payload.pagination,
      page: requestedPage,
      page_size: pageSize,
      total_items: 0,
      total_pages: requestedPage,
      prev_page: requestedPage > 1 ? requestedPage - 1 : 0,
      next_page: 0
    },
    items: []
  };
}

function normalizeTerminalPagination(payload: PublicMarketplaceResponse, requestedPage?: number): PublicMarketplaceResponse {
  const currentPage = clampPage(Number(requestedPage || payload.pagination.page || 1));
  return {
    ...payload,
    pagination: {
      ...payload.pagination,
      page: currentPage,
      total_pages: currentPage,
      prev_page: currentPage > 1 ? currentPage - 1 : 0,
      next_page: 0
    }
  };
}

export function mergeMarketplacePayloadForHomeAutoLoad({
  previousPayload,
  nextPayload,
  nextQuery
}: MergeMarketplacePayloadForHomeAutoLoadInput): PublicMarketplaceResponse {
  const requestedNextPage = resolveRequestedPage(nextQuery, nextPayload);
  if (!previousPayload) {
    if (nextPayload.items.length === 0) {
      return normalizeTerminalPagination(nextPayload, Number(nextPayload.pagination.page || requestedNextPage));
    }
    return {
      ...nextPayload,
      pagination: normalizePageMetadata(nextPayload, requestedNextPage)
    };
  }

  const previousSignature = buildHomeQuerySignature(previousPayload.filters);
  const nextSignature = buildHomeQuerySignature(nextPayload.filters);
  if (previousSignature !== nextSignature) {
    return nextPayload;
  }

  const previousPage = Number(previousPayload.pagination.page || 1);
  const nextPage = requestedNextPage;
  if (!Number.isFinite(previousPage) || !Number.isFinite(nextPage)) {
    if (nextPayload.items.length === 0) {
      return normalizeTerminalPagination(nextPayload, requestedNextPage);
    }
    return {
      ...nextPayload,
      pagination: normalizePageMetadata(nextPayload, requestedNextPage)
    };
  }
  if (nextPage !== previousPage + 1) {
    if (nextPayload.items.length === 0) {
      return normalizeTerminalPagination(nextPayload, requestedNextPage);
    }
    return {
      ...nextPayload,
      pagination: normalizePageMetadata(nextPayload, requestedNextPage)
    };
  }

  if (nextPayload.items.length === 0) {
    const normalizedPayload = normalizeTerminalPagination(nextPayload, clampPage(previousPage));
    return {
      ...normalizedPayload,
      items: dedupeSkillsByID([...previousPayload.items])
    };
  }

  const mergedItems = dedupeSkillsByID([...previousPayload.items, ...nextPayload.items]);
  if (mergedItems.length === previousPayload.items.length) {
    const normalizedPayload = normalizeTerminalPagination(nextPayload, clampPage(previousPage));
    return {
      ...normalizedPayload,
      items: dedupeSkillsByID([...previousPayload.items])
    };
  }

  return {
    ...nextPayload,
    pagination: normalizePageMetadata(nextPayload, requestedNextPage),
    items: mergedItems
  };
}

export function groupCardsIntoRows<T>(cards: T[], cardsPerRow = 3): T[][] {
  const rowSize = Math.max(1, Math.floor(cardsPerRow));
  if (cards.length === 0) {
    return [];
  }

  const rows: T[][] = [];
  for (let index = 0; index < cards.length; index += rowSize) {
    rows.push(cards.slice(index, index + rowSize));
  }
  return rows;
}

export function computeVirtualRowWindow({
  totalRows,
  rowHeight,
  rowGap,
  overscanRows,
  viewportTop,
  viewportBottom
}: ComputeVirtualRowWindowInput): VirtualRowWindowState {
  if (totalRows <= 0) {
    return {
      startIndex: 0,
      endIndex: 0,
      paddingTop: 0,
      paddingBottom: 0
    };
  }

  const normalizedRowHeight = Math.max(1, clampToPositiveInteger(rowHeight));
  const normalizedRowGap = clampToPositiveInteger(rowGap);
  const normalizedOverscan = clampToPositiveInteger(overscanRows);
  const rowStride = normalizedRowHeight + normalizedRowGap;
  const totalHeight = calculateRowsBlockHeight(totalRows, normalizedRowHeight, normalizedRowGap);
  const boundedViewportTop = Math.max(0, Math.min(totalHeight, Number(viewportTop || 0)));
  const boundedViewportBottom = Math.max(boundedViewportTop, Math.min(totalHeight, Number(viewportBottom || 0)));

  const firstVisibleIndex = Math.min(totalRows - 1, Math.max(0, Math.floor(boundedViewportTop / rowStride)));
  const lastVisibleIndex = Math.min(totalRows - 1, Math.max(0, Math.floor(Math.max(0, boundedViewportBottom - 1) / rowStride)));
  const startIndex = Math.max(0, firstVisibleIndex - normalizedOverscan);
  const endIndex = Math.min(totalRows, lastVisibleIndex + normalizedOverscan + 1);
  const paddingTop = calculateRowsBlockHeight(startIndex, normalizedRowHeight, normalizedRowGap);
  const paddingBottom = calculateRowsBlockHeight(totalRows - endIndex, normalizedRowHeight, normalizedRowGap);

  return {
    startIndex,
    endIndex,
    paddingTop,
    paddingBottom
  };
}

export function canArmAutoLoadFromScrollState({
  scrollTop,
  scrollHeight,
  viewportHeight,
  triggerDistancePx
}: AutoLoadScrollReadinessInput): boolean {
  const normalizedScrollTop = Math.max(0, Number(scrollTop || 0));
  if (normalizedScrollTop > 0) {
    return true;
  }

  const normalizedViewportHeight = Math.max(0, Number(viewportHeight || 0));
  const normalizedScrollHeight = Math.max(0, Number(scrollHeight || 0));
  const normalizedTriggerDistance = Math.max(0, Number(triggerDistancePx || 0));

  return normalizedScrollHeight <= normalizedViewportHeight + normalizedTriggerDistance;
}
