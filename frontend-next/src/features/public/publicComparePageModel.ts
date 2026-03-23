import type { PublicMarketplaceResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";
import {
  resolveMarketplaceSkillCategoryLabel,
  resolveMarketplaceSkillSubcategoryLabel
} from "@/src/lib/marketplace/taxonomy";
import {
  publicCategoriesRoute,
  publicCompareRoute,
  publicRankingsRoute,
  publicResultsRoute
} from "@/src/lib/routing/publicRouteRegistry";

import type { MarketplaceCompareSelectionItem } from "./marketplace/MarketplaceCompareSelectionList";
import { resolveComparedSkillsFromItems } from "./publicCompareModel";

export interface PublicComparePageLinkItem {
  key: string;
  href: string;
  label: string;
  meta: string;
}

export interface PublicComparePageModel {
  stageEyebrow: string;
  stageTitle: string;
  stageDescription: string;
  selectedSkillsTitle: string;
  selectedSkillsDescription: string;
  compareSelections: MarketplaceCompareSelectionItem[];
  selectedSkillLinks: PublicComparePageLinkItem[];
  emptyStateMessage: string;
  compareFormTitle: string;
  compareFormDescription: string;
  compareFormAction: string;
  compareFormItems: Array<{ id: number; name: string }>;
  compareFormLeftValue: string;
  compareFormRightValue: string;
  compareFormLeftAriaLabel: string;
  compareFormRightAriaLabel: string;
  compareFormSubmitLabel: string;
  continueTitle: string;
  continueDescription: string;
  continueLinks: PublicComparePageLinkItem[];
}

export interface BuildPublicComparePageModelInput {
  marketplace: PublicMarketplaceResponse;
  comparePayload: PublicSkillCompareResponse | null;
  leftSkillId: number;
  rightSkillId: number;
  resolvePath: (route: string) => string;
}

export function buildPublicComparePageModel({
  marketplace,
  comparePayload,
  leftSkillId,
  rightSkillId,
  resolvePath
}: BuildPublicComparePageModelInput): PublicComparePageModel {
  const { leftSkill, rightSkill } = resolveComparedSkillsFromItems(
    marketplace.items,
    comparePayload,
    leftSkillId,
    rightSkillId
  );
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

  return {
    stageEyebrow: "Rankings",
    stageTitle: "Skill Compare",
    stageDescription: "Compare two marketplace skills using the same public data contracts exposed by the backend.",
    selectedSkillsTitle: "Selected skills",
    selectedSkillsDescription:
      "Review the current comparison pair before opening the ranking ledger or a specific skill detail.",
    compareSelections,
    selectedSkillLinks: [leftSkill, rightSkill].flatMap((skill, index) =>
      skill
        ? [
            {
              key: `compare-detail-${skill.id}-${index}`,
              href: resolvePath(`/skills/${skill.id}`),
              label: `Open ${skill.name}`,
              meta: "Skill detail"
            }
          ]
        : []
    ),
    emptyStateMessage: "No skill selected.",
    compareFormTitle: "Compare skills",
    compareFormDescription: "Choose any pair from the public marketplace catalog and keep the comparison context in sync.",
    compareFormAction: resolvePath(publicCompareRoute),
    compareFormItems: marketplace.items.map((item) => ({ id: item.id, name: item.name })),
    compareFormLeftValue: String(leftSkill?.id || leftSkillId || marketplace.items[0]?.id || ""),
    compareFormRightValue: String(rightSkill?.id || rightSkillId || marketplace.items[1]?.id || ""),
    compareFormLeftAriaLabel: "Left skill",
    compareFormRightAriaLabel: "Right skill",
    compareFormSubmitLabel: "Compare",
    continueTitle: "Continue exploring",
    continueDescription: "Move between adjacent marketplace views without losing the comparison context.",
    continueLinks: [
      {
        key: "compare-rankings",
        href: resolvePath(publicRankingsRoute),
        label: "Open rankings",
        meta: "Ranking ledger"
      },
      {
        key: "compare-categories",
        href: resolvePath(publicCategoriesRoute),
        label: "Browse categories",
        meta: "Category hub"
      },
      {
        key: "compare-results",
        href: resolvePath(publicResultsRoute),
        label: "Open results",
        meta: "Search ledger"
      }
    ]
  };
}
