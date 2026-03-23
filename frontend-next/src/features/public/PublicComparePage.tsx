"use client";

import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import type { PublicMarketplaceResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";

import { MarketplaceCompareForm } from "./marketplace/MarketplaceCompareForm";
import { MarketplaceCompareSelectionList } from "./marketplace/MarketplaceCompareSelectionList";
import { MarketplaceResultsStage } from "./marketplace/MarketplaceResultsStage";
import { MarketplaceSupportCard } from "./marketplace/MarketplaceSupportCard";
import { MarketplaceSupportLinkList } from "./marketplace/MarketplaceSupportLinkList";
import { buildPublicComparePageModel } from "./publicComparePageModel";

interface PublicComparePageProps {
  marketplace: PublicMarketplaceResponse;
  comparePayload: PublicSkillCompareResponse | null;
  leftSkillId: number;
  rightSkillId: number;
}

export function PublicComparePage({ marketplace, comparePayload, leftSkillId, rightSkillId }: PublicComparePageProps) {
  const { toPublicPath } = usePublicRouteState();
  const model = buildPublicComparePageModel({
    marketplace,
    comparePayload,
    leftSkillId,
    rightSkillId,
    resolvePath: toPublicPath
  });

  return (
    <div className="marketplace-main-column">
      <section className="marketplace-section-card">
        <div className="marketplace-section-header">
          <p className="marketplace-kicker">{model.stageEyebrow}</p>
          <h2>{model.stageTitle}</h2>
          <p>{model.stageDescription}</p>
        </div>
      </section>

      <MarketplaceResultsStage
        mainContent={
          <MarketplaceSupportCard
            title={model.selectedSkillsTitle}
            description={model.selectedSkillsDescription}
          >
            {model.compareSelections.length > 0 ? (
              <>
                <MarketplaceCompareSelectionList items={model.compareSelections} />
                <MarketplaceSupportLinkList items={model.selectedSkillLinks} />
              </>
            ) : (
              <div className="marketplace-empty-state">
                <p>{model.emptyStateMessage}</p>
              </div>
            )}
          </MarketplaceSupportCard>
        }
        sideContent={
          <>
            <MarketplaceSupportCard
              title={model.compareFormTitle}
              description={model.compareFormDescription}
            >
              <MarketplaceCompareForm
                action={model.compareFormAction}
                items={model.compareFormItems}
                leftValue={model.compareFormLeftValue}
                rightValue={model.compareFormRightValue}
                leftAriaLabel={model.compareFormLeftAriaLabel}
                rightAriaLabel={model.compareFormRightAriaLabel}
                submitLabel={model.compareFormSubmitLabel}
              />
            </MarketplaceSupportCard>

            <MarketplaceSupportCard
              title={model.continueTitle}
              description={model.continueDescription}
            >
              <MarketplaceSupportLinkList items={model.continueLinks} />
            </MarketplaceSupportCard>
          </>
        }
      />
    </div>
  );
}
