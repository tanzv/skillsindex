import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type { MarketplaceSkill, MarketplaceTag } from "@/src/lib/schemas/public";

import { humanizeMarketplaceSlug } from "./marketplaceTaxonomyText";
import { createMarketplaceSearchHref } from "./searchHistory";
import type { MarketplaceCategoryHubAudience, MarketplaceCategoryHubModel } from "./marketplaceCategoryHubModel";
import { formatCompactMarketplaceNumber } from "./marketplaceViewModel";
import { resolveMarketplaceSkillCategoryLabel } from "./marketplaceTaxonomy";

export interface MarketplaceCategoryCollectionLink {
  key: string;
  href: string;
  label: string;
  meta: string;
}

export interface MarketplaceCategoryCollectionHighlight {
  eyebrow: string;
  title: string;
  description: string;
  metrics: string[];
}

export interface MarketplaceCategoryCollectionAction {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}

export interface MarketplaceCategoryCollectionCard {
  key: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  actionVariant?: "primary" | "secondary";
  secondaryAction?: MarketplaceCategoryCollectionAction;
  highlight: MarketplaceCategoryCollectionHighlight;
  links: MarketplaceCategoryCollectionLink[];
}

interface BuildMarketplaceCategoryCollectionCardsInput {
  audience: MarketplaceCategoryHubAudience;
  hubModel: MarketplaceCategoryHubModel;
  messages: PublicMarketplaceMessages;
  topTags: MarketplaceTag[];
  toPublicPath: (route: string) => string;
}

function flattenUniqueHubSkills(hubModel: MarketplaceCategoryHubModel): MarketplaceSkill[] {
  const seenSkillIds = new Set<number>();

  return hubModel.skillSections.flatMap((section) =>
    section.items.filter((item) => {
      if (seenSkillIds.has(item.id)) {
        return false;
      }

      seenSkillIds.add(item.id);
      return true;
    })
  );
}

function buildBundleQueryText(skill: MarketplaceSkill): string {
  return skill.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
}

function dedupeBundleTerms(terms: string[]): string[] {
  const seen = new Set<string>();

  return terms.filter((term) => {
    const normalizedTerm = String(term || "").trim().toLowerCase();

    if (!normalizedTerm || seen.has(normalizedTerm)) {
      return false;
    }

    seen.add(normalizedTerm);
    return true;
  });
}

function buildBundleTagsText(skill: MarketplaceSkill): string {
  return dedupeBundleTerms(skill.tags.slice(0, 2)).join(" ");
}

function buildSkillBundleHref(resultsPath: string, skill: MarketplaceSkill): string {
  return createMarketplaceSearchHref(resultsPath, buildBundleQueryText(skill), buildBundleTagsText(skill));
}

function buildSkillBundleLabel(skill: MarketplaceSkill): string {
  const bundleTerms = skill.tags.slice(0, 2).map((tag) => humanizeMarketplaceSlug(tag));

  if (bundleTerms.length === 0) {
    return `${resolveMarketplaceSkillCategoryLabel(skill)} Bundle`;
  }

  return `${bundleTerms.join(" / ")} Bundle`;
}

function findLeadingSkillForTag(skills: MarketplaceSkill[], tagName: string): MarketplaceSkill | null {
  const normalizedTag = String(tagName || "").trim().toLowerCase();

  return skills.find((skill) => skill.tags.some((tag) => tag.toLowerCase() === normalizedTag)) || null;
}

function buildTagBundleHref(resultsPath: string, tagName: string, skill: MarketplaceSkill | null): string {
  const bundleTags = dedupeBundleTerms([tagName, ...(skill?.tags.slice(0, 2) || [])]).join(" ");
  return createMarketplaceSearchHref(resultsPath, skill ? buildBundleQueryText(skill) : "", bundleTags);
}

function resolveAudienceCollectionCard({
  audience,
  hubModel,
  messages,
  toPublicPath
}: Omit<BuildMarketplaceCategoryCollectionCardsInput, "topTags">): MarketplaceCategoryCollectionCard {
  const prioritizedSkills = hubModel.skillSections[0]?.items.slice(0, 3) || [];
  const leadingSkill = prioritizedSkills[0];
  const resultsPath = toPublicPath("/results");

  return {
    key: "audience-priority",
    title: audience === "human" ? messages.categoryHubAudienceHuman : messages.categoryHubAudienceAgent,
    description:
      audience === "human" ? messages.categoryHubAudienceHumanDescription : messages.categoryHubAudienceAgentDescription,
    actionHref: leadingSkill ? buildSkillBundleHref(resultsPath, leadingSkill) : resultsPath,
    actionLabel: messages.shellSearch,
    actionVariant: "primary",
    secondaryAction: leadingSkill
      ? {
          href: `/skills/${leadingSkill.id}`,
          label: messages.rankingOpenSkillLabel
        }
      : undefined,
    highlight: {
      eyebrow: leadingSkill ? resolveMarketplaceSkillCategoryLabel(leadingSkill) : messages.categoryHubAudienceLabel,
      title: leadingSkill?.name || messages.categoryHubAudienceLabel,
      description: leadingSkill?.description || messages.categoryHubAudienceAgentDescription,
      metrics: [
        `${messages.statTopStars} ${formatCompactMarketplaceNumber(leadingSkill?.star_count || 0)}`,
        `${(leadingSkill?.quality_score || 0).toFixed(1)} ${messages.skillQualitySuffix}`
      ]
    },
    links: prioritizedSkills.map((skill) => ({
      key: `audience-bundle-${skill.id}`,
      href: buildSkillBundleHref(resultsPath, skill),
      label: buildSkillBundleLabel(skill),
      meta: skill.name
    }))
  };
}

