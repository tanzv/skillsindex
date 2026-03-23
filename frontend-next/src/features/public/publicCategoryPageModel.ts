import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { publicCategoriesRoute } from "@/src/lib/routing/publicRouteRegistry";
import { workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { buildCategoryHubAudienceHref } from "./marketplace/MarketplaceCategoryHubActionBand";
import {
  buildMarketplaceCategoryCollectionCards,
  type MarketplaceCategoryCollectionCard
} from "./marketplace/marketplaceCategoryCollections";
import {
  buildMarketplaceCategoryHubModel,
  type MarketplaceCategoryHubAudience,
  type MarketplaceCategoryHubSectionSlug,
  type MarketplaceCategoryHubSpotlight
} from "./marketplace/marketplaceCategoryHubModel";
import { formatCompactMarketplaceNumber } from "./marketplace/marketplaceViewModel";

export interface PublicCategoryPageDirectoryItem {
  key: string;
  href: string;
  label: string;
  secondaryLabel?: string;
  isActive?: boolean;
}

export interface PublicCategoryPageRailItem {
  slug: string;
  name: string;
  count: number;
  href: string;
  isActive?: boolean;
}

export interface PublicCategoryPageStat {
  key: string;
  label: string;
  value: string;
}

export interface PublicCategoryPageSkillSection {
  slug: MarketplaceCategoryHubSectionSlug;
  title: string;
  description: string;
  items: PublicMarketplaceResponse["items"];
  itemCountLabel: string;
}

export interface PublicCategoryPageModel {
  normalizedAudience: MarketplaceCategoryHubAudience;
  categoryStats: PublicCategoryPageStat[];
  directoryItems: PublicCategoryPageDirectoryItem[];
  railItems: PublicCategoryPageRailItem[];
  collectionCards: MarketplaceCategoryCollectionCard[];
  collectionCardsCountLabel: string;
  spotlightCountLabel: string;
  categorySpotlights: MarketplaceCategoryHubSpotlight[];
  skillSections: PublicCategoryPageSkillSection[];
  submitSkillHref: string;
}

interface PublicLinkTarget {
  href: string;
  as?: string;
}

export interface BuildPublicCategoryPageModelInput {
  marketplace: PublicMarketplaceResponse;
  messages: PublicMarketplaceMessages;
  query?: string;
  semanticQuery?: string;
  audience?: string;
  isAuthenticated: boolean;
  loginHref: string;
  resolvePath: (route: string) => string;
  resolveLinkTarget: (route: string) => PublicLinkTarget;
}

function normalizeCategoryHubAudience(rawAudience: string | undefined): MarketplaceCategoryHubAudience {
  return String(rawAudience || "").trim().toLowerCase() === "human" ? "human" : "agent";
}

function resolveCategoryHubSectionCopy(
  messages: PublicMarketplaceMessages,
  slug: MarketplaceCategoryHubSectionSlug
): Pick<PublicCategoryPageSkillSection, "title" | "description"> {
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

export function buildPublicCategoryPageModel({
  marketplace,
  messages,
  query = "",
  semanticQuery = "",
  audience,
  isAuthenticated,
  loginHref,
  resolvePath,
  resolveLinkTarget
}: BuildPublicCategoryPageModelInput): PublicCategoryPageModel {
  const normalizedAudience = normalizeCategoryHubAudience(audience);
  const hubModel = buildMarketplaceCategoryHubModel(marketplace.categories, marketplace.items, 6, normalizedAudience);
  const collectionCards = buildMarketplaceCategoryCollectionCards({
    audience: normalizedAudience,
    hubModel,
    messages,
    topTags: marketplace.top_tags,
    toPublicPath: resolvePath
  });
  const categoryHubSummary = marketplace.summary?.category_hub || {
    total_categories: hubModel.navigationItems.length,
    total_skills: marketplace.stats.total_skills || marketplace.items.length,
    top_tag_count: marketplace.top_tags.length,
    spotlight_category_count: hubModel.categorySpotlights.length
  };
  const allCategoriesHref = buildCategoryHubAudienceHref(normalizedAudience, query, semanticQuery, resolveLinkTarget);

  return {
    normalizedAudience,
    categoryStats: [
      {
        key: "categories",
        label: messages.statCategories,
        value: formatCompactMarketplaceNumber(categoryHubSummary.total_categories)
      },
      {
        key: "skills",
        label: messages.skillCountSuffix,
        value: formatCompactMarketplaceNumber(categoryHubSummary.total_skills)
      },
      {
        key: "tags",
        label: messages.statTopTags,
        value: formatCompactMarketplaceNumber(categoryHubSummary.top_tag_count)
      }
    ],
    directoryItems: [
      {
        key: "all",
        href: allCategoriesHref,
        label: messages.categoryHubAllCategories,
        secondaryLabel: formatCompactMarketplaceNumber(marketplace.stats.total_skills || marketplace.items.length),
        isActive: true
      },
      ...hubModel.navigationItems.map((item) => {
        const target = resolveLinkTarget(`${publicCategoriesRoute}#${item.anchorId}`);

        return {
          key: item.slug,
          href: target.as || target.href,
          label: item.name,
          secondaryLabel: formatCompactMarketplaceNumber(item.count)
        };
      })
    ],
    railItems: [
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
        href: resolvePath(`${publicCategoriesRoute}/${item.slug}`)
      }))
    ],
    collectionCards,
    collectionCardsCountLabel: `${formatCompactMarketplaceNumber(collectionCards.length)} ${messages.statCategories}`,
    spotlightCountLabel: `${formatCompactMarketplaceNumber(categoryHubSummary.spotlight_category_count)} ${messages.statCategories}`,
    categorySpotlights: hubModel.categorySpotlights,
    skillSections: hubModel.skillSections.map((section) => {
      const copy = resolveCategoryHubSectionCopy(messages, section.slug);

      return {
        slug: section.slug,
        title: copy.title,
        description: copy.description,
        items: section.items,
        itemCountLabel: `${formatCompactMarketplaceNumber(section.items.length)} ${messages.skillCountSuffix}`
      };
    }),
    submitSkillHref: isAuthenticated ? workspaceOverviewRoute : loginHref
  };
}
