import type { MarketplaceCompareSelectionItem } from "./marketplace/MarketplaceCompareSelectionList";
import {
  formatCompactMarketplaceNumber,
  resolveFeaturedMarketplaceItems,
  resolveLatestMarketplaceItems
} from "./marketplace/marketplaceViewModel";
import { createMarketplaceSearchHref } from "./marketplace/searchHistory";
import {
  resolvePublicProgramDescriptor,
  type PublicProgramDescriptor,
  type PublicProgramPageKey
} from "./publicProgramModel";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import {
  publicCategoriesRoute,
  publicHomeRoute,
  publicRankingsRoute,
  publicResultsRoute
} from "@/src/lib/routing/publicRouteRegistry";
import { workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

export interface PublicProgramPageStat {
  label: string;
  value: string;
  detail: string;
}

export interface PublicProgramPageLinkItem {
  key: string;
  href: string;
  label: string;
  meta: string;
}

export interface PublicProgramPageSection {
  key: string;
  title: string;
  description: string;
  items?: PublicMarketplaceResponse["items"];
  links?: PublicProgramPageLinkItem[];
  emphasis?: boolean;
  testId: string;
}

export interface PublicProgramPageModel {
  descriptor: PublicProgramDescriptor;
  stats: PublicProgramPageStat[];
  primarySection: PublicProgramPageSection;
  categoriesSection: PublicProgramPageSection;
  continueSectionTitle: string;
  continueSectionDescription: string;
  continueLinks: PublicProgramPageLinkItem[];
  signalsSectionTitle: string;
  signalsSectionDescription: string;
  signalLinks: PublicProgramPageLinkItem[];
  leadingSkillSignal: MarketplaceCompareSelectionItem | null;
  breadcrumbTitle: string;
}

export type PublicProgramPageMessages = Pick<
  PublicMarketplaceMessages,
  | "aboutDescription"
  | "aboutTitle"
  | "governanceDescription"
  | "governanceTitle"
  | "landingCategoriesTitle"
  | "landingContinueCategories"
  | "landingContinueDescription"
  | "landingContinueRankings"
  | "landingCuratedDescription"
  | "landingCuratedTitle"
  | "landingLatestDescription"
  | "landingLatestTitle"
  | "metricCategoryFamilies"
  | "metricPublicAssets"
  | "metricTopTagPivots"
  | "programContinueTitle"
  | "rankingCategoryLeadersDescription"
  | "rankingCategoryLeadersTitle"
  | "rankingTopHighlightsDescription"
  | "resultsCategoryPivotsDescription"
  | "resultsDiscoveryNotesDescription"
  | "resultsDiscoveryNotesTitle"
  | "resultsEmptyTitle"
  | "rolloutDescription"
  | "rolloutTitle"
  | "shellCategories"
  | "shellHome"
  | "shellRankings"
  | "shellWorkspace"
  | "skillCountSuffix"
  | "skillQualitySuffix"
  | "skillStarsSuffix"
  | "skillUpdatedPrefix"
  | "stageAccess"
  | "stageLanding"
  | "statCategories"
  | "statTopStars"
  | "statTopTags"
  | "statTotalSkills"
  | "timelineDescription"
  | "timelineTitle"
>;

export interface BuildPublicProgramPageModelInput {
  pageKey: PublicProgramPageKey;
  marketplace: PublicMarketplaceResponse;
  messages: PublicProgramPageMessages;
  locale: PublicLocale;
  resolvePath: (route: string) => string;
  formatDate: (value: string, locale: PublicLocale) => string;
}

export type { PublicProgramPageKey } from "./publicProgramModel";

export function buildPublicProgramPageModel({
  pageKey,
  marketplace,
  messages,
  locale,
  resolvePath,
  formatDate
}: BuildPublicProgramPageModelInput): PublicProgramPageModel {
  const descriptor = resolvePublicProgramDescriptor(messages, pageKey);
  const featuredItems = resolveFeaturedMarketplaceItems(marketplace.items, 3);
  const latestItems = resolveLatestMarketplaceItems(marketplace.items, 4);
  const leadingSkill = featuredItems[0] || latestItems[0] || marketplace.items[0] || null;
  const topCategories = marketplace.categories.slice(0, 4);
  const topTags = marketplace.top_tags.slice(0, 6);
  const primaryItems = pageKey === "about" ? featuredItems : latestItems;
  const primaryTitle = pageKey === "timeline" ? messages.landingLatestTitle : messages.landingCuratedTitle;
  const primaryDescription =
    pageKey === "timeline"
      ? messages.landingLatestDescription
      : pageKey === "rollout"
        ? messages.rankingTopHighlightsDescription
        : messages.landingCuratedDescription;

  return {
    descriptor,
    stats: [
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
    primarySection: {
      key: `${pageKey}-skills`,
      title: primaryTitle,
      description: primaryDescription,
      items: primaryItems,
      emphasis: true,
      testId: `public-program-${pageKey}-skills`
    },
    categoriesSection: {
      key: `${pageKey}-categories`,
      title: pageKey === "governance" ? messages.rankingCategoryLeadersTitle : messages.landingCategoriesTitle,
      description: pageKey === "governance" ? messages.rankingCategoryLeadersDescription : messages.resultsCategoryPivotsDescription,
      links: topCategories.map((category) => ({
        key: category.slug,
        href: resolvePath(`${publicCategoriesRoute}/${category.slug}`),
        label: category.name,
        meta: `${category.count} ${messages.skillCountSuffix}`
      })),
      testId: `public-program-${pageKey}-categories`
    },
    continueSectionTitle: messages.programContinueTitle,
    continueSectionDescription: messages.landingContinueDescription,
    continueLinks: [
      {
        key: `${pageKey}-home`,
        href: resolvePath(publicHomeRoute),
        label: messages.shellHome,
        meta: messages.stageLanding
      },
      {
        key: `${pageKey}-categories`,
        href: resolvePath(publicCategoriesRoute),
        label: messages.landingContinueCategories,
        meta: messages.shellCategories
      },
      {
        key: `${pageKey}-rankings`,
        href: resolvePath(publicRankingsRoute),
        label: messages.landingContinueRankings,
        meta: messages.shellRankings
      },
      {
        key: `${pageKey}-workspace`,
        href: workspaceOverviewRoute,
        label: messages.shellWorkspace,
        meta: messages.stageAccess
      }
    ],
    signalsSectionTitle: messages.resultsDiscoveryNotesTitle,
    signalsSectionDescription: pageKey === "timeline" ? messages.timelineDescription : messages.resultsDiscoveryNotesDescription,
    signalLinks: topTags.map((tag) => ({
      key: tag.name,
      href: createMarketplaceSearchHref(resolvePath(publicResultsRoute), "", tag.name),
      label: tag.name,
      meta: `${tag.count} ${messages.skillCountSuffix}`
    })),
    leadingSkillSignal: leadingSkill
      ? {
          key: `${pageKey}-leading-skill`,
          label: messages.skillUpdatedPrefix,
          title: leadingSkill.name,
          description: formatDate(leadingSkill.updated_at, locale),
          metrics: [
            `${formatCompactMarketplaceNumber(leadingSkill.star_count)} ${messages.skillStarsSuffix}`,
            `${leadingSkill.quality_score.toFixed(1)} ${messages.skillQualitySuffix}`
          ]
        }
      : null,
    breadcrumbTitle: descriptor.title
  };
}
