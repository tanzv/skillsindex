import type { PublicSkillDetailResponse } from "@/src/lib/schemas/public";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { formatPublicDate, type PublicLocale } from "@/src/lib/i18n/publicLocale";

import type { PublicSkillDetailModel } from "../publicSkillDetailModel";
import { resolveMarketplaceSkillCategoryLabel, resolveMarketplaceSkillSubcategoryLabel } from "../marketplace/marketplaceTaxonomy";

interface SkillDetailHeaderProps {
  detail: PublicSkillDetailResponse;
  locale: PublicLocale;
  messages: Pick<
    PublicMarketplaceMessages,
    | "stageSkillDetail"
    | "skillDetailFactUpdated"
    | "skillDetailFactStars"
    | "skillDetailNotAvailable"
    | "skillDetailFactCategory"
    | "skillDetailFactSourceType"
  >;
  model: PublicSkillDetailModel;
}

function resolveSourceBadge(sourceType: string | undefined, fallback: string): string {
  return String(sourceType || "").trim() || fallback;
}

export function SkillDetailHeader({ detail, locale, messages, model }: SkillDetailHeaderProps) {
  const metadataChips = [
    `${messages.skillDetailFactCategory} ${resolveMarketplaceSkillCategoryLabel(detail.skill)} / ${resolveMarketplaceSkillSubcategoryLabel(detail.skill)}`,
    `${messages.skillDetailFactSourceType} ${resolveSourceBadge(detail.skill.source_type, messages.skillDetailNotAvailable)}`,
    `${messages.skillDetailFactUpdated} ${formatPublicDate(detail.skill.updated_at, locale)}`,
    `${messages.skillDetailFactStars} ${detail.skill.star_count}`
  ];

  return (
    <section className="marketplace-section-card skill-detail-header-card" data-testid="skill-detail-header">
      <div className="skill-detail-header-layout">
        <div className="skill-detail-header-copy skill-detail-header-main">
          <p className="marketplace-kicker">{messages.stageSkillDetail}</p>
          <h1 className="skill-detail-header-title">{detail.skill.name}</h1>
          <p className="skill-detail-header-description">{detail.skill.description}</p>

          <div className="skill-detail-meta-strip" aria-label={messages.stageSkillDetail}>
            {metadataChips.map((chip) => (
              <span key={chip} className="skill-detail-meta-chip">
                {chip}
              </span>
            ))}
          </div>

          {detail.skill.tags.length > 0 ? (
            <div className="skill-detail-tag-strip">
              {detail.skill.tags.map((tag) => (
                <span key={tag} className="skill-detail-tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {model.summaryMetrics.length > 0 ? (
          <div className="skill-detail-header-aside" data-testid="skill-detail-header-summary">
            <div className="skill-detail-top-summary" aria-label={messages.stageSkillDetail}>
              {model.summaryMetrics.map((metric) => (
                <div key={metric.label} className="skill-detail-top-summary-card">
                  <span className="skill-detail-top-summary-label">{metric.label}</span>
                  <span className="skill-detail-top-summary-value">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
