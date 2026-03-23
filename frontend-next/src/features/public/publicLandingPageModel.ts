import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { publicResultsRoute } from "@/src/lib/routing/publicRouteRegistry";
import type { PublicMarketplaceLandingSummary, PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { resolveFeaturedMarketplaceItems, resolveLatestMarketplaceItems } from "./marketplace/marketplaceViewModel";
import { buildPublicSkillBatchWarmupTargets } from "./marketplace/publicSkillBatchWarmup";

export const publicLandingLatestFeedLimit = 12;

export interface PublicLandingPageModel {
  landingSummary: PublicMarketplaceLandingSummary;
  featuredItems: PublicMarketplaceResponse["items"];
  latestItems: PublicMarketplaceResponse["items"];
  featuredTitle: string;
  featuredDescription: string;
  featuredChips: string[];
  latestTitle: string;
  latestDescription: string;
  latestChips: string[];
  searchSuggestions: string[];
  searchAction: string;
  skillWarmupTargets: string[];
}

export type PublicLandingPageMessages = Pick<
  PublicMarketplaceMessages,
  | "landingCuratedDescription"
  | "landingCuratedTitle"
  | "landingLatestDescription"
  | "landingLatestTitle"
>;

export interface BuildPublicLandingPageModelInput {
  marketplace: PublicMarketplaceResponse;
  messages: PublicLandingPageMessages;
  resolvePath: (route: string) => string;
}

export function buildPublicLandingPageModel({
  marketplace,
  messages,
  resolvePath
}: BuildPublicLandingPageModelInput): PublicLandingPageModel {
  const featuredItems = resolveFeaturedMarketplaceItems(marketplace.items, 3);
  const featuredItemIds = new Set(featuredItems.map((item) => item.id));
  const latestItems = resolveLatestMarketplaceItems(
    marketplace.items,
    publicLandingLatestFeedLimit,
    featuredItemIds
  );
  const resolvedLatestItems = latestItems.length > 0 ? latestItems : featuredItems;

  return {
    landingSummary: marketplace.summary?.landing || {
      total_skills: marketplace.stats.total_skills || marketplace.items.length,
      category_count: marketplace.categories.filter((category) => category.count > 0).length,
      top_tag_count: marketplace.top_tags.length,
      featured_skill_count: featuredItems.length,
      latest_skill_count: resolvedLatestItems.length
    },
    featuredItems,
    latestItems: resolvedLatestItems,
    featuredTitle: messages.landingCuratedTitle,
    featuredDescription: messages.landingCuratedDescription,
    featuredChips: marketplace.top_tags.slice(0, 3).map((tag) => tag.name),
    latestTitle: messages.landingLatestTitle,
    latestDescription: messages.landingLatestDescription,
    latestChips: marketplace.categories.slice(0, 4).map((category) => category.name),
    searchSuggestions: marketplace.top_tags.map((tag) => tag.name),
    searchAction: resolvePath(publicResultsRoute),
    skillWarmupTargets: buildPublicSkillBatchWarmupTargets(
      [...featuredItems, ...resolvedLatestItems],
      resolvePath
    )
  };
}
