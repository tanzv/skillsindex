"use client";

import { PublicLink } from "@/src/components/shared/PublicLink";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import type { MarketplaceSkill } from "@/src/lib/schemas/public";

import { buildMarketplaceCoverLabel, buildMarketplaceMetaSegments } from "./marketplaceCardViewModel";
import { resolveMarketplaceSkillCategoryLabel } from "./marketplaceTaxonomy";

interface MarketplaceSkillCardProps {
  item: MarketplaceSkill;
  variant?: "featured" | "result";
}

export function MarketplaceSkillCard({ item, variant = "result" }: MarketplaceSkillCardProps) {
  const { locale } = usePublicI18n();
  const isFeatured = variant === "featured";
  const { messages } = usePublicI18n();
  const metaSegments = buildMarketplaceMetaSegments(item, messages, locale);

  return (
    <PublicLink href={`/skills/${item.id}`} className="marketplace-skill-link" aria-label={item.name} warmOnViewport>
      <article className={isFeatured ? "marketplace-skill-row is-featured" : "marketplace-skill-row"}>
        <div className="marketplace-skill-layout">
          <div className="marketplace-card-head">
            <span className="marketplace-card-cover" aria-hidden="true">
              <span className="marketplace-card-cover-thumb">{buildMarketplaceCoverLabel(item)}</span>
            </span>
          </div>

          <div className="marketplace-skill-body">
            <div className="marketplace-skill-heading">
              <div>
                <h3 className="marketplace-skill-name">{item.name}</h3>
                <p className="marketplace-skill-description">{item.description}</p>
              </div>
            </div>

            <div className="marketplace-skill-chip-row">
              <span className="marketplace-skill-chip">{resolveMarketplaceSkillCategoryLabel(item)}</span>
              <span className="marketplace-skill-chip">{item.source_type}</span>
              {item.tags.slice(0, 3).map((tag) => (
                <span key={`${item.id}-${tag}`} className="marketplace-skill-chip">
                  {tag}
                </span>
              ))}
            </div>

            <div className="marketplace-skill-row-foot">
              {metaSegments.map((segment, index) => (
                <span key={`${item.id}-${segment}-${index}`} className={index === 0 ? "is-primary" : undefined}>
                  {segment}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>
    </PublicLink>
  );
}
