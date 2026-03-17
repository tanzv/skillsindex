"use client";

import { useMemo } from "react";

import { PublicShellRegistration } from "@/src/components/shared/PublicShellSlots";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { MarketplaceHomeHero } from "./marketplace/MarketplaceHomeHero";
import { MarketplaceSearchPanel } from "./marketplace/MarketplaceSearchPanel";
import { MarketplaceHomeVirtualFeed } from "./marketplace/MarketplaceHomeVirtualFeed";
import { resolveFeaturedMarketplaceItems, resolveLatestMarketplaceItems } from "./marketplace/marketplaceViewModel";
import { useMarketplaceTopbarSlots } from "./marketplace/useMarketplaceTopbarSlots";

interface PublicLandingProps {
  marketplace: PublicMarketplaceResponse;
}

export function PublicLanding({ marketplace }: PublicLandingProps) {
  const { messages } = usePublicI18n();
  const featuredItems = resolveFeaturedMarketplaceItems(marketplace.items, 3);
  const featuredItemIds = useMemo(() => new Set(featuredItems.map((item) => item.id)), [featuredItems]);
  const latestItems = useMemo(() => {
    const resolvedItems = resolveLatestMarketplaceItems(marketplace.items, marketplace.items.length || 6, featuredItemIds);
    return resolvedItems.length > 0 ? resolvedItems : featuredItems;
  }, [featuredItemIds, featuredItems, marketplace.items]);
  const featuredChips = marketplace.top_tags.slice(0, 3).map((tag) => tag.name);
  const latestChips = marketplace.categories.slice(0, 4).map((category) => category.name);
  const shellSlots = useMarketplaceTopbarSlots({ variant: "landing" });

  return (
    <div className="marketplace-main-column marketplace-home-stage">
      <PublicShellRegistration slots={shellSlots} />

      <div className="marketplace-home-stage-head">
        <section className="marketplace-home-entry-shell">
          <MarketplaceHomeHero />
        </section>

        <section className="marketplace-home-search-shell" data-testid="landing-search-strip">
          <MarketplaceSearchPanel
            variant="entry"
            action="/results"
            query=""
            suggestions={marketplace.top_tags.map((tag) => tag.name)}
            readOnlyQuery
            showSubmitAction={false}
            showRecentAction={false}
          />
        </section>
      </div>

      <MarketplaceHomeVirtualFeed
        featuredItems={featuredItems}
        latestItems={latestItems}
        featuredTitle={messages.landingCuratedTitle}
        featuredDescription={messages.landingCuratedDescription}
        featuredChips={featuredChips}
        latestTitle={messages.landingLatestTitle}
        latestDescription={messages.landingLatestDescription}
        latestChips={latestChips}
      />
    </div>
  );
}
