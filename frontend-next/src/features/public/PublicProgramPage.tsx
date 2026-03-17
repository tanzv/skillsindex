"use client";

import Link from "next/link";
import { useMemo } from "react";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { formatPublicDate } from "@/src/lib/i18n/publicLocale";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { PublicNarrativeStage } from "./PublicNarrativeStage";
import type { PublicProgramPageKey } from "./publicProgramModel";
import { resolvePublicProgramDescriptor } from "./publicProgramModel";
import { MarketplaceSkillCard } from "./marketplace/MarketplaceSkillCard";
import {
  formatCompactMarketplaceNumber,
  resolveFeaturedMarketplaceItems,
  resolveLatestMarketplaceItems
} from "./marketplace/marketplaceViewModel";

interface PublicProgramPageProps {
  pageKey: PublicProgramPageKey;
  marketplace: PublicMarketplaceResponse;
}

export function PublicProgramPage({ pageKey, marketplace }: PublicProgramPageProps) {
  const { locale, messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const descriptor = resolvePublicProgramDescriptor(messages, pageKey);
  const featuredItems = useMemo(() => resolveFeaturedMarketplaceItems(marketplace.items, 3), [marketplace.items]);
  const latestItems = useMemo(() => resolveLatestMarketplaceItems(marketplace.items, 4), [marketplace.items]);
  const leadingSkill = featuredItems[0] || latestItems[0] || marketplace.items[0] || null;
  const topCategories = marketplace.categories.slice(0, 4);
  const topTags = marketplace.top_tags.slice(0, 6);

  const stats = useMemo(
    () => [
      {
        label: messages.statTotalSkills,
        value: formatCompactMarketplaceNumber(marketplace.stats.total_skills),
        detail: messages.metricPublicAssets
      },
      {
        label: messages.statCategories,
        value: formatCompactMarketplaceNumber(marketplace.categories.length),
        detail: messages.metricCategoryFamilies
      },
      {
        label: messages.statTopTags,
        value: formatCompactMarketplaceNumber(marketplace.top_tags.length),
        detail: messages.metricTopTagPivots
      },
      {
        label: messages.statTopStars,
        value: leadingSkill ? formatCompactMarketplaceNumber(leadingSkill.star_count) : "0",
        detail: leadingSkill ? leadingSkill.name : messages.resultsEmptyTitle
      }
    ],
    [
      leadingSkill,
      marketplace.categories.length,
      marketplace.stats.total_skills,
      marketplace.top_tags.length,
      messages.metricCategoryFamilies,
      messages.metricPublicAssets,
      messages.metricTopTagPivots,
      messages.resultsEmptyTitle,
      messages.statCategories,
      messages.statTopStars,
      messages.statTopTags,
      messages.statTotalSkills
    ]
  );

  const mainSections = useMemo(() => {
    const primaryItems = pageKey === "about" ? featuredItems : latestItems;
    const primaryTitle = pageKey === "timeline" ? messages.landingLatestTitle : messages.landingCuratedTitle;
    const primaryDescription =
      pageKey === "timeline"
        ? messages.landingLatestDescription
        : pageKey === "rollout"
          ? messages.rankingTopHighlightsDescription
          : messages.landingCuratedDescription;

    return [
      {
        key: `${pageKey}-skills`,
        title: primaryTitle,
        description: primaryDescription,
        content: (
          <div className="marketplace-list-stack">
            {primaryItems.map((item) => (
              <MarketplaceSkillCard key={item.id} item={item} />
            ))}
          </div>
        ),
        emphasis: true,
        testId: `public-program-${pageKey}-skills`
      },
      {
        key: `${pageKey}-categories`,
        title: pageKey === "governance" ? messages.rankingCategoryLeadersTitle : messages.landingCategoriesTitle,
        description:
          pageKey === "governance" ? messages.rankingCategoryLeadersDescription : messages.resultsCategoryPivotsDescription,
        content: (
          <div className="marketplace-simple-link-list">
            {topCategories.map((category) => (
              <Link
                key={category.slug}
                href={toPublicPath(`/categories/${category.slug}`)}
                className="marketplace-simple-link-item"
              >
                <span className="marketplace-sidebar-link">{category.name}</span>
                <span className="marketplace-meta-text">
                  {category.count} {messages.skillCountSuffix}
                </span>
              </Link>
            ))}
          </div>
        ),
        testId: `public-program-${pageKey}-categories`
      }
    ];
  }, [
    featuredItems,
    latestItems,
    messages.landingCategoriesTitle,
    messages.landingCuratedDescription,
    messages.landingCuratedTitle,
    messages.landingLatestDescription,
    messages.landingLatestTitle,
    messages.rankingCategoryLeadersDescription,
    messages.rankingCategoryLeadersTitle,
    messages.rankingTopHighlightsDescription,
    messages.resultsCategoryPivotsDescription,
    messages.skillCountSuffix,
    pageKey,
    toPublicPath,
    topCategories
  ]);

  const sideSections = useMemo(
    () => [
      {
        key: `${pageKey}-continue`,
        title: messages.programContinueTitle,
        description: messages.landingContinueDescription,
        content: (
          <div className="marketplace-simple-link-list">
            <Link href={toPublicPath("/")} className="marketplace-simple-link-item">
              <span className="marketplace-sidebar-link">{messages.shellHome}</span>
              <span className="marketplace-meta-text">{messages.stageLanding}</span>
            </Link>
            <Link href={toPublicPath("/categories")} className="marketplace-simple-link-item">
              <span className="marketplace-sidebar-link">{messages.landingContinueCategories}</span>
              <span className="marketplace-meta-text">{messages.shellCategories}</span>
            </Link>
            <Link href={toPublicPath("/rankings")} className="marketplace-simple-link-item">
              <span className="marketplace-sidebar-link">{messages.landingContinueRankings}</span>
              <span className="marketplace-meta-text">{messages.shellRankings}</span>
            </Link>
            <Link href="/workspace" className="marketplace-simple-link-item">
              <span className="marketplace-sidebar-link">{messages.shellWorkspace}</span>
              <span className="marketplace-meta-text">{messages.stageAccess}</span>
            </Link>
          </div>
        ),
        testId: `public-program-${pageKey}-continue`
      },
      {
        key: `${pageKey}-signals`,
        title: messages.resultsDiscoveryNotesTitle,
        description: pageKey === "timeline" ? messages.timelineDescription : messages.resultsDiscoveryNotesDescription,
        content: (
          <div className="marketplace-list-stack">
            {topTags.map((tag) => (
              <div key={tag.name} className="marketplace-compare-card">
                <div className="marketplace-simple-link-item">
                  <span className="marketplace-sidebar-link">{tag.name}</span>
                  <span className="marketplace-meta-text">
                    {tag.count} {messages.skillCountSuffix}
                  </span>
                </div>
              </div>
            ))}
            {leadingSkill ? (
              <div className="marketplace-compare-card">
                <p className="marketplace-kicker">{messages.skillUpdatedPrefix}</p>
                <h3 className="marketplace-skill-name">{leadingSkill.name}</h3>
                <p className="marketplace-skill-description">{formatPublicDate(leadingSkill.updated_at, locale)}</p>
              </div>
            ) : null}
          </div>
        ),
        testId: `public-program-${pageKey}-signals`
      }
    ],
    [
      leadingSkill,
      locale,
      messages.landingContinueCategories,
      messages.landingContinueDescription,
      messages.landingContinueRankings,
      messages.programContinueTitle,
      messages.resultsDiscoveryNotesDescription,
      messages.resultsDiscoveryNotesTitle,
      messages.shellCategories,
      messages.shellHome,
      messages.shellRankings,
      messages.shellWorkspace,
      messages.skillCountSuffix,
      messages.skillUpdatedPrefix,
      messages.stageAccess,
      messages.stageLanding,
      messages.timelineDescription,
      pageKey,
      toPublicPath,
      topTags
    ]
  );

  return (
    <PublicNarrativeStage
      testId={`public-program-${pageKey}`}
      eyebrow={messages.stageMarketplace}
      title={descriptor.title}
      description={descriptor.description}
      stats={stats}
      mainSections={mainSections}
      sideSections={sideSections}
      beforeSections={
        <nav className="marketplace-breadcrumb" aria-label={messages.categoryBreadcrumbAriaLabel}>
          <Link href={toPublicPath("/")} className="marketplace-breadcrumb-link">
            {messages.shellHome}
          </Link>
          <span className="marketplace-breadcrumb-separator">/</span>
          <span className="marketplace-breadcrumb-current">{descriptor.title}</span>
        </nav>
      }
    />
  );
}
