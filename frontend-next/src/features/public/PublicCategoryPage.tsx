"use client";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { PublicShellRegistration } from "@/src/components/shared/PublicShellSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicViewerSession } from "@/src/features/public/PublicViewerSessionProvider";
import { usePublicLoginTarget } from "@/src/lib/auth/usePublicLoginTarget";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { MarketplaceCategoryRail } from "./marketplace/MarketplaceCategoryRail";
import { MarketplaceCategorySkillCard } from "./marketplace/MarketplaceCategorySkillCard";
import { MarketplaceChipControlGroup } from "./marketplace/MarketplaceChipControlGroup";
import { MarketplaceCategoryCollectionCard } from "./marketplace/MarketplaceCategoryCollectionCard";
import {
  buildCategoryHubAudienceHref,
  MarketplaceCategoryHubActionBand
} from "./marketplace/MarketplaceCategoryHubActionBand";
import { MarketplaceCategoryShowcaseSection } from "./marketplace/MarketplaceCategoryShowcaseSection";
import { buildMarketplaceCategoryCollectionCards } from "./marketplace/marketplaceCategoryCollections";
import {
  buildMarketplaceCategoryHubModel,
  type MarketplaceCategoryHubAudience,
  type MarketplaceCategoryHubSectionSlug
} from "./marketplace/marketplaceCategoryHubModel";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
import { formatCompactMarketplaceNumber } from "./marketplace/marketplaceViewModel";
import { useMarketplaceTopbarSlots } from "./marketplace/useMarketplaceTopbarSlots";
import { PublicCategoryDetailPage } from "./PublicCategoryDetailPage";

interface PublicCategoryPageProps {
  marketplace: PublicMarketplaceResponse;
  activeCategory?: string;
  query?: string;
  semanticQuery?: string;
  activeSubcategory?: string;
  sort?: string;
  mode?: string;
  audience?: string;
}

function resolveCategoryHubSectionCopy(messages: ReturnType<typeof usePublicI18n>["messages"], slug: MarketplaceCategoryHubSectionSlug) {
  switch (slug) {
    case "most-installed":
      return {
        title: messages.categoryHubMostInstalledTitle,
        description: messages.categoryHubMostInstalledDescription
      };
    case "popular":
      return {
        title: messages.categoryHubPopularTitle,
        description: messages.categoryHubPopularDescription
      };
    case "featured":
      return {
        title: messages.categoryHubFeaturedTitle,
        description: messages.categoryHubFeaturedDescription
      };
    case "recently-updated":
      return {
        title: messages.categoryHubRecentlyUpdatedTitle,
        description: messages.categoryHubRecentlyUpdatedDescription
      };
  }
}

function normalizeCategoryHubAudience(rawAudience: string | undefined): MarketplaceCategoryHubAudience {
  return String(rawAudience || "").trim().toLowerCase() === "human" ? "human" : "agent";
}

