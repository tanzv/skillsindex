import { CSSProperties, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { PrototypeCardEntry } from "./MarketplaceHomePage.helpers";
import type { MarketplaceAutoLoadConfig } from "./MarketplaceHomePage.config";
import { MarketplaceText } from "./marketplaceText";
import { canArmAutoLoadFromScrollState, computeVirtualRowWindow, groupCardsIntoRows } from "./MarketplaceHomeAutoLoad.helpers";
import type { VirtualRowWindowState } from "./MarketplaceHomeAutoLoad.helpers";
import { resolveLatestRowsWindow, virtualizedRowThreshold } from "./MarketplaceHomeResultsContent.virtualization";
import MarketplaceHomeResultsEmptyState from "./MarketplaceHomeResultsEmptyState";

interface MarketplaceHomeResultsContentProps {
  isResultsPage: boolean;
  text: MarketplaceText;
  currentPage: number;
  totalPages: number;
  latestCards: PrototypeCardEntry[];
  featuredCards: PrototypeCardEntry[];
  autoLoadConfig: MarketplaceAutoLoadConfig;
  onPageChange: (page: number) => void;
  renderSkillCard: (card: PrototypeCardEntry, key: string) => JSX.Element;
}

function isResultsRoutePath(pathname: string): boolean {
  const normalizedPath = (String(pathname || "").trim().toLowerCase() || "/").replace(/\/+$/, "") || "/";
  return normalizedPath === "/results" || normalizedPath.endsWith("/results");
}

type AutoLoadVisualState = "idle" | "loading" | "completed";
const autoLoadCompletedDurationMs = 140;
const rowEnterAnimationDurationMs = 360;

export default function MarketplaceHomeResultsContent({
  isResultsPage,
  text,
  currentPage,
  totalPages,
  latestCards,
  featuredCards,
  autoLoadConfig,
  onPageChange,
  renderSkillCard
}: MarketplaceHomeResultsContentProps) {
  const {
    armDistancePx,
    triggerDistancePx,
    minimumLoadingDurationMs: minimumAutoLoadLoadingDurationMs
  } = autoLoadConfig;
  const autoLoadSentinelRef = useRef<HTMLDivElement | null>(null);
  const autoLoadTriggeredPageRef = useRef<number | null>(null);
  const autoLoadUnlockRef = useRef(true);
  const autoLoadVisualStateTimeoutRef = useRef<number | null>(null);
  const autoLoadLoadingStartedAtRef = useRef<number | null>(null);
  const autoLoadVisualStateRef = useRef<AutoLoadVisualState>("idle");
  const autoLoadProgressRef = useRef(0);
  const autoLoadHasScrolledRef = useRef(false);
  const latestListRef = useRef<HTMLElement | null>(null);
  const rowTransitionTimeoutRef = useRef<number | null>(null);
  const previousRowCountRef = useRef<number | null>(null);
  const [, forceAutoLoadVisualRender] = useReducer((value: number) => value + 1, 0);
  const [virtualWindow, setVirtualWindow] = useState<VirtualRowWindowState>({
    startIndex: 0,
    endIndex: 0,
    paddingTop: 0,
    paddingBottom: 0
  });
  const [newRowStartIndex, setNewRowStartIndex] = useState<number | null>(null);
  const latestRows = useMemo(() => groupCardsIntoRows(latestCards, 3), [latestCards]);
  const hasNoLatestCards = latestCards.length === 0;
  const shouldVirtualizeRows = !isResultsPage && latestRows.length > virtualizedRowThreshold;

  function setAutoLoadVisualState(nextState: AutoLoadVisualState) {
    if (autoLoadVisualStateRef.current === nextState) {
      return;
    }
    autoLoadVisualStateRef.current = nextState;
    if (nextState !== "loading") {
      autoLoadLoadingStartedAtRef.current = null;
    }
    forceAutoLoadVisualRender();
  }

  function clearAutoLoadVisualStateReset() {
    if (autoLoadVisualStateTimeoutRef.current !== null) {
      window.clearTimeout(autoLoadVisualStateTimeoutRef.current);
      autoLoadVisualStateTimeoutRef.current = null;
    }
  }

  function clearRowTransitionReset() {
    if (rowTransitionTimeoutRef.current !== null) {
      window.clearTimeout(rowTransitionTimeoutRef.current);
      rowTransitionTimeoutRef.current = null;
    }
  }

  function setAutoLoadProgress(nextProgress: number) {
    const clampedProgress = Math.max(0, Math.min(1, nextProgress));
    if (Math.abs(autoLoadProgressRef.current - clampedProgress) < 0.01) {
      return;
    }
    autoLoadProgressRef.current = clampedProgress;
    forceAutoLoadVisualRender();
  }

  function resetAutoLoadVisualState() {
    setAutoLoadVisualState("idle");
    setAutoLoadProgress(0);
  }

  function finalizeAutoLoadVisualState() {
    resetAutoLoadVisualState();
    if (isResultsPage || isResultsRoutePath(window.location.pathname)) {
      return;
    }
    window.requestAnimationFrame(() => {
      evaluateAutoLoadReadiness();
    });
  }

  function scheduleAutoLoadVisualStateReset(delayMs: number) {
    clearAutoLoadVisualStateReset();
    const normalizedDelayMs = Math.max(0, delayMs);
    autoLoadVisualStateTimeoutRef.current = window.setTimeout(() => {
      autoLoadVisualStateTimeoutRef.current = null;
      if (isResultsPage || isResultsRoutePath(window.location.pathname)) {
        finalizeAutoLoadVisualState();
        return;
      }
      setAutoLoadVisualState("completed");
      setAutoLoadProgress(1);
      autoLoadVisualStateTimeoutRef.current = window.setTimeout(() => {
        autoLoadVisualStateTimeoutRef.current = null;
        finalizeAutoLoadVisualState();
      }, autoLoadCompletedDurationMs);
    }, normalizedDelayMs);
  }

  function readScrollMetrics() {
    const scrollingElement = document.scrollingElement || document.documentElement;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const scrollTop = Number(scrollingElement?.scrollTop || 0);
    const scrollHeight = Number(scrollingElement?.scrollHeight || 0);
    return {
      viewportHeight,
      scrollTop,
      scrollHeight
    };
  }

  function getBottomDistance() {
    const { viewportHeight, scrollTop, scrollHeight } = readScrollMetrics();
    return Math.max(0, scrollHeight - (scrollTop + viewportHeight));
  }

  function triggerAutoLoad(fromPage: number): boolean {
    if (isResultsPage || isResultsRoutePath(window.location.pathname)) {
      return false;
    }
    if (hasNoLatestCards) {
      return false;
    }
    if (fromPage >= totalPages) {
      return false;
    }
    if (!autoLoadUnlockRef.current) {
      return false;
    }
    if (autoLoadTriggeredPageRef.current === fromPage) {
      return false;
    }
    clearAutoLoadVisualStateReset();
    autoLoadLoadingStartedAtRef.current = Date.now();
    setAutoLoadVisualState("loading");
    setAutoLoadProgress(1);
    autoLoadUnlockRef.current = false;
    autoLoadTriggeredPageRef.current = fromPage;
    onPageChange(fromPage + 1);
    return true;
  }

  function evaluateAutoLoadReadiness() {
    if (isResultsPage || isResultsRoutePath(window.location.pathname)) {
      autoLoadUnlockRef.current = true;
      setAutoLoadVisualState("idle");
      setAutoLoadProgress(0);
      return;
    }
    if (hasNoLatestCards) {
      autoLoadUnlockRef.current = false;
      autoLoadTriggeredPageRef.current = null;
      autoLoadHasScrolledRef.current = false;
      setAutoLoadVisualState("idle");
      setAutoLoadProgress(0);
      return;
    }
    const { scrollTop, scrollHeight, viewportHeight } = readScrollMetrics();
    if (
      canArmAutoLoadFromScrollState({
        scrollTop,
        scrollHeight,
        viewportHeight,
        triggerDistancePx
      })
    ) {
      autoLoadHasScrolledRef.current = true;
    }
    if (!autoLoadHasScrolledRef.current) {
      setAutoLoadVisualState("idle");
      setAutoLoadProgress(0);
      return;
    }
    if (currentPage >= totalPages) {
      if (autoLoadVisualStateRef.current !== "loading" && autoLoadVisualStateRef.current !== "completed") {
        setAutoLoadVisualState("idle");
      }
      setAutoLoadProgress(0);
      return;
    }
    const bottomDistance = getBottomDistance();
    const progress = 1 - Math.min(1, bottomDistance / armDistancePx);
    if (autoLoadVisualStateRef.current === "idle") {
      setAutoLoadProgress(progress);
    }
    if (bottomDistance > armDistancePx) {
      autoLoadUnlockRef.current = true;
      if (autoLoadVisualStateRef.current === "idle") {
        setAutoLoadVisualState("idle");
      }
      return;
    }
    if (autoLoadVisualStateRef.current === "loading" || autoLoadVisualStateRef.current === "completed") {
      return;
    }
    if (bottomDistance > triggerDistancePx) {
      setAutoLoadVisualState("idle");
      return;
    }
    if (!autoLoadUnlockRef.current) {
      return;
    }
    triggerAutoLoad(currentPage);
  }

  function resolveVirtualWindow() {
    if (!shouldVirtualizeRows || latestRows.length === 0) {
      setVirtualWindow({
        startIndex: 0,
        endIndex: latestRows.length,
        paddingTop: 0,
        paddingBottom: 0
      });
      return;
    }

    const listNode = latestListRef.current;
    if (!listNode) {
      return;
    }
    const rect = listNode.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;
    const viewportTop = window.scrollY - absoluteTop;
    const viewportBottom = window.scrollY + window.innerHeight - absoluteTop;
    const nextWindow = computeVirtualRowWindow({
      totalRows: latestRows.length,
      rowHeight: 168,
      rowGap: 14,
      overscanRows: 4,
      viewportTop,
      viewportBottom
    });
    setVirtualWindow((previous) => {
      if (
        previous.startIndex === nextWindow.startIndex &&
        previous.endIndex === nextWindow.endIndex &&
        previous.paddingTop === nextWindow.paddingTop &&
        previous.paddingBottom === nextWindow.paddingBottom
      ) {
        return previous;
      }
      return nextWindow;
    });
  }

  useEffect(() => {
    if (isResultsPage || hasNoLatestCards || isResultsRoutePath(window.location.pathname)) {
      return;
    }

    function handleScrollAutoLoad() {
      evaluateAutoLoadReadiness();
    }

    window.addEventListener("scroll", handleScrollAutoLoad, { passive: true });
    evaluateAutoLoadReadiness();
    return () => {
      window.removeEventListener("scroll", handleScrollAutoLoad);
    };
  }, [isResultsPage, hasNoLatestCards, currentPage, totalPages]);

  useEffect(
    () => () => {
      clearAutoLoadVisualStateReset();
      clearRowTransitionReset();
    },
    []
  );

  useEffect(() => {
    if (!hasNoLatestCards) {
      return;
    }
    clearAutoLoadVisualStateReset();
    autoLoadTriggeredPageRef.current = null;
    autoLoadUnlockRef.current = false;
    autoLoadHasScrolledRef.current = false;
    resetAutoLoadVisualState();
  }, [hasNoLatestCards]);

  useEffect(() => {
    if (isResultsPage || hasNoLatestCards || isResultsRoutePath(window.location.pathname)) {
      return;
    }
    const triggeredPage = autoLoadTriggeredPageRef.current;
    if (triggeredPage === null || currentPage <= triggeredPage) {
      return;
    }
    autoLoadTriggeredPageRef.current = null;
    const loadingStartedAt = autoLoadLoadingStartedAtRef.current;
    const elapsedLoadingMs = loadingStartedAt === null ? minimumAutoLoadLoadingDurationMs : Date.now() - loadingStartedAt;
    const remainingLoadingMs = Math.max(0, minimumAutoLoadLoadingDurationMs - elapsedLoadingMs);
    autoLoadUnlockRef.current = true;
    clearAutoLoadVisualStateReset();
    scheduleAutoLoadVisualStateReset(remainingLoadingMs);
  }, [isResultsPage, hasNoLatestCards, currentPage, minimumAutoLoadLoadingDurationMs]);

  useEffect(() => {
    if (isResultsPage) {
      setNewRowStartIndex(null);
      previousRowCountRef.current = latestRows.length;
      return;
    }

    const previousRowCount = previousRowCountRef.current;
    if (previousRowCount === null) {
      previousRowCountRef.current = latestRows.length;
      return;
    }

    if (latestRows.length > previousRowCount) {
      setNewRowStartIndex(previousRowCount);
      clearRowTransitionReset();
      rowTransitionTimeoutRef.current = window.setTimeout(() => {
        rowTransitionTimeoutRef.current = null;
        setNewRowStartIndex(null);
      }, rowEnterAnimationDurationMs);
    } else if (latestRows.length < previousRowCount) {
      setNewRowStartIndex(null);
      clearRowTransitionReset();
    }

    previousRowCountRef.current = latestRows.length;
  }, [isResultsPage, latestRows.length]);

  useEffect(() => {
    if (isResultsPage || hasNoLatestCards || currentPage >= totalPages || isResultsRoutePath(window.location.pathname)) {
      if (
        currentPage >= totalPages &&
        autoLoadVisualStateRef.current !== "loading" &&
        autoLoadVisualStateRef.current !== "completed"
      ) {
        setAutoLoadVisualState("idle");
      }
      return;
    }

    const sentinelNode = autoLoadSentinelRef.current;
    if (!sentinelNode) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }
        if (isResultsRoutePath(window.location.pathname)) {
          return;
        }
        evaluateAutoLoadReadiness();
      },
      {
        root: null,
        threshold: 0.35,
        rootMargin: "0px 0px 260px 0px"
      }
    );

    observer.observe(sentinelNode);
    return () => {
      observer.disconnect();
    };
  }, [isResultsPage, hasNoLatestCards, currentPage, totalPages, onPageChange]);

  useEffect(() => {
    resolveVirtualWindow();
  }, [shouldVirtualizeRows, latestRows.length]);

  useEffect(() => {
    if (!shouldVirtualizeRows) {
      return;
    }

    function handleVirtualWindowUpdate() {
      resolveVirtualWindow();
    }

    window.addEventListener("scroll", handleVirtualWindowUpdate, { passive: true });
    window.addEventListener("resize", handleVirtualWindowUpdate);
    handleVirtualWindowUpdate();
    return () => {
      window.removeEventListener("scroll", handleVirtualWindowUpdate);
      window.removeEventListener("resize", handleVirtualWindowUpdate);
    };
  }, [shouldVirtualizeRows, latestRows.length]);

  const autoLoadState = autoLoadVisualStateRef.current;
  const autoLoadProgressValue = Number(autoLoadProgressRef.current.toFixed(3));
  const hasReachedLastPage = currentPage >= totalPages;
  const showNoMoreDataHint = !hasNoLatestCards && hasReachedLastPage;
  const autoLoadProgressStyle = {
    "--marketplace-auto-load-progress": String(autoLoadProgressValue)
  } as CSSProperties;
  const autoLoadHintText =
    autoLoadState === "loading"
      ? text.loadMoreLoadingHint
      : autoLoadState === "completed"
        ? text.loadMoreSuccessHint
        : text.loadMoreHint;
  const latestRowsWindow = resolveLatestRowsWindow({
    isResultsPage,
    shouldVirtualizeRows,
    latestRowsLength: latestRows.length,
    virtualWindow
  });
  const visibleLatestRows = latestRows.slice(latestRowsWindow.startIndex, latestRowsWindow.endIndex);
  const virtualPaddingTop = latestRowsWindow.paddingTop;
  const virtualPaddingBottom = latestRowsWindow.paddingBottom;

  function renderLatestRow(rowCards: PrototypeCardEntry[], rowIndex: number, keyPrefix: "latest-row" | "results-row") {
    const isNewRow = !isResultsPage && newRowStartIndex !== null && rowIndex >= newRowStartIndex;
    return (
      <div
        key={`${keyPrefix}-${rowIndex}`}
        className={`marketplace-results-row marketplace-latest-row row-${(rowIndex % 4) + 1}${isNewRow ? " is-new-row" : ""}`}
      >
        {rowCards.map((card, cardIndex) => renderSkillCard(card, `${keyPrefix}-${rowIndex + 1}-${card.title}-${cardIndex}`))}
      </div>
    );
  }

  return (
    <>
      {isResultsPage ? (
        <>
          <section className="marketplace-results-toolbar">
            <h2>{text.latestTitle}</h2>
            <div className="marketplace-toolbar-chips">
              <span className="is-active">{text.latestSortLabel}</span>
              <span>{text.batchInstallLabel}</span>
              <span>{text.compareLabel}</span>
            </div>
          </section>

          <section className="marketplace-results-list" aria-label="results list">
            {hasNoLatestCards ? (
              <MarketplaceHomeResultsEmptyState title={text.noResultsTitle} hint={text.noResultsHint} />
            ) : (
              latestRows.map((rowCards, rowIndex) => renderLatestRow(rowCards, rowIndex, "results-row"))
            )}
          </section>
        </>
      ) : (
        <>
          <section className="marketplace-results-toolbar">
            <h2>{text.curatedTitle}</h2>
            <div className="marketplace-toolbar-chips">
              <span className="is-active">{text.installableLabel}</span>
              <span>{text.verifiedLabel}</span>
              <span>{text.updatedLabel}</span>
              <span>{text.pressHintLabel}</span>
            </div>
          </section>

          <section className="marketplace-results-row marketplace-featured-row">
            {featuredCards.map((card, cardIndex) => renderSkillCard(card, `featured-${card.title}-${cardIndex}`))}
          </section>

          <section className="marketplace-results-toolbar">
            <h2>{text.latestTitle}</h2>
            <div className="marketplace-toolbar-chips">
              <span className="is-active">{text.latestSortLabel}</span>
              <span>{text.batchInstallLabel}</span>
              <span>{text.compareLabel}</span>
            </div>
          </section>

          <section ref={latestListRef} className="marketplace-results-list" aria-label="results list">
            {hasNoLatestCards ? (
              <MarketplaceHomeResultsEmptyState title={text.noResultsTitle} hint={text.noResultsHint} />
            ) : (
              <>
                {virtualPaddingTop > 0 ? <div style={{ height: `${virtualPaddingTop}px` }} aria-hidden="true" /> : null}
                {visibleLatestRows.map((rowCards, rowIndex) =>
                  renderLatestRow(rowCards, latestRowsWindow.startIndex + rowIndex, "latest-row")
                )}
                {virtualPaddingBottom > 0 ? <div style={{ height: `${virtualPaddingBottom}px` }} aria-hidden="true" /> : null}
              </>
            )}
          </section>
        </>
      )}

      <section className="marketplace-pagination-shell">
        {hasNoLatestCards ? (
          <div className="marketplace-pagination-empty-hint" data-testid="marketplace-pagination-empty-hint" role="status" aria-live="polite">
            <strong>{text.noResultsTitle}</strong>
            <span>{text.noResultsHint}</span>
          </div>
        ) : showNoMoreDataHint ? (
          <div
            className="marketplace-pagination-empty-hint"
            data-testid="marketplace-pagination-finished-hint"
            role="status"
            aria-live="polite"
          >
            <strong>{text.loadMoreFinishedTitle}</strong>
            <span>{text.loadMoreFinishedHint}</span>
          </div>
        ) : (
          <div
            ref={autoLoadSentinelRef}
            className={`marketplace-pagination-load-more is-${autoLoadState}`}
            data-state={autoLoadState}
            data-testid="marketplace-pagination-auto-load"
            role="status"
            aria-live="polite"
            aria-busy={autoLoadState === "loading" ? "true" : "false"}
            aria-label={autoLoadHintText}
            data-progress={String(autoLoadProgressValue)}
            style={autoLoadProgressStyle}
          >
            <span className="marketplace-pagination-load-indicator" aria-hidden="true">
              <span className="marketplace-pagination-loading-arrow">{"\u2193"}</span>
              <span className="marketplace-pagination-loading-ring" />
              <span className="marketplace-pagination-loading-dots">
                <span />
                <span />
                <span />
              </span>
            </span>
            <span className="marketplace-visually-hidden">{`${text.loadMore} ${autoLoadHintText}`}</span>
          </div>
        )}
      </section>
    </>
  );
}
