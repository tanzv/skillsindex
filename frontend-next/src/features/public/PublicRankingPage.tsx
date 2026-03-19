"use client";

import { PublicLink } from "@/src/components/shared/PublicLink";

import { PublicShellRegistration } from "@/src/components/shared/PublicShellSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { formatPublicDate } from "@/src/lib/i18n/publicLocale";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";

import { MarketplaceRecentSearchesCard } from "./marketplace/MarketplaceRecentSearchesCard";
import { MarketplaceChipControlGroup } from "./marketplace/MarketplaceChipControlGroup";
import { MarketplaceCategoryLeadersList } from "./marketplace/MarketplaceCategoryLeadersList";
import { MarketplaceCompareForm } from "./marketplace/MarketplaceCompareForm";
import { MarketplaceCompareSelectionList } from "./marketplace/MarketplaceCompareSelectionList";
import { MarketplaceResultsStage } from "./marketplace/MarketplaceResultsStage";
import { MarketplaceSupportCard } from "./marketplace/MarketplaceSupportCard";
import { buildPublicSkillBatchWarmupTargets } from "./marketplace/publicSkillBatchWarmup";
import { formatCompactMarketplaceNumber } from "./marketplace/marketplaceViewModel";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
import { usePublicSkillBatchWarmup } from "./marketplace/usePublicSkillBatchWarmup";
import { useMarketplaceTopbarSlots } from "./marketplace/useMarketplaceTopbarSlots";
import { buildPublicRankingModel, type RankingSortKey } from "./publicRankingModel";
import { resolveMarketplaceSkillCategoryLabel, resolveMarketplaceSkillSubcategoryLabel } from "./marketplace/marketplaceTaxonomy";
import { resolveComparedSkills } from "./publicCompareModel";

interface PublicRankingPageProps {
  marketplace: PublicMarketplaceResponse;
  sortKey: RankingSortKey;
  comparePayload?: PublicSkillCompareResponse | null;
  leftSkillId?: number;
  rightSkillId?: number;
}

