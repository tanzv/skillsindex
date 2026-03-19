"use client";

import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";

import { MarketplaceCompareForm } from "./marketplace/MarketplaceCompareForm";
import { MarketplaceCompareSelectionList } from "./marketplace/MarketplaceCompareSelectionList";
import { MarketplaceResultsStage } from "./marketplace/MarketplaceResultsStage";
import { MarketplaceSupportCard } from "./marketplace/MarketplaceSupportCard";
import { MarketplaceSupportLinkList } from "./marketplace/MarketplaceSupportLinkList";
import { resolveMarketplaceSkillCategoryLabel, resolveMarketplaceSkillSubcategoryLabel } from "./marketplace/marketplaceTaxonomy";
import { resolveComparedSkills } from "./publicCompareModel";

interface PublicComparePageProps {
  marketplace: PublicMarketplaceResponse;
  comparePayload: PublicSkillCompareResponse | null;
  leftSkillId: number;
  rightSkillId: number;
}

export function PublicComparePage({ marketplace, comparePayload, leftSkillId, rightSkillId }: PublicComparePageProps) {
  const { toPublicPath } = usePublicRouteState();
  const { leftSkill, rightSkill } = resolveComparedSkills(marketplace, comparePayload, leftSkillId, rightSkillId);
  const compareSelections = [leftSkill, rightSkill].flatMap((skill, index) =>
    skill
      ? [
          {
            key: `${skill.id}-${index}`,
            label: index === 0 ? "Left skill" : "Right skill",
            title: skill.name,
            description: skill.description,
            metrics: [
              `${resolveMarketplaceSkillCategoryLabel(skill)} / ${resolveMarketplaceSkillSubcategoryLabel(skill)}`,
              `Source ${skill.source_type || "-"}`,
              `${skill.star_count} stars`,
              `${skill.quality_score.toFixed(1)} quality`
            ]
          }
        ]
      : []
  );

  return (
    <div className="marketplace-main-column">
      <section className="marketplace-section-card">
        <div className="marketplace-section-header">
          <p className="marketplace-kicker">Rankings</p>
          <h2>Skill Compare</h2>
          <p>Compare two marketplace skills using the same public data contracts exposed by the backend.</p>
        </div>
      </section>

      <MarketplaceResultsStage
        mainContent={
          <MarketplaceSupportCard
            title="Selected skills"
            description="Review the current comparison pair before opening the ranking ledger or a specific skill detail."
          >
            {compareSelections.length > 0 ? (
              <>
                <MarketplaceCompareSelectionList items={compareSelections} />
                <MarketplaceSupportLinkList
                  items={[leftSkill, rightSkill].flatMap((skill, index) =>
                    skill
                      ? [
                          {
                            key: `compare-detail-${skill.id}-${index}`,
                            href: `/skills/${skill.id}`,
                            label: `Open ${skill.name}`,
                            meta: "Skill detail"
                          }
                        ]
                      : []
                  )}
                />
              </>
            ) : (
              <div className="marketplace-empty-state">
                <p>No skill selected.</p>
              </div>
            )}
          </MarketplaceSupportCard>
        }
        sideContent={
          <>
            <MarketplaceSupportCard
              title="Compare skills"
              description="Choose any pair from the public marketplace catalog and keep the comparison context in sync."
            >
              <MarketplaceCompareForm
                action={toPublicPath("/compare")}
                items={marketplace.items.map((item) => ({ id: item.id, name: item.name }))}
                leftValue={String(leftSkill?.id || leftSkillId || marketplace.items[0]?.id || "")}
                rightValue={String(rightSkill?.id || rightSkillId || marketplace.items[1]?.id || "")}
                leftAriaLabel="Left skill"
                rightAriaLabel="Right skill"
                submitLabel="Compare"
              />
            </MarketplaceSupportCard>

            <MarketplaceSupportCard
              title="Continue exploring"
              description="Move between adjacent marketplace views without losing the comparison context."
            >
              <MarketplaceSupportLinkList
                items={[
                  {
                    key: "compare-rankings",
                    href: toPublicPath("/rankings"),
                    label: "Open rankings",
                    meta: "Ranking ledger"
                  },
                  {
                    key: "compare-categories",
                    href: toPublicPath("/categories"),
                    label: "Browse categories",
                    meta: "Category hub"
                  },
                  {
                    key: "compare-results",
                    href: toPublicPath("/results"),
                    label: "Open results",
                    meta: "Search ledger"
                  }
                ]}
              />
            </MarketplaceSupportCard>
          </>
        }
      />
    </div>
  );
}