function resolveLeaderCollectionCard({
  hubModel,
  messages,
  toPublicPath
}: Omit<BuildMarketplaceCategoryCollectionCardsInput, "topTags" | "audience">): MarketplaceCategoryCollectionCard {
  const rankedSpotlights = [...hubModel.categorySpotlights]
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 4);
  const leadingSpotlight = rankedSpotlights[0];

  return {
    key: "category-leaders",
    title: messages.rankingCategoryLeadersTitle,
    description: messages.rankingCategoryLeadersDescription,
    actionHref: leadingSpotlight ? toPublicPath(`/categories/${leadingSpotlight.slug}`) : toPublicPath("/rankings"),
    actionLabel: messages.shellCategories,
    actionVariant: "primary",
    secondaryAction: {
      href: toPublicPath("/rankings"),
      label: messages.shellRankings
    },
    highlight: {
      eyebrow: leadingSpotlight?.name || messages.rankingCategoryLeadersTitle,
      title: leadingSpotlight?.previewSkills[0]?.name || leadingSpotlight?.name || messages.rankingCategoryLeadersTitle,
      description: leadingSpotlight?.previewSkills[0]?.description || leadingSpotlight?.description || messages.rankingCategoryLeadersDescription,
      metrics: [
        `${formatCompactMarketplaceNumber(leadingSpotlight?.count || 0)} ${messages.skillCountSuffix}`,
        `${formatCompactMarketplaceNumber(leadingSpotlight?.subcategories.length || 0)} ${messages.categoryAllSubcategories}`
      ]
    },
    links: rankedSpotlights.map((spotlight) => {
      const primarySubcategory = spotlight.subcategories[0];
      const href = primarySubcategory
        ? toPublicPath(`/categories/${spotlight.slug}?subcategory=${primarySubcategory.slug}`)
        : toPublicPath(`/categories/${spotlight.slug}`);

      return {
        key: `leader-bundle-${spotlight.slug}`,
        href,
        label: primarySubcategory ? `${spotlight.name} / ${primarySubcategory.name}` : spotlight.name,
        meta: spotlight.previewSkills[0]?.name || `${formatCompactMarketplaceNumber(spotlight.count)} ${messages.skillCountSuffix}`
      };
    })
  };
}

function resolveTopTagCollectionCard({
  hubModel,
  messages,
  topTags,
  toPublicPath
}: Omit<BuildMarketplaceCategoryCollectionCardsInput, "audience">): MarketplaceCategoryCollectionCard {
  const prioritizedTags = topTags.slice(0, 5);
  const resultsPath = toPublicPath("/results");
  const uniqueSkills = flattenUniqueHubSkills(hubModel);
  const leadingTag = prioritizedTags[0];
  const leadingSkill = leadingTag ? findLeadingSkillForTag(uniqueSkills, leadingTag.name) : null;

  return {
    key: "top-tags",
    title: messages.resultsCategoryPivotsTitle,
    description: messages.resultsCategoryPivotsDescription,
    actionHref: leadingTag ? buildTagBundleHref(resultsPath, leadingTag.name, leadingSkill) : resultsPath,
    actionLabel: messages.shellSearch,
    actionVariant: "primary",
    secondaryAction: leadingSkill
      ? {
          href: `/skills/${leadingSkill.id}`,
          label: messages.rankingOpenSkillLabel
        }
      : undefined,
    highlight: {
      eyebrow: humanizeMarketplaceSlug(leadingTag?.name, messages.resultsCategoryPivotsTitle),
      title: leadingSkill ? buildSkillBundleLabel(leadingSkill) : messages.resultsCategoryPivotsTitle,
      description: leadingSkill?.name || messages.resultsCategoryPivotsDescription,
      metrics: [
        `${formatCompactMarketplaceNumber(leadingTag?.count || 0)} ${messages.skillCountSuffix}`,
        `${formatCompactMarketplaceNumber(prioritizedTags.length)} ${messages.statTopTags}`
      ]
    },
    links: prioritizedTags.map((tag) => {
      const matchedSkill = findLeadingSkillForTag(uniqueSkills, tag.name);

      return {
        key: `tag-bundle-${tag.name}`,
        href: buildTagBundleHref(resultsPath, tag.name, matchedSkill),
        label: matchedSkill ? buildSkillBundleLabel(matchedSkill) : `${humanizeMarketplaceSlug(tag.name)} Bundle`,
        meta: matchedSkill ? matchedSkill.name : `${formatCompactMarketplaceNumber(tag.count)} ${messages.skillCountSuffix}`
      };
    })
  };
}

export function buildMarketplaceCategoryCollectionCards(
  input: BuildMarketplaceCategoryCollectionCardsInput
): MarketplaceCategoryCollectionCard[] {
  return [
    resolveAudienceCollectionCard(input),
    resolveLeaderCollectionCard(input),
    resolveTopTagCollectionCard(input)
  ];
}