export function PublicRankingPage({
  marketplace,
  sortKey,
  comparePayload = null,
  leftSkillId = 0,
  rightSkillId = 0
}: PublicRankingPageProps) {
  const { locale, messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const ranking = buildPublicRankingModel(marketplace, sortKey);
  const skillWarmupTargets = buildPublicSkillBatchWarmupTargets(ranking.highlights.concat(ranking.listItems), toPublicPath);
  const { leftSkill, rightSkill } = resolveComparedSkills(marketplace, comparePayload, leftSkillId, rightSkillId);
  const compareSelections = [leftSkill, rightSkill].flatMap((skill, index) =>
    skill
      ? [
          {
            key: `${skill.id}-${index}`,
            label: index === 0 ? messages.rankingCompareLeftLabel : messages.rankingCompareRightLabel,
            title: skill.name,
            description: skill.description,
            metrics: [
              resolveMarketplaceSkillCategoryLabel(skill),
              `${skill.star_count} ${messages.skillStarsSuffix}`,
              `${skill.quality_score.toFixed(1)} ${messages.skillQualitySuffix}`
            ]
          }
        ]
      : []
  );
  const shellSlots = useMarketplaceTopbarSlots({
    stageLabel: messages.stageRankings,
    variant: "market",
    belowContent: (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: toPublicPath("/"), label: messages.shellHome },
          { label: messages.rankingTitle, isCurrent: true }
        ]}
      />
    )
  });

  function buildRankingHref(nextSortKey: RankingSortKey): string {
    const params = new URLSearchParams();
    if (nextSortKey !== "stars") {
      params.set("sort", nextSortKey);
    }
    if (leftSkill && rightSkill && leftSkill.id !== rightSkill.id) {
      params.set("left", String(leftSkill.id));
      params.set("right", String(rightSkill.id));
    }
    const query = params.toString();
    return query ? `${toPublicPath("/rankings")}?${query}` : toPublicPath("/rankings");
  }

  usePublicSkillBatchWarmup(skillWarmupTargets);

  return (
    <div className="marketplace-main-column marketplace-ranking-stage">
      <PublicShellRegistration slots={shellSlots} />

      <section className="marketplace-section-card marketplace-ranking-panel">
        <div className="marketplace-ranking-head">
          <div className="marketplace-section-header">
            <p className="marketplace-kicker">{messages.shellRankings}</p>
            <h2>{messages.rankingTitle}</h2>
            <p>{messages.rankingDescription}</p>
          </div>
          <PublicLink href="/categories" className="marketplace-topbar-button is-subtle">
            {messages.shellCategories}
          </PublicLink>
        </div>

        <div className="marketplace-ranking-summary-row" aria-label={messages.rankingTitle}>
          <span className="marketplace-ranking-summary-chip">
            {ranking.summary.totalCompared} {messages.rankingComparedSuffix}
          </span>
          <span className="marketplace-ranking-summary-chip">
            {messages.rankingTopStarsPrefix} {formatCompactMarketplaceNumber(ranking.summary.topStars)}
          </span>
          <span className="marketplace-ranking-summary-chip">
            {messages.statTopQuality} {ranking.summary.topQuality.toFixed(1)}
          </span>
          <span className="marketplace-ranking-summary-chip">
            {messages.rankingAverageQualityPrefix} {ranking.summary.averageQuality.toFixed(1)}
          </span>
        </div>

        <MarketplaceChipControlGroup
          label={messages.searchSortLabel}
          ariaLabel={messages.rankingTitle}
          role="group"
          inline
          className="marketplace-ranking-sort-row"
          rowClassName="marketplace-ranking-sort-tabs"
          items={[
            {
              key: "ranking-sort-stars",
              href: buildRankingHref("stars"),
              label: messages.rankingSortByStars,
              isActive: sortKey === "stars"
            },
            {
              key: "ranking-sort-quality",
              href: buildRankingHref("quality"),
              label: messages.rankingSortByQuality,
              isActive: sortKey === "quality"
            }
          ]}
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
                  <PublicLink key={item.id} href={`/skills/${item.id}`} className="marketplace-ranking-highlight-card" warmOnViewport>
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
                  {ranking.highlights.concat(ranking.listItems).map((item, index) => (
                    <PublicLink key={item.id} href={`/skills/${item.id}`} className="marketplace-ranking-table-row" warmOnViewport>
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
                action={toPublicPath("/rankings")}
                items={marketplace.items.map((item) => ({ id: item.id, name: item.name }))}
                leftValue={String(leftSkill?.id || leftSkillId || ranking.rankedItems[0]?.id || "")}
                rightValue={String(rightSkill?.id || rightSkillId || ranking.rankedItems[1]?.id || "")}
                leftAriaLabel={messages.rankingCompareLeftSkillAriaLabel}
                rightAriaLabel={messages.rankingCompareRightSkillAriaLabel}
                submitLabel={messages.rankingCompareButton}
                hiddenFields={[{ name: "sort", value: sortKey }]}
              />

              <MarketplaceCompareSelectionList items={compareSelections} />
            </MarketplaceSupportCard>

            <MarketplaceSupportCard
              title={messages.rankingCategoryLeadersTitle}
              description={messages.rankingCategoryLeadersDescription}
            >
              <MarketplaceCategoryLeadersList
                leaders={ranking.categoryLeaders}
                skillCountSuffix={messages.skillCountSuffix}
                leadingSkillPrefix={messages.rankingLeadingSkillPrefix}
                averageQualityPrefix={messages.rankingAverageQualityPrefix}
              />
            </MarketplaceSupportCard>

            <MarketplaceRecentSearchesCard
              fallbackLinks={[
                { href: "/results?q=release", label: "release" },
                { href: "/categories", label: messages.shellCategories },
                { href: "/", label: messages.shellHome }
              ]}
            />
          </>
        }
      />
    </div>
  );
}
