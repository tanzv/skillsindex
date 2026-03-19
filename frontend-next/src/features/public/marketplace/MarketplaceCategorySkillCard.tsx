"use client";

import { PublicLink } from "@/src/components/shared/PublicLink";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import type { MarketplaceSkill } from "@/src/lib/schemas/public";

import {
  buildMarketplaceCoverLabel,
  buildMarketplaceDeckChips,
  buildMarketplaceMetaSegments
} from "./marketplaceCardViewModel";
import { resolveMarketplaceSkillCategoryLabel, resolveMarketplaceSkillSubcategoryLabel } from "./marketplaceTaxonomy";

interface MarketplaceCategorySkillCardProps {
  item: MarketplaceSkill;
}

function resolveSkillEyebrow(item: MarketplaceSkill): string {
  const categoryLabel = resolveMarketplaceSkillCategoryLabel(item);
  const subcategoryLabel = resolveMarketplaceSkillSubcategoryLabel(item);
  const sourceLabel = String(item.source_type || "").trim();

  return [subcategoryLabel || categoryLabel, sourceLabel].filter(Boolean).join(" / ");
}

export function MarketplaceCategorySkillCard({ item }: MarketplaceCategorySkillCardProps) {
  const { locale, messages } = usePublicI18n();
  const chips = buildMarketplaceDeckChips(item, 3);
  const metaSegments = buildMarketplaceMetaSegments(item, messages, locale, 3);
  const eyebrow = resolveSkillEyebrow(item);

  return (
    <PublicLink
      href={`/skills/${item.id}`}
      className="marketplace-category-skill-card-link"
      aria-label={item.name}
      warmOnViewport
    >
      <article className="marketplace-category-skill-card">
        <div className="marketplace-category-skill-card-head">
          <span className="marketplace-category-skill-card-avatar" aria-hidden="true">
            {buildMarketplaceCoverLabel(item)}
          </span>

          <div className="marketplace-category-skill-card-identity">
            <span className="marketplace-category-skill-card-eyebrow">{eyebrow}</span>
            <h3 className="marketplace-category-skill-card-title">{item.name}</h3>
          </div>

          <span className="marketplace-category-skill-card-score">
            <strong>{item.star_count}</strong>
            <small>{messages.skillStarsSuffix}</small>
          </span>
        </div>

        <p className="marketplace-category-skill-card-description">{item.description}</p>

        <div className="marketplace-category-skill-card-chip-row">
          {chips.map((chip) => (
            <span key={`${item.id}-${chip}`} className="marketplace-skill-chip">
              {chip}
            </span>
          ))}
        </div>

        <div className="marketplace-category-skill-card-foot">
          {metaSegments.map((segment, index) => (
            <span key={`${item.id}-${segment}-${index}`}>{segment}</span>
          ))}
        </div>
      </article>
    </PublicLink>
  );
}
