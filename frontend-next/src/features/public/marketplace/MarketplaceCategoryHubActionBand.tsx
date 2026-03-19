"use client";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";

import { MarketplaceChipControlGroup } from "./MarketplaceChipControlGroup";
import type { MarketplaceCategoryHubAudience } from "./marketplaceCategoryHubModel";
import { MarketplaceSearchForm } from "./MarketplaceSearchForm";

export function buildCategoryHubAudienceHref(
  nextAudience: MarketplaceCategoryHubAudience,
  query: string,
  semanticQuery: string,
  toPublicLinkTarget: (route: string) => { href: string; as?: string }
): string {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  if (semanticQuery.trim()) {
    params.set("tags", semanticQuery.trim());
  }

  if (nextAudience !== "agent") {
    params.set("audience", nextAudience);
  }

  const route = params.toString() ? `/categories?${params.toString()}` : "/categories";
  const target = toPublicLinkTarget(route);
  return target.as || target.href;
}

function resolveCategoryHubAudienceDescription(
  messages: ReturnType<typeof usePublicI18n>["messages"],
  audience: MarketplaceCategoryHubAudience
): string {
  return audience === "human" ? messages.categoryHubAudienceHumanDescription : messages.categoryHubAudienceAgentDescription;
}

interface MarketplaceCategoryHubActionBandProps {
  audience: MarketplaceCategoryHubAudience;
  query: string;
  semanticQuery: string;
  submitSkillHref: string;
}

export function MarketplaceCategoryHubActionBand({
  audience,
  query,
  semanticQuery,
  submitSkillHref
}: MarketplaceCategoryHubActionBandProps) {
  const { messages } = usePublicI18n();
  const { toPublicPath, toPublicLinkTarget } = usePublicRouteState();
  const audienceItems = [
    {
      key: "agent",
      href: buildCategoryHubAudienceHref("agent", query, semanticQuery, toPublicLinkTarget),
      label: messages.categoryHubAudienceAgent,
      isActive: audience === "agent"
    },
    {
      key: "human",
      href: buildCategoryHubAudienceHref("human", query, semanticQuery, toPublicLinkTarget),
      label: messages.categoryHubAudienceHuman,
      isActive: audience === "human"
    }
  ];

  return (
    <section className="marketplace-section-card marketplace-category-reference-actions" data-testid="category-hub-actions">
      <article className="marketplace-category-action-card" data-testid="category-hub-audience-card">
        <div className="marketplace-section-header">
          <h3>{messages.categoryHubAudienceLabel}</h3>
          <p>{resolveCategoryHubAudienceDescription(messages, audience)}</p>
        </div>

        <MarketplaceChipControlGroup
          label={messages.categoryHubAudienceLabel}
          items={audienceItems}
          ariaLabel={messages.categoryHubAudienceLabel}
          className="marketplace-category-action-group"
          rowClassName="marketplace-category-action-row"
        />
      </article>

      <article className="marketplace-category-action-card marketplace-category-action-card-search" data-testid="category-hub-search-card">
        <div className="marketplace-section-header">
          <h3>{messages.shellSearch}</h3>
          <p>{messages.categoryHubSearchDescription}</p>
        </div>

        <MarketplaceSearchForm
          action={toPublicPath("/results")}
          query={query}
          semanticQuery={semanticQuery}
          placeholder={messages.searchPlaceholder}
          semanticPlaceholder={messages.searchSemanticPlaceholder}
          submitLabel={messages.searchButton}
          queryAriaLabel={messages.shellSearch}
          semanticAriaLabel={messages.searchSemanticLabel}
          formClassName="marketplace-category-search-form"
          rowClassName="marketplace-search-main-row marketplace-category-search-row"
          hiddenFields={semanticQuery.trim() ? [{ name: "tags", value: semanticQuery.trim() }] : []}
        />
      </article>

      <article className="marketplace-category-action-card" data-testid="category-hub-submit-card">
        <div className="marketplace-section-header">
          <h3>{messages.categoryHubSubmitSkill}</h3>
          <p>{messages.categoryHubSubmitDescription}</p>
        </div>

        <div className="marketplace-pill-row marketplace-category-action-links">
          <PublicLink href={submitSkillHref} className="marketplace-topbar-button is-primary" data-testid="category-hub-submit-skill">
            {messages.categoryHubSubmitSkill}
          </PublicLink>
          <PublicLink href={toPublicPath("/docs")} className="marketplace-topbar-button">
            {messages.shellDocs}
          </PublicLink>
        </div>
      </article>
    </section>
  );
}
