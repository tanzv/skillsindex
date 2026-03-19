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

type SkillHeaderAccentVariant = "cobalt" | "ember" | "emerald" | "plum";

function resolveSourceBadge(sourceType: string | undefined, fallback: string): string {
  return String(sourceType || "").trim() || fallback;
}

function buildSkillMonogram(name: string): string {
  const segments = String(name || "")
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

  if (segments.length === 0) {
    return "SI";
  }

  return segments
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

function resolveCompactSourceLabel(sourceURL: string | undefined, fallback: string): string {
  const normalizedSourceURL = String(sourceURL || "").trim();
  if (!normalizedSourceURL) {
    return fallback;
  }

  try {
    const parsed = new URL(normalizedSourceURL);
    const pathSegments = parsed.pathname.split("/").filter(Boolean);

    if (pathSegments.length >= 2) {
      return `${pathSegments[0]}/${pathSegments[1]}`;
    }

    if (pathSegments.length === 1) {
      return pathSegments[0];
    }

    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return normalizedSourceURL;
  }
}

function resolveHeaderAccentVariant(skill: PublicSkillDetailResponse["skill"]): SkillHeaderAccentVariant {
  const source = `${skill.category}:${skill.subcategory}:${skill.source_type}:${skill.name}`;
  const variants: SkillHeaderAccentVariant[] = ["cobalt", "ember", "emerald", "plum"];
  const hash = Array.from(source).reduce((total, character) => total + character.charCodeAt(0), 0);
  return variants[hash % variants.length];
}

export function SkillDetailHeader({ detail, locale, messages, model }: SkillDetailHeaderProps) {
  const categoryLabel = resolveMarketplaceSkillCategoryLabel(detail.skill);
  const subcategoryLabel = resolveMarketplaceSkillSubcategoryLabel(detail.skill);
  const sourceBadge = resolveSourceBadge(detail.skill.source_type, messages.skillDetailNotAvailable);
  const compactSourceLabel = resolveCompactSourceLabel(detail.skill.source_url, `${categoryLabel} / ${subcategoryLabel}`);
  const accentVariant = resolveHeaderAccentVariant(detail.skill);
  const updatedLabel = formatPublicDate(detail.skill.updated_at, locale);
  const starCountLabel = new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US").format(detail.skill.star_count);
  const metadataChips = [
    `${messages.skillDetailFactCategory} ${categoryLabel} / ${subcategoryLabel}`,
    `${messages.skillDetailFactSourceType} ${sourceBadge}`,
    `${messages.skillDetailFactUpdated} ${updatedLabel}`,
    `${messages.skillDetailFactStars} ${detail.skill.star_count}`
  ];

  return (
    <section className="marketplace-section-card skill-detail-header-card" data-testid="skill-detail-header">
      <div className="skill-detail-header-layout">
        <div className="skill-detail-header-copy skill-detail-header-main">
          <p className="marketplace-kicker">{messages.stageSkillDetail}</p>

          <div className="skill-detail-header-identity" data-testid="skill-detail-header-identity">
            <div className={`skill-detail-header-avatar is-${accentVariant}`} aria-hidden="true">
              <span className="skill-detail-header-avatar-monogram">{buildSkillMonogram(detail.skill.name)}</span>
            </div>

            <div className="skill-detail-header-identity-copy">
              <div className="skill-detail-header-title-row">
                <h1 className="skill-detail-header-title">{detail.skill.name}</h1>
                <span className="skill-detail-header-quality-badge">{detail.skill.quality_score.toFixed(1)}</span>
              </div>

              <div className="skill-detail-header-support-row" aria-label={messages.stageSkillDetail}>
                <span className="skill-detail-header-support-pill">{sourceBadge}</span>
                <span className="skill-detail-header-support-meta">{compactSourceLabel}</span>
                <span className="skill-detail-header-support-meta">{updatedLabel}</span>
                <span className="skill-detail-header-support-meta">{starCountLabel}</span>
              </div>
            </div>
          </div>

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
