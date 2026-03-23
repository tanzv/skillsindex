"use client";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { PublicMarketWebclientRegistration } from "@/src/components/shared/PublicMarketWebclientSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicViewerSession } from "@/src/features/public/PublicViewerSessionProvider";
import { usePublicLoginTarget } from "@/src/lib/auth/usePublicLoginTarget";
import { publicHomeRoute, publicRankingsRoute } from "@/src/lib/routing/publicRouteRegistry";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { MarketplaceCategoryRail } from "./marketplace/MarketplaceCategoryRail";
import { MarketplaceCategorySkillCard } from "./marketplace/MarketplaceCategorySkillCard";
import { MarketplaceChipControlGroup } from "./marketplace/MarketplaceChipControlGroup";
import { MarketplaceCategoryCollectionCard } from "./marketplace/MarketplaceCategoryCollectionCard";
import { MarketplaceCategoryHubActionBand } from "./marketplace/MarketplaceCategoryHubActionBand";
import { MarketplaceCategoryShowcaseSection } from "./marketplace/MarketplaceCategoryShowcaseSection";
import { MarketplaceTopbarBreadcrumb } from "./marketplace/MarketplaceTopbarBreadcrumb";
import { useMarketplaceTopbarSlots } from "./marketplace/useMarketplaceTopbarSlots";
import { buildPublicCategoryPageModel } from "./publicCategoryPageModel";

interface PublicCategoryPageProps {
  marketplace: PublicMarketplaceResponse;
  query?: string;
  semanticQuery?: string;
  audience?: string;
}

export function PublicCategoryPage({
  marketplace,
  query = "",
  semanticQuery = "",
  audience = "agent"
}: PublicCategoryPageProps) {
  const { messages } = usePublicI18n();
  const { isAuthenticated } = usePublicViewerSession();
  const loginTarget = usePublicLoginTarget();
  const { toPublicPath, toPublicLinkTarget } = usePublicRouteState();
  const model = buildPublicCategoryPageModel({
    marketplace,
    messages,
    query,
    semanticQuery,
    audience,
    isAuthenticated,
    loginHref: loginTarget.as || loginTarget.href,
    resolvePath: toPublicPath,
    resolveLinkTarget: toPublicLinkTarget
  });
  const shellSlots = useMarketplaceTopbarSlots({
    stageLabel: messages.stageCategories,
    variant: "market",
    belowContent: (
        <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: toPublicPath(publicHomeRoute), label: messages.shellHome },
          { label: messages.categoryBrowseTitle, isCurrent: true }
        ]}
      />
    )
  });

  return (
    <div className="marketplace-main-column marketplace-category-index-stage">
      <PublicMarketWebclientRegistration slots={shellSlots} />

      <section className="marketplace-category-reference-intro">
        <div className="marketplace-category-reference-heading">
          <p className="marketplace-kicker">{messages.categoryBrowseTitle}</p>
          <h1 data-testid="categories-page-title">{messages.shellCategories}</h1>
          <p>{messages.categoryBrowseDescription}</p>
        </div>
        <dl className="marketplace-category-reference-metrics">
          {model.categoryStats.map((stat) => (
            <div key={stat.key} className="marketplace-category-reference-metric" data-testid={`category-hub-stat-${stat.key}`}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <MarketplaceCategoryHubActionBand
        audience={model.normalizedAudience}
        query={query}
        semanticQuery={semanticQuery}
        submitSkillHref={model.submitSkillHref}
      />

      <section id="categories-all" className="marketplace-section-card marketplace-category-directory-card" data-testid="category-hub-directory">
        <MarketplaceChipControlGroup
          label={messages.categoryHubAllCategories}
          items={model.directoryItems}
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
            <span className="marketplace-search-utility-pill">{model.collectionCardsCountLabel}</span>
            <PublicLink href={toPublicPath(publicRankingsRoute)} className="marketplace-topbar-button">
              {messages.sharedViewAllLabel}
            </PublicLink>
          </div>
        </div>

        <div className="marketplace-category-collections-grid">
          {model.collectionCards.map((card) => (
            <MarketplaceCategoryCollectionCard key={card.key} card={card} />
          ))}
        </div>
      </section>

      <div className="marketplace-category-reference-layout">
        <MarketplaceCategoryRail categories={marketplace.categories} navigationItems={model.railItems} />

        <div className="marketplace-category-reference-stream" data-testid="categories-stream">
          <section className="marketplace-category-browse-section">
            <div className="marketplace-category-section-head">
              <div className="marketplace-section-header">
                <h2>{messages.categoryHubBrowseTitle}</h2>
                <p>{messages.categoryHubBrowseDescription}</p>
              </div>
              <span className="marketplace-search-utility-pill">{model.spotlightCountLabel}</span>
            </div>

            <div className="marketplace-category-showcase-stream">
              {model.categorySpotlights.map((category) => (
                <MarketplaceCategoryShowcaseSection key={category.slug} spotlight={category} />
              ))}
            </div>
          </section>

          {model.skillSections.map((section) => {
            return (
              <section
                key={section.slug}
                className="marketplace-section-card marketplace-category-skill-section"
                data-testid={`category-skill-section-${section.slug}`}
              >
                <div className="marketplace-category-section-head">
                  <div className="marketplace-section-header">
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                  </div>
                  <span className="marketplace-search-utility-pill">{section.itemCountLabel}</span>
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
