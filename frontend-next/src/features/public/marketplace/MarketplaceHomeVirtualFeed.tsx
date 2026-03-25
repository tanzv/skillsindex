"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import type { MarketplaceSkill } from "@/src/lib/schemas/public";

import { MarketplaceHomeDeckCard } from "./MarketplaceHomeDeckCard";
import { computeMarketplaceVirtualWindow, groupMarketplaceRows } from "./marketplaceVirtualFeed";

const virtualizedRowThreshold = 8;
const homeRowHeight = 196;
const homeRowGap = 14;
const overscanRows = 2;

interface MarketplaceHomeVirtualFeedProps {
  featuredItems: MarketplaceSkill[];
  latestItems: MarketplaceSkill[];
  featuredTitle: string;
  featuredDescription: string;
  featuredChips: string[];
  latestTitle: string;
  latestDescription: string;
  latestChips: string[];
}

function MarketplaceHomeSectionEmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="marketplace-empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function MarketplaceHomeFeedToolbar({
  title,
  description,
  chips
}: {
  title: string;
  description: string;
  chips: string[];
}) {
  return (
    <section className="marketplace-home-results-toolbar">
      <div className="marketplace-section-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {chips.length > 0 ? (
        <div className="marketplace-home-toolbar-chips" aria-hidden="true">
          {chips.map((chip, index) => (
            <span key={`${title}-${chip}`} className={index === 0 ? "is-active" : undefined}>
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function MarketplaceHomeVirtualFeed({
  featuredItems,
  latestItems,
  featuredTitle,
  featuredDescription,
  featuredChips,
  latestTitle,
  latestDescription,
  latestChips
}: MarketplaceHomeVirtualFeedProps) {
  const { messages } = usePublicI18n();
  const latestListRef = useRef<HTMLElement | null>(null);
  const latestRows = useMemo(() => groupMarketplaceRows(latestItems, 3), [latestItems]);
  const [virtualWindow, setVirtualWindow] = useState({
    startIndex: 0,
    endIndex: latestRows.length,
    paddingTop: 0,
    paddingBottom: 0
  });
  const shouldVirtualizeRows = latestRows.length > virtualizedRowThreshold;

  useEffect(() => {
    if (!shouldVirtualizeRows) {
      return;
    }

    function updateVirtualWindow() {
      const listNode = latestListRef.current;
      if (!listNode) {
        return;
      }

      const rect = listNode.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      const viewportTop = Math.max(0, window.scrollY - absoluteTop);
      const viewportBottom = viewportTop + window.innerHeight;

      setVirtualWindow(
        computeMarketplaceVirtualWindow({
          totalRows: latestRows.length,
          rowHeight: homeRowHeight,
          rowGap: homeRowGap,
          overscanRows,
          viewportTop,
          viewportBottom
        })
      );
    }

    updateVirtualWindow();
    window.addEventListener("scroll", updateVirtualWindow, { passive: true });
    window.addEventListener("resize", updateVirtualWindow);

    return () => {
      window.removeEventListener("scroll", updateVirtualWindow);
      window.removeEventListener("resize", updateVirtualWindow);
    };
  }, [latestRows.length, shouldVirtualizeRows]);

  const resolvedVirtualWindow = shouldVirtualizeRows
    ? virtualWindow
    : {
        startIndex: 0,
        endIndex: latestRows.length,
        paddingTop: 0,
        paddingBottom: 0
      };
  const visibleRows = latestRows.slice(resolvedVirtualWindow.startIndex, resolvedVirtualWindow.endIndex);

  return (
    <div className="marketplace-home-feed" data-testid="landing-virtual-feed">
      <MarketplaceHomeFeedToolbar
        title={featuredTitle}
        description={featuredDescription}
        chips={featuredChips}
      />

      <section className="marketplace-results-row marketplace-featured-row" data-testid="landing-featured-grid">
        {featuredItems.length > 0 ? (
          featuredItems.map((item) => <MarketplaceHomeDeckCard key={`featured-${item.id}`} item={item} />)
        ) : (
          <MarketplaceHomeSectionEmptyState
            title={messages.resultsEmptyTitle}
            description={messages.resultsEmptyDescription}
          />
        )}
      </section>

      <MarketplaceHomeFeedToolbar
        title={latestTitle}
        description={latestDescription}
        chips={latestChips}
      />

      <section ref={latestListRef} className="marketplace-results-list" aria-label="results list" data-testid="landing-latest-rows">
        {latestRows.length > 0 ? (
          <>
            {resolvedVirtualWindow.paddingTop > 0 ? (
              <div style={{ height: `${resolvedVirtualWindow.paddingTop}px` }} aria-hidden="true" />
            ) : null}
            {visibleRows.map((row, localRowIndex) => {
              const rowIndex = resolvedVirtualWindow.startIndex + localRowIndex;

              return (
                <div key={`latest-row-${rowIndex}`} className="marketplace-results-row marketplace-latest-row">
                  {row.map((item) => (
                    <MarketplaceHomeDeckCard key={`latest-${rowIndex}-${item.id}`} item={item} />
                  ))}
                </div>
              );
            })}
            {resolvedVirtualWindow.paddingBottom > 0 ? (
              <div style={{ height: `${resolvedVirtualWindow.paddingBottom}px` }} aria-hidden="true" />
            ) : null}
          </>
        ) : (
          <MarketplaceHomeSectionEmptyState
            title={messages.resultsEmptyTitle}
            description={messages.resultsEmptyDescription}
          />
        )}
      </section>

    </div>
  );
}
