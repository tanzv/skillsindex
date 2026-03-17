"use client";

import Link from "next/link";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { MarketplaceSkill } from "@/src/lib/schemas/public";

import { buildMarketplaceCoverLabel, buildMarketplaceDeckChips, buildMarketplaceMetaSegments } from "./marketplaceCardViewModel";

interface MarketplaceHomeDeckCardProps {
  item: MarketplaceSkill;
}

const homeDeckBadgeLabel = "HD";

export function MarketplaceHomeDeckCard({ item }: MarketplaceHomeDeckCardProps) {
  const { locale, messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const chips = buildMarketplaceDeckChips(item);
  const metaSegments = buildMarketplaceMetaSegments(item, messages, locale, 3);

  return (
    <Link href={toPublicPath(`/skills/${item.id}`)} className="marketplace-skill-link marketplace-home-deck-link" aria-label={item.name}>
      <article className="marketplace-skill-row marketplace-home-deck-card">
        <div className="marketplace-card-head">
          <span className="marketplace-card-cover" aria-hidden="true">
            <span className="marketplace-card-cover-thumb">{buildMarketplaceCoverLabel(item)}</span>
            <span className="marketplace-card-cover-chip">{homeDeckBadgeLabel}</span>
          </span>
        </div>

        <div className="marketplace-skill-body marketplace-home-deck-body">
          <h3 className="marketplace-skill-name marketplace-home-deck-name">{item.name}</h3>
          <p className="marketplace-skill-description marketplace-home-deck-description">{item.description}</p>

          <div className="marketplace-skill-secondary marketplace-home-deck-secondary">
            <div className="marketplace-skill-chip-row marketplace-home-deck-chip-row">
              {chips.map((chip) => (
                <span key={`${item.id}-${chip}`} className="marketplace-skill-chip">
                  {chip}
                </span>
              ))}
            </div>

            <div className="marketplace-skill-row-foot marketplace-home-deck-foot">
              {metaSegments.map((segment, index) => (
                <span key={`${item.id}-${segment}-${index}`} className={index === 0 ? "is-primary" : undefined}>
                  {segment}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
