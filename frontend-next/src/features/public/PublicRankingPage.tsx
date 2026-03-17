"use client";

import Link from "next/link";

import { PublicShellRegistration } from "@/src/components/shared/PublicShellSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { formatPublicDate } from "@/src/lib/i18n/publicLocale";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";

import { MarketplaceRecentSearchesCard } from "./marketplace/MarketplaceRecentSearchesCard";
import { formatCompactMarketplaceNumber } from "./marketplace/marketplaceViewModel";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
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
  const { leftSkill, rightSkill } = resolveComparedSkills(marketplace, comparePayload, leftSkillId, rightSkillId);
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
          <Link href={toPublicPath("/categories")} className="marketplace-topbar-button is-subtle">
            {messages.shellCategories}
          </Link>
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

        <div className="marketplace-ranking-sort-row" role="group" aria-label={messages.rankingTitle}>
          <span className="marketplace-control-label">{messages.searchSortLabel}</span>
          <div className="marketplace-ranking-sort-tabs">
            <Link
              href={buildRankingHref("stars")}
              aria-current={sortKey === "stars" ? "page" : undefined}
              className={`marketplace-chip-control${sortKey === "stars" ? " is-active" : ""}`}
            >
              {messages.rankingSortByStars}
            </Link>
            <Link
              href={buildRankingHref("quality")}
              aria-current={sortKey === "quality" ? "page" : undefined}
              className={`marketplace-chip-control${sortKey === "quality" ? " is-active" : ""}`}
            >
              {messages.rankingSortByQuality}
            </Link>
          </div>
        </div>
      </section>

      <div className="marketplace-results-layout marketplace-ranking-layout" data-testid="ranking-layout">
        <div className="marketplace-main-column marketplace-ranking-main-column" data-testid="ranking-main">
          <section className="marketplace-section-card marketplace-ranking-section">
            <div className="marketplace-section-header">
              <h3>{messages.rankingTopHighlightsTitle}</h3>
              <p>{messages.rankingTopHighlightsDescription}</p>
            </div>

            <div className="marketplace-ranking-highlight-grid">
              {ranking.highlights.map((item, index) => (
                <Link key={item.id} href={toPublicPath(`/skills/${item.id}`)} className="marketplace-ranking-highlight-card">
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
                </Link>
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
                  <Link key={item.id} href={toPublicPath(`/skills/${item.id}`)} className="marketplace-ranking-table-row">
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
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="marketplace-side-column" data-testid="ranking-support">
          <section className="marketplace-section-card">
            <div className="marketplace-section-header">
              <h3>{messages.rankingCompareContextTitle}</h3>
              <p>{messages.rankingCompareContextDescription}</p>
            </div>

            <form action={toPublicPath("/rankings")} className="marketplace-compare-form">
              <input type="hidden" name="sort" value={sortKey} />
              <select
                name="left"
                defaultValue={String(leftSkill?.id || leftSkillId || ranking.rankedItems[0]?.id || "")}
                aria-label={messages.rankingCompareLeftSkillAriaLabel}
              >
                {marketplace.items.map((item) => (
                  <option key={`left-${item.id}`} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                name="right"
                defaultValue={String(rightSkill?.id || rightSkillId || ranking.rankedItems[1]?.id || "")}
                aria-label={messages.rankingCompareRightSkillAriaLabel}
              >
                {marketplace.items.map((item) => (
                  <option key={`right-${item.id}`} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <button className="marketplace-search-submit">{messages.rankingCompareButton}</button>
            </form>

            <div className="marketplace-list-stack">
              {[leftSkill, rightSkill].map((skill, index) =>
                skill ? (
                  <div key={`${skill.id}-${index}`} className="marketplace-compare-card">
                    <p className="marketplace-kicker">
                      {index === 0 ? messages.rankingCompareLeftLabel : messages.rankingCompareRightLabel}
                    </p>
                    <h3 className="marketplace-skill-name">{skill.name}</h3>
                    <p className="marketplace-skill-description">{skill.description}</p>
                    <div className="marketplace-compare-metrics">
                      <span className="marketplace-skill-chip">{resolveMarketplaceSkillCategoryLabel(skill)}</span>
                      <span className="marketplace-skill-chip">
                        {skill.star_count} {messages.skillStarsSuffix}
                      </span>
                      <span className="marketplace-skill-chip">
                        {skill.quality_score.toFixed(1)} {messages.skillQualitySuffix}
                      </span>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </section>

          <section className="marketplace-section-card">
            <div className="marketplace-section-header">
              <h3>{messages.rankingCategoryLeadersTitle}</h3>
              <p>{messages.rankingCategoryLeadersDescription}</p>
            </div>
            <div className="marketplace-list-stack">
              {ranking.categoryLeaders.map((leader) => (
                <div key={leader.category} className="marketplace-compare-card">
                  <div className="marketplace-simple-link-item">
                    <span className="marketplace-sidebar-link">{leader.category}</span>
                    <span className="marketplace-meta-text">
                      {leader.count} {messages.skillCountSuffix}
                    </span>
                  </div>
                  <p className="marketplace-meta-text">
                    {messages.rankingLeadingSkillPrefix}: {leader.leadingSkillName}
                  </p>
                  <p className="marketplace-meta-text">
                    {messages.rankingAverageQualityPrefix} {leader.averageQuality.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <MarketplaceRecentSearchesCard
            fallbackLinks={[
              { href: "/results?q=release", label: "release" },
              { href: "/categories", label: messages.shellCategories },
              { href: "/", label: messages.shellHome }
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
