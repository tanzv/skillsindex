"use client";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { PublicShellRegistration } from "@/src/components/shared/PublicShellSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { MarketplaceCategoryRail } from "./marketplace/MarketplaceCategoryRail";
import { MarketplaceCategorySkillCard } from "./marketplace/MarketplaceCategorySkillCard";
import { buildMarketplaceCategoryHubModel, type MarketplaceCategoryHubSectionSlug } from "./marketplace/marketplaceCategoryHubModel";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
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

export function PublicCategoryPage({
  marketplace,
  activeCategory,
  query = "",
  semanticQuery = "",
  activeSubcategory,
  sort = "relevance",
  mode = "hybrid"
}: PublicCategoryPageProps) {
  const { messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
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

  const hubModel = buildMarketplaceCategoryHubModel(marketplace.categories, marketplace.items);
  const spotlightCountLabel = `${hubModel.categorySpotlights.length} ${messages.statCategories}`;
  const categoryStats = [
    { label: messages.statCategories, value: marketplace.categories.length },
    { label: messages.skillCountSuffix, value: marketplace.items.length },
    { label: messages.statTopTags, value: marketplace.top_tags.length }
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

      <div className="marketplace-category-reference-layout">
        <MarketplaceCategoryRail categories={marketplace.categories} />

        <div className="marketplace-category-reference-stream" data-testid="categories-stream">
          <section className="marketplace-section-card marketplace-category-browse-section">
            <div className="marketplace-category-section-head">
              <div className="marketplace-section-header">
                <h2>{messages.categoryHubBrowseTitle}</h2>
                <p>{messages.categoryHubBrowseDescription}</p>
              </div>
              <span className="marketplace-search-utility-pill">{spotlightCountLabel}</span>
            </div>

            <div className="marketplace-category-browse-grid">
              {hubModel.categorySpotlights.map((category) => (
                <article key={category.slug} id={category.anchorId} className="marketplace-category-browse-card">
                  <div className="marketplace-category-browse-card-head">
                    <div className="marketplace-category-browse-card-title">
                      <h4>{category.name}</h4>
                      <p>{category.description}</p>
                    </div>
                    <span className="marketplace-category-nav-count">
                      {category.count}
                    </span>
                  </div>

                  <div className="marketplace-pill-row">
                    {category.subcategories.map((subcategory) => (
                      <PublicLink
                        key={`${category.slug}-${subcategory.slug}`}
                        href={toPublicPath(`/categories/${category.slug}?subcategory=${subcategory.slug}`)}
                        className="marketplace-recommendation-chip"
                      >
                        {subcategory.name}
                      </PublicLink>
                    ))}
                  </div>

                  {category.previewSkills[0] ? (
                    <PublicLink
                      href={toPublicPath(`/skills/${category.previewSkills[0].id}`)}
                      className="marketplace-category-browse-featured"
                    >
                      <strong className="marketplace-sidebar-link">{category.previewSkills[0].name}</strong>
                      <p className="marketplace-meta-text">{category.previewSkills[0].description}</p>
                      <span className="marketplace-category-browse-featured-meta">
                        <span>
                          {category.previewSkills[0].star_count} {messages.skillStarsSuffix}
                        </span>
                        <span>
                          {category.previewSkills[0].quality_score.toFixed(1)} {messages.skillQualitySuffix}
                        </span>
                      </span>
                    </PublicLink>
                  ) : null}

                  <PublicLink href={toPublicPath(`/categories/${category.slug}`)} className="marketplace-chip-control">
                    {messages.categoryAllSubcategories}
                  </PublicLink>
                </article>
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
                    {section.items.length} {messages.skillCountSuffix}
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
