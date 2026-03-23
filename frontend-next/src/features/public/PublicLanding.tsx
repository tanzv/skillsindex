"use client";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { MarketplaceEntrySearchPanel } from "./marketplace/MarketplaceEntrySearchPanel";
import { MarketplaceHomeHero } from "./marketplace/MarketplaceHomeHero";
import { MarketplaceHomeVirtualFeed } from "./marketplace/MarketplaceHomeVirtualFeed";
import { usePublicSkillBatchWarmup } from "./marketplace/usePublicSkillBatchWarmup";
import { buildPublicLandingPageModel } from "./publicLandingPageModel";

interface PublicLandingProps {
  marketplace: PublicMarketplaceResponse;
}

export function PublicLanding({ marketplace }: PublicLandingProps) {
  const { messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const model = buildPublicLandingPageModel({
    marketplace,
    messages,
    resolvePath: toPublicPath
  });

  usePublicSkillBatchWarmup(model.skillWarmupTargets);

  return (
    <div className="marketplace-main-column marketplace-home-stage">
      <div className="marketplace-home-stage-head">
        <section className="marketplace-home-entry-shell">
          <MarketplaceHomeHero summary={model.landingSummary} />
        </section>

        <section className="marketplace-home-search-shell" data-testid="landing-search-strip">
          <MarketplaceEntrySearchPanel
            action={model.searchAction}
            suggestions={model.searchSuggestions}
          />
        </section>
      </div>

      <MarketplaceHomeVirtualFeed
        featuredItems={model.featuredItems}
        latestItems={model.latestItems}
        featuredTitle={model.featuredTitle}
        featuredDescription={model.featuredDescription}
        featuredChips={model.featuredChips}
        latestTitle={model.latestTitle}
        latestDescription={model.latestDescription}
        latestChips={model.latestChips}
      />
    </div>
  );
}
