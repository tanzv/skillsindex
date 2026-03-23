import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { formatPublicDate, type PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { PublicSkillDetailResponse } from "@/src/lib/schemas/public";

import type { PublicSkillDetailModel } from "../publicSkillDetailModel";
import { SkillDetailOverviewCommentsCard } from "./SkillDetailOverviewCommentsCard";
import { SkillDetailOverviewMetricsCard } from "./SkillDetailOverviewMetricsCard";
import { SkillDetailOverviewRelatedCard } from "./SkillDetailOverviewRelatedCard";
import { SkillDetailOverviewSummaryCard } from "./SkillDetailOverviewSummaryCard";
import type { SkillDetailOverviewModel } from "./skillDetailWorkbenchOverview";

interface SkillDetailOverviewPanelProps {
  detail: PublicSkillDetailResponse;
  locale: PublicLocale;
  messages: Pick<
    PublicMarketplaceMessages,
    | "rankingOpenSkillLabel"
    | "skillDetailContentTitle"
    | "skillDetailMetricsComments"
    | "skillDetailMetricsRatings"
    | "skillDetailNoComments"
    | "skillDetailOverviewDescription"
    | "skillDetailOverviewMetricsTitle"
    | "skillDetailOverviewTitle"
    | "skillDetailRelatedDescription"
    | "skillDetailRelatedTitle"
    | "skillDetailUpdatedBadgePrefix"
  >;
  model: PublicSkillDetailModel;
  overviewModel: SkillDetailOverviewModel;
}

function normalizeRatingAverage(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return value > 5 ? value / 2 : value;
}

export function SkillDetailOverviewPanel({
  detail,
  locale,
  messages,
  model,
  overviewModel
}: SkillDetailOverviewPanelProps) {
  const latestComments = detail.comments.slice(0, 6);
  const displayRatingAverage = normalizeRatingAverage(detail.stats.rating_average);
  const ratingAverage = displayRatingAverage > 0 ? displayRatingAverage.toFixed(1) : "0.0";
  const previewBadge = overviewModel.previewUpdatedAt
    ? `${messages.skillDetailUpdatedBadgePrefix} ${formatPublicDate(overviewModel.previewUpdatedAt, locale)}`
    : undefined;

  return (
    <div className="skill-detail-overview-shell">
      <SkillDetailOverviewSummaryCard
        messages={messages}
        overviewFacts={model.overviewFacts}
        overviewModel={overviewModel}
        previewBadge={previewBadge}
      />

      <SkillDetailOverviewRelatedCard messages={messages} relatedSkills={model.relatedSkills} />

      <SkillDetailOverviewMetricsCard
        displayRatingAverage={displayRatingAverage}
        messages={messages}
        ratingAverage={ratingAverage}
        summaryMetrics={model.summaryMetrics}
      />

      <SkillDetailOverviewCommentsCard
        commentCount={detail.stats.comment_count}
        comments={latestComments}
        displayRatingAverage={displayRatingAverage}
        locale={locale}
        messages={messages}
      />
    </div>
  );
}
