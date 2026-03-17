"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface MarketplaceSearchStripProps {
  variant: "entry" | "results";
  contextLabel?: string;
  title?: string;
  description?: string;
  recommendationLabel: string;
  suggestions: Array<{
    href: string;
    label: string;
  }>;
  formContent: ReactNode;
  utilityContent: ReactNode;
}

function renderSuggestions(
  variant: "entry" | "results",
  recommendationLabel: string,
  suggestions: Array<{
    href: string;
    label: string;
  }>
) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="marketplace-top-recommendations">
      <span className="marketplace-pill-label">{recommendationLabel}</span>
      {suggestions.slice(0, variant === "entry" ? 3 : 6).map((suggestion) => (
        <Link key={`${suggestion.href}-${suggestion.label}`} href={suggestion.href} className="marketplace-recommendation-chip">
          {suggestion.label}
        </Link>
      ))}
    </div>
  );
}

export function MarketplaceSearchStrip({
  variant,
  contextLabel,
  title,
  description,
  recommendationLabel,
  suggestions,
  formContent,
  utilityContent
}: MarketplaceSearchStripProps) {
  const suggestionsContent = renderSuggestions(variant, recommendationLabel, suggestions);

  return (
    <section className="marketplace-search-strip">
      <div className="marketplace-search-strip-body">
        {contextLabel || title || description ? (
          <div className="marketplace-section-header">
            {contextLabel ? <p className="marketplace-kicker">{contextLabel}</p> : null}
            {title ? <h2 className="marketplace-section-title">{title}</h2> : null}
            {description ? <p className="marketplace-section-description">{description}</p> : null}
          </div>
        ) : null}

        {variant === "entry" ? suggestionsContent : null}
        {formContent}
        {variant === "results" ? suggestionsContent : null}
        {utilityContent}
      </div>
    </section>
  );
}
