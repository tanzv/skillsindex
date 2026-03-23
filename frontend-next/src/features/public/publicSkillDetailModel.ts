import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse,
  PublicSkillVersionsResponse,
} from "@/src/lib/schemas/public";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import {
  formatPublicDate,
  type PublicLocale,
} from "@/src/lib/i18n/publicLocale";

import {
  resolveSkillDetailCategoryLabel,
  resolveSkillDetailSubcategoryLabel,
} from "./skill-detail/skillDetailTaxonomy";

interface DetailMetric {
  label: string;
  value: string;
}

interface DetailItem {
  label: string;
  value: string;
  description?: string;
}

interface RelatedSkillItem {
  id: number;
  name: string;
  category: string;
  qualityScore: string;
}

export interface PublicSkillDetailModel {
  summaryMetrics: DetailMetric[];
  overviewFacts: DetailItem[];
  installationSteps: DetailItem[];
  resourceInsights: DetailItem[];
  versionHighlights: DetailItem[];
  relatedSkills: RelatedSkillItem[];
}

interface BuildPublicSkillDetailModelOptions {
  detail: PublicSkillDetailResponse;
  resources: PublicSkillResourcesResponse | null;
  versions: PublicSkillVersionsResponse | null;
  resourceContent: PublicSkillResourceContentResponse | null;
  locale: PublicLocale;
  messages: Pick<
    PublicMarketplaceMessages,
    | "skillDetailNotAvailable"
    | "skillDetailMetricsQuality"
    | "skillDetailMetricsFavorites"
    | "skillDetailMetricsRatings"
    | "skillDetailMetricsComments"
    | "skillDetailFactCategory"
    | "skillDetailFactSourceType"
    | "skillDetailFactUpdated"
    | "skillDetailFactStars"
    | "skillDetailInstallLabel"
    | "skillDetailInstallHelp"
    | "skillDetailRepositoryPathLabel"
    | "skillDetailRepositoryPathHelp"
    | "skillDetailExecutionContextLabel"
    | "skillDetailExecutionContextInteractive"
    | "skillDetailExecutionContextReadonly"
    | "skillDetailExecutionContextHelp"
    | "skillDetailResourceRepositoryLabel"
    | "skillDetailResourceBranchLabel"
    | "skillDetailResourceFilesLabel"
    | "skillDetailResourcePreviewLabel"
    | "skillDetailResourcePreviewLanguage"
    | "skillDetailVersionCapturedPrefix"
    | "skillDetailNoInstall"
  >;
}

function formatDate(value: string | undefined, locale: PublicLocale): string {
  if (!value) {
    return "";
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return formatPublicDate(value, locale);
}

function formatNumber(value: number): string {
  return Number.isFinite(value) ? String(value) : "0";
}

function resolveText(value: string | undefined, fallback: string): string {
  return String(value || "").trim() || fallback;
}

export function buildPublicSkillDetailModel({
  detail,
  resources,
  versions,
  resourceContent,
  locale,
  messages,
}: BuildPublicSkillDetailModelOptions): PublicSkillDetailModel {
  const relatedSkills = (detail.related_skills || [])
    .filter((skill) => skill.id !== detail.skill.id)
      .sort((left, right) => {
        const sameCategoryLeft =
        resolveSkillDetailCategoryLabel(left) ===
        resolveSkillDetailCategoryLabel(detail.skill)
          ? 1
          : 0;
      const sameCategoryRight =
        resolveSkillDetailCategoryLabel(right) ===
        resolveSkillDetailCategoryLabel(detail.skill)
          ? 1
          : 0;
      return (
        sameCategoryRight - sameCategoryLeft ||
        right.quality_score - left.quality_score ||
        right.star_count - left.star_count
      );
    })
    .slice(0, 3)
    .map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: `${resolveSkillDetailCategoryLabel(skill)} / ${resolveSkillDetailSubcategoryLabel(skill)}`,
      qualityScore: skill.quality_score.toFixed(1),
    }));

  return {
    summaryMetrics: [
      {
        label: messages.skillDetailMetricsQuality,
        value: detail.skill.quality_score.toFixed(1),
      },
      {
        label: messages.skillDetailMetricsFavorites,
        value: formatNumber(detail.stats.favorite_count),
      },
      {
        label: messages.skillDetailMetricsRatings,
        value: formatNumber(detail.stats.rating_count),
      },
      {
        label: messages.skillDetailMetricsComments,
        value: formatNumber(detail.stats.comment_count),
      },
    ],
    overviewFacts: [
      {
        label: messages.skillDetailFactCategory,
        value: `${resolveSkillDetailCategoryLabel(detail.skill)} / ${resolveSkillDetailSubcategoryLabel(detail.skill)}`,
      },
      {
        label: messages.skillDetailFactSourceType,
        value: resolveText(
          detail.skill.source_type,
          messages.skillDetailNotAvailable,
        ),
      },
      {
        label: messages.skillDetailFactUpdated,
        value: resolveText(
          formatDate(detail.skill.updated_at, locale),
          messages.skillDetailNotAvailable,
        ),
      },
      {
        label: messages.skillDetailFactStars,
        value: formatNumber(detail.skill.star_count),
      },
    ],
    installationSteps: [
      {
        label: messages.skillDetailInstallLabel,
        value: resolveText(
          detail.skill.install_command,
          messages.skillDetailNoInstall,
        ),
        description: messages.skillDetailInstallHelp,
      },
      {
        label: messages.skillDetailRepositoryPathLabel,
        value: resolveText(
          resources?.source_path || resourceContent?.path,
          messages.skillDetailNotAvailable,
        ),
        description: messages.skillDetailRepositoryPathHelp,
      },
      {
        label: messages.skillDetailExecutionContextLabel,
        value: detail.viewer_state.can_interact
          ? messages.skillDetailExecutionContextInteractive
          : messages.skillDetailExecutionContextReadonly,
        description: messages.skillDetailExecutionContextHelp,
      },
    ],
    resourceInsights: [
      {
        label: messages.skillDetailResourceRepositoryLabel,
        value: resolveText(
          resources?.repo_url ||
            resources?.source_url ||
            detail.skill.source_url,
          messages.skillDetailNotAvailable,
        ),
      },
      {
        label: messages.skillDetailResourceBranchLabel,
        value: resolveText(resources?.source_branch, "main"),
      },
      {
        label: messages.skillDetailResourceFilesLabel,
        value: formatNumber(
          resources?.file_count || resources?.files.length || 0,
        ),
      },
      {
        label: messages.skillDetailResourcePreviewLabel,
        value: resolveText(
          resourceContent?.display_name || resources?.files[0]?.display_name,
          messages.skillDetailNotAvailable,
        ),
        description: resourceContent?.language
          ? `${messages.skillDetailResourcePreviewLanguage}: ${resourceContent.language}`
          : undefined,
      },
    ],
    versionHighlights:
      versions?.items.slice(0, 4).map((version) => ({
        label: `v${version.version_number} · ${version.trigger}`,
        value: version.risk_level,
        description: `${version.change_summary} ${messages.skillDetailVersionCapturedPrefix} ${formatDate(version.captured_at, locale)}.`,
      })) || [],
    relatedSkills,
  };
}
