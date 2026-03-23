"use client";

import { PublicLink } from "@/src/components/shared/PublicLink";

import { PublicMarketWebclientRegistration } from "@/src/components/shared/PublicMarketWebclientSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { formatPublicDate } from "@/src/lib/i18n/publicLocale";
import {
  resolveMarketplaceSkillCategoryLabel,
  resolveMarketplaceSkillSubcategoryLabel
} from "@/src/lib/marketplace/taxonomy";
import {
  publicCategoriesRoute,
  publicHomeRoute,
  publicSkillsRoutePrefix
} from "@/src/lib/routing/publicRouteRegistry";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicRankingResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";

import { MarketplaceRecentSearchesCard } from "./marketplace/MarketplaceRecentSearchesCard";
import { MarketplaceChipControlGroup } from "./marketplace/MarketplaceChipControlGroup";
import { MarketplaceCategoryLeadersList } from "./marketplace/MarketplaceCategoryLeadersList";
import { MarketplaceCompareForm } from "./marketplace/MarketplaceCompareForm";
import { MarketplaceCompareSelectionList } from "./marketplace/MarketplaceCompareSelectionList";
import { MarketplaceResultsStage } from "./marketplace/MarketplaceResultsStage";
import { MarketplaceSupportCard } from "./marketplace/MarketplaceSupportCard";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
import { formatCompactMarketplaceNumber } from "./marketplace/marketplaceViewModel";
import { usePublicSkillBatchWarmup } from "./marketplace/usePublicSkillBatchWarmup";
import { useMarketplaceTopbarSlots } from "./marketplace/useMarketplaceTopbarSlots";
import { buildPublicRankingPageModel } from "./publicRankingPageModel";

interface PublicRankingPageProps {
  ranking: PublicRankingResponse;
  sortKey: "stars" | "quality";
  comparePayload?: PublicSkillCompareResponse | null;
  leftSkillId?: number;
  rightSkillId?: number;
}