export function PublicCategoryPage({
  marketplace,
  activeCategory,
  query = "",
  semanticQuery = "",
  activeSubcategory,
  sort = "relevance",
  mode = "hybrid",
  audience = "agent"
}: PublicCategoryPageProps) {
  const { messages } = usePublicI18n();
  const { isAuthenticated } = usePublicViewerSession();
  const loginTarget = usePublicLoginTarget();
  const { toPublicPath, toPublicLinkTarget } = usePublicRouteState();
  const normalizedAudience = normalizeCategoryHubAudience(audience);
  const shellSlots = useMarketplaceTopbarSlots({
    stageLabel: messages.stageCategories,
    variant: "market",
    belowContent: (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: toPublicPath("/"), label: messages.shellHome },
          { label: messages.categoryBrowseTitle, isCurrent: true }
        ]}
      />
    )
  });

  if (activeCategory) {
    return (
      <PublicCategoryDetailPage
        marketplace={marketplace}
        activeCategory={activeCategory}
        query={query}
        semanticQuery={semanticQuery}
        activeSubcategory={activeSubcategory}
        sort={sort}
        mode={mode}
      />
    );
  }

  const hubModel = buildMarketplaceCategoryHubModel(marketplace.categories, marketplace.items, 6, normalizedAudience);
  const collectionCards = buildMarketplaceCategoryCollectionCards({
    audience: normalizedAudience,
    hubModel,
    messages,
    topTags: marketplace.top_tags,
    toPublicPath
  });
  const spotlightCountLabel = `${formatCompactMarketplaceNumber(hubModel.categorySpotlights.length)} ${messages.statCategories}`;
  const categoryStats = [
    { label: messages.statCategories, value: formatCompactMarketplaceNumber(hubModel.navigationItems.length) },
    { label: messages.skillCountSuffix, value: formatCompactMarketplaceNumber(marketplace.stats.total_skills || marketplace.items.length) },
    { label: messages.statTopTags, value: formatCompactMarketplaceNumber(marketplace.top_tags.length) }
  ];
  const allCategoriesHref = buildCategoryHubAudienceHref(normalizedAudience, query, semanticQuery, toPublicLinkTarget);
  const submitSkillHref = isAuthenticated ? "/workspace" : loginTarget.as || loginTarget.href;
  const directoryItems = [
    {
      key: "all",
      href: allCategoriesHref,
      label: messages.categoryHubAllCategories,
      secondaryLabel: formatCompactMarketplaceNumber(marketplace.stats.total_skills || marketplace.items.length),
      isActive: true
    },
    ...hubModel.navigationItems.map((item) => {
      const target = toPublicLinkTarget(`/categories#${item.anchorId}`);

      return {
        key: item.slug,
        href: target.as || target.href,
        label: item.name,
        secondaryLabel: formatCompactMarketplaceNumber(item.count)
      };
    })
  ];
  const railItems = [
    {
      slug: "all",
      name: messages.categoryHubAllCategories,
      count: marketplace.stats.total_skills || marketplace.items.length,
      href: allCategoriesHref,
      isActive: true
    },
    ...hubModel.navigationItems.map((item) => ({
      slug: item.slug,
      name: item.name,
      count: item.count,
      href: toPublicPath(`/categories/${item.slug}`)
    }))
  ];

  return (
    <div className="marketplace-main-column marketplace-category-index-stage">
      <PublicShellRegistration slots={shellSlots} />

      <section className="marketplace-category-reference-intro">
        <div className="marketplace-category-reference-heading">
          <p className="marketplace-kicker">{messages.categoryBrowseTitle}</p>
          <h1 data-testid="categories-page-title">{messages.shellCategories}</h1>
          <p>{messages.categoryBrowseDescription}</p>
        </div>
        <dl className="marketplace-category-reference-metrics">
          {categoryStats.map((stat) => (
            <div key={stat.label} className="marketplace-category-reference-metric">
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <MarketplaceCategoryHubActionBand
        audience={normalizedAudience}
        query={query}
        semanticQuery={semanticQuery}
        submitSkillHref={submitSkillHref}
      />

      <section id="categories-all" className="marketplace-section-card marketplace-category-directory-card" data-testid="category-hub-directory">
        <MarketplaceChipControlGroup
          label={messages.categoryHubAllCategories}
          items={directoryItems}
          ariaLabel={messages.categoryHubAllCategories}
          className="marketplace-category-directory-group"
          rowClassName="marketplace-category-directory-row"
        />
      </section>

      <section className="marketplace-section-card marketplace-category-collections-section" data-testid="category-hub-collections">
        <div className="marketplace-category-section-head marketplace-category-collections-head">
          <div className="marketplace-section-header">
            <h2>{messages.categoryFeaturedTitle}</h2>
            <p>{messages.categoryFeaturedDescription}</p>
          </div>
          <div className="marketplace-category-collections-summary">
            <span className="marketplace-search-utility-pill">
              {formatCompactMarketplaceNumber(collectionCards.length)} {messages.statCategories}
            </span>
            <PublicLink href={toPublicPath("/rankings")} className="marketplace-topbar-button">
              {messages.sharedViewAllLabel}
            </PublicLink>
          </div>
        </div>

        <div className="marketplace-category-collections-grid">
          {collectionCards.map((card) => (
            <MarketplaceCategoryCollectionCard key={card.key} card={card} />
          ))}
        </div>
      </section>

      <div className="marketplace-category-reference-layout">
        <MarketplaceCategoryRail categories={marketplace.categories} navigationItems={railItems} />

        <div className="marketplace-category-reference-stream" data-testid="categories-stream">
          <section className="marketplace-category-browse-section">
            <div className="marketplace-category-section-head">
              <div className="marketplace-section-header">
                <h2>{messages.categoryHubBrowseTitle}</h2>
                <p>{messages.categoryHubBrowseDescription}</p>
              </div>
              <span className="marketplace-search-utility-pill">{spotlightCountLabel}</span>
            </div>

            <div className="marketplace-category-showcase-stream">
              {hubModel.categorySpotlights.map((category) => (
                <MarketplaceCategoryShowcaseSection key={category.slug} spotlight={category} />
              ))}
            </div>
          </section>

          {hubModel.skillSections.map((section) => {
            const copy = resolveCategoryHubSectionCopy(messages, section.slug);

            return (
              <section
                key={section.slug}
                className="marketplace-section-card marketplace-category-skill-section"
                data-testid={`category-skill-section-${section.slug}`}
              >
                <div className="marketplace-category-section-head">
                  <div className="marketplace-section-header">
                    <h2>{copy.title}</h2>
                    <p>{copy.description}</p>
                  </div>
                  <span className="marketplace-search-utility-pill">
                    {formatCompactMarketplaceNumber(section.items.length)} {messages.skillCountSuffix}
                  </span>
                </div>

                <div className="marketplace-category-skill-grid">
                  {section.items.map((item) => (
                    <MarketplaceCategorySkillCard key={`${section.slug}-${item.id}`} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
