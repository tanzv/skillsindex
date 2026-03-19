import type { RankingCategoryLeader } from "../publicRankingModel";

import { cn } from "@/src/lib/utils";

interface MarketplaceCategoryLeadersListProps {
  leaders: RankingCategoryLeader[];
  skillCountSuffix: string;
  leadingSkillPrefix: string;
  averageQualityPrefix: string;
  className?: string;
  testId?: string;
}

export function MarketplaceCategoryLeadersList({
  leaders,
  skillCountSuffix,
  leadingSkillPrefix,
  averageQualityPrefix,
  className,
  testId
}: MarketplaceCategoryLeadersListProps) {
  if (leaders.length === 0) {
    return null;
  }

  return (
    <div className={cn("marketplace-list-stack", className)} data-testid={testId}>
      {leaders.map((leader) => (
        <div key={leader.category} className="marketplace-compare-card">
          <div className="marketplace-support-summary-head">
            <span className="marketplace-sidebar-link">{leader.category}</span>
            <span className="marketplace-meta-text">
              {leader.count} {skillCountSuffix}
            </span>
          </div>
          <p className="marketplace-meta-text">
            {leadingSkillPrefix}: {leader.leadingSkillName}
          </p>
          <p className="marketplace-meta-text">
            {averageQualityPrefix} {leader.averageQuality.toFixed(1)}
          </p>
        </div>
      ))}
    </div>
  );
}
