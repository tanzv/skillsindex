import { formatPublicDate } from "@/src/lib/i18n/publicLocale";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type { MarketplaceSkill } from "@/src/lib/schemas/public";

import {
  resolveMarketplaceSkillCategoryLabel,
  resolveMarketplaceSkillSubcategoryLabel
} from "./marketplaceTaxonomy";

export function buildMarketplaceCoverLabel(item: MarketplaceSkill): string {
  const source = resolveMarketplaceSkillCategoryLabel(item) || item.name || "SI";
  return source
    .split(/\s+/)
    .map((segment) => segment[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function buildMarketplaceUpdatedLabel(
  item: MarketplaceSkill,
  messages: Pick<PublicMarketplaceMessages, "skillUpdatedPrefix" | "skillRecentlyUpdated">,
  locale: "zh" | "en"
): string {
  if (!item.updated_at) {
    return messages.skillRecentlyUpdated;
  }

  return `${messages.skillUpdatedPrefix} ${formatPublicDate(item.updated_at, locale)}`;
}

export function buildMarketplaceMetaSegments(
  item: MarketplaceSkill,
  messages: Pick<PublicMarketplaceMessages, "skillStarsSuffix" | "skillQualitySuffix" | "skillUpdatedPrefix" | "skillRecentlyUpdated">,
  locale: "zh" | "en",
  maxSegments = 4
): string[] {
  return [
    resolveMarketplaceSkillSubcategoryLabel(item),
    `${item.star_count} ${messages.skillStarsSuffix}`,
    `${item.quality_score.toFixed(1)} ${messages.skillQualitySuffix}`,
    buildMarketplaceUpdatedLabel(item, messages, locale)
  ]
    .filter(Boolean)
    .slice(0, maxSegments);
}

export function buildMarketplaceDeckChips(item: MarketplaceSkill, limit = 2): string[] {
  return [resolveMarketplaceSkillCategoryLabel(item), item.source_type, ...item.tags].filter(Boolean).slice(0, limit);
}