export function PublicRankingPage({
  ranking,
  sortKey,
  comparePayload = null,
  leftSkillId = 0,
  rightSkillId = 0
}: PublicRankingPageProps) {
  const { locale, messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const model = buildPublicRankingPageModel({
    ranking,
    sortKey,
    comparePayload,
    leftSkillId,
    rightSkillId,
    messages,
    resolvePath: toPublicPath
  });
  const shellSlots = useMarketplaceTopbarSlots({
    stageLabel: messages.stageRankings,
    variant: "market",
    belowContent: (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: toPublicPath(publicHomeRoute), label: messages.shellHome },
          { label: messages.rankingTitle, isCurrent: true }
        ]}
      />
    )
  });

  usePublicSkillBatchWarmup(model.skillWarmupTargets);

  return (
    <div className="marketplace-main-column marketplace-ranking-stage">
      <PublicMarketWebclientRegistration slots={shellSlots} />

      <section className="marketplace-section-card marketplace-ranking-panel">
        <div className="marketplace-ranking-head">
          <div className="marketplace-section-header">
            <p className="marketplace-kicker">{messages.shellRankings}</p>
            <h2>{messages.rankingTitle}</h2>
            <p>{messages.rankingDescription}</p>
          </div>
          <PublicLink href={publicCategoriesRoute} className="marketplace-topbar-button is-subtle">
            {messages.shellCategories}
          </PublicLink>
        </div>

        <div className="marketplace-ranking-summary-row" aria-label={messages.rankingTitle}>
          {model.summaryChips.map((chip) => (
            <span key={chip.key} className="marketplace-ranking-summary-chip">
              {chip.text}
            </span>
          ))}
        </div>

        <MarketplaceChipControlGroup
          label={messages.searchSortLabel}
          ariaLabel={messages.rankingTitle}
          role="group"
          inline
          className="marketplace-ranking-sort-row"
          rowClassName="marketplace-ranking-sort-tabs"
          items={model.sortItems}
        />
      </section>

      <MarketplaceResultsStage
        className="marketplace-ranking-layout"
        mainClassName="marketplace-ranking-main-column"
        layoutTestId="ranking-layout"
        mainTestId="ranking-main"
        sideTestId="ranking-support"
        mainContent={
          <>
            <section className="marketplace-section-card marketplace-ranking-section">
              <div className="marketplace-section-header">
                <h3>{messages.rankingTopHighlightsTitle}</h3>
                <p>{messages.rankingTopHighlightsDescription}</p>
              </div>

              <div className="marketplace-ranking-highlight-grid">
                {ranking.highlights.map((item, index) => (
                  <PublicLink
                    key={item.id}
                    href={`${publicSkillsRoutePrefix}/${item.id}`}
                    className="marketplace-ranking-highlight-card"
                    warmOnViewport
                  >
                    <article>
                      <div className="marketplace-ranking-highlight-head">
                        <span className={index === 0 ? "marketplace-ranking-rank-chip is-top" : "marketplace-ranking-rank-chip"}>
                          #{index + 1}
                        </span>
                        <span className="marketplace-meta-text">
                          {messages.rankingTopStarsPrefix} {formatCompactMarketplaceNumber(item.star_count)}
                        </span>
                      </div>
                      <h3 className="marketplace-skill-name">{item.name}</h3>
                      <p className="marketplace-skill-description">{item.description}</p>
                      <div className="marketplace-skill-chip-row">
                        <span className="marketplace-skill-chip">{resolveMarketplaceSkillCategoryLabel(item)}</span>
                        <span className="marketplace-skill-chip">{resolveMarketplaceSkillSubcategoryLabel(item)}</span>
                      </div>
                      <div className="marketplace-skill-row-foot">
                        <span className="is-primary">{item.quality_score.toFixed(1)}</span>
                        <span>
                          {messages.skillUpdatedPrefix} {formatPublicDate(item.updated_at, locale)}
                        </span>
                      </div>
                    </article>
                  </PublicLink>
                ))}
              </div>
            </section>

            <section className="marketplace-section-card marketplace-ranking-section">
              <div className="marketplace-section-header">
                <h3>{messages.rankingFullTitle}</h3>
                <p>{messages.rankingFullDescription}</p>
              </div>

              <div className="marketplace-ranking-table" role="table" aria-label={messages.rankingFullTitle}>
                <div className="marketplace-ranking-table-head" role="row">
                  <span>{messages.rankingRankPrefix}</span>
                  <span>{messages.rankingSkillColumn}</span>
                  <span>{messages.shellCategories}</span>
                  <span>{messages.statTopStars}</span>
                  <span>{messages.statTopQuality}</span>
                  <span>{messages.skillDetailFactUpdated}</span>
                  <span />
                </div>

                <div className="marketplace-ranking-table-body">
                  {model.displayItems.map((item, index) => (
                    <PublicLink
                      key={item.id}
                      href={`${publicSkillsRoutePrefix}/${item.id}`}
                      className="marketplace-ranking-table-row"
                      warmOnViewport
                    >
                      <span className={index === 0 ? "marketplace-ranking-rank-chip is-top" : "marketplace-ranking-rank-chip"}>
                        #{index + 1}
                      </span>
                      <span className="marketplace-ranking-table-skill">
                        <strong>{item.name}</strong>
                        <small>{item.description}</small>
                      </span>
                      <span className="marketplace-meta-text">
                        {resolveMarketplaceSkillCategoryLabel(item)} / {resolveMarketplaceSkillSubcategoryLabel(item)}
                      </span>
                      <span>{formatCompactMarketplaceNumber(item.star_count)}</span>
                      <span>{item.quality_score.toFixed(1)}</span>
                      <span className="marketplace-meta-text">{formatPublicDate(item.updated_at, locale)}</span>
                      <span className="marketplace-text-link">{messages.rankingOpenSkillLabel}</span>
                    </PublicLink>
                  ))}
                </div>
              </div>
            </section>
          </>
        }
        sideContent={
          <>
            <MarketplaceSupportCard
              title={messages.rankingCompareContextTitle}
              description={messages.rankingCompareContextDescription}
            >
              <MarketplaceCompareForm
                action={model.compareFormAction}
                items={model.compareFormItems}
                leftValue={model.compareFormLeftValue}
                rightValue={model.compareFormRightValue}
                leftAriaLabel={messages.rankingCompareLeftSkillAriaLabel}
                rightAriaLabel={messages.rankingCompareRightSkillAriaLabel}
                submitLabel={messages.rankingCompareButton}
                hiddenFields={model.compareHiddenFields}
              />

              <MarketplaceCompareSelectionList items={model.compareSelections} />
            </MarketplaceSupportCard>

            <MarketplaceSupportCard
              title={messages.rankingCategoryLeadersTitle}
              description={messages.rankingCategoryLeadersDescription}
            >
              <MarketplaceCategoryLeadersList
                leaders={model.categoryLeaders}
                skillCountSuffix={messages.skillCountSuffix}
                leadingSkillPrefix={messages.rankingLeadingSkillPrefix}
                averageQualityPrefix={messages.rankingAverageQualityPrefix}
              />
            </MarketplaceSupportCard>
            <MarketplaceRecentSearchesCard />
          </>
        }
      />
    </div>
  );
}
