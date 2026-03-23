"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import type { PublicTopbarSlots } from "@/src/components/shared/PublicTopbar";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import {
  resolvePublicShellRouteKind as resolveRegistryPublicShellRouteKind,
  resolvePublicTopbarRoutePresetDescriptor,
  type PublicTopbarBreadcrumbKind,
  type PublicTopbarRoutePresetDescriptor
} from "@/src/lib/navigation/publicNavigationRegistry";
import { publicCategoriesRoute, publicHomeRoute } from "@/src/lib/routing/publicRouteRegistry";

import {
  MarketplaceHomeBrand,
  MarketplaceHomePrimaryNavigation,
  MarketplaceSkillDetailBrand,
  MarketplaceSkillDetailPrimaryNavigation,
  MarketplaceSkillDetailTopbarActions,
  MarketplaceSectionTopbarActions,
  MarketplaceTopbarStageStatus
} from "./MarketplaceTopbarPrimitives";
import { MarketplaceTopbarBreadcrumb } from "./MarketplaceTopbarBreadcrumb";

const MarketplaceHomeTopbarActions = dynamic(() =>
  import("./MarketplaceHomeTopbar").then((module) => module.MarketplaceHomeTopbarActions),
  {
    loading: () => (
      <div
        className="marketplace-topbar-actions marketplace-home-topbar-actions"
        data-marketplace-topbar-slot="actions"
        data-marketplace-topbar-variant="landing"
        aria-hidden="true"
      />
    )
  }
);

export type MarketplaceTopbarSlotVariant = "landing" | "market" | "skill-detail";
export type MarketplaceShellRouteKind = "landing" | "section" | "skill-detail" | "narrative" | "default";
export type MarketplaceShellContentWidth = "default" | "expanded";

export interface MarketplaceTopbarSlotsInput {
  belowContent?: ReactNode;
  stageLabel?: string;
  variant?: MarketplaceTopbarSlotVariant;
}

export interface MarketplaceTopbarRoutePreset {
  belowContent?: ReactNode;
  stageLabel?: string;
  variant: MarketplaceTopbarSlotVariant;
}

type MarketplaceStageMessages = Pick<
  PublicMarketplaceMessages,
  | "categoryBreadcrumbAriaLabel"
  | "categoryBrowseTitle"
  | "rankingTitle"
  | "resultsLedgerTitle"
  | "shellCategories"
  | "shellHome"
  | "stageCategories"
  | "stageRankings"
  | "stageSkillDetail"
  | "stageResults"
>;

export function resolveMarketplaceShellRouteKind(corePath: string): MarketplaceShellRouteKind {
  return resolveRegistryPublicShellRouteKind(corePath);
}

export function resolveMarketplaceShellContentWidth(routeKind: MarketplaceShellRouteKind): MarketplaceShellContentWidth {
  return routeKind === "skill-detail" || routeKind === "narrative" ? "expanded" : "default";
}

function formatRouteSegmentLabel(segment: string): string {
  return String(segment || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildPresetBreadcrumb(
  corePath: string,
  breadcrumbKind: PublicTopbarBreadcrumbKind,
  messages: MarketplaceStageMessages
): ReactNode | undefined {
  if (breadcrumbKind === "results") {
    return (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: publicHomeRoute, label: messages.shellHome },
          { label: messages.resultsLedgerTitle, isCurrent: true }
        ]}
        testId="search-shell-breadcrumb"
      />
    );
  }

  if (breadcrumbKind === "categories-index") {
    return (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: publicHomeRoute, label: messages.shellHome },
          { label: messages.categoryBrowseTitle, isCurrent: true }
        ]}
      />
    );
  }

  if (breadcrumbKind === "category-detail") {
    const categorySlug = corePath.split("/")[2] || "";
    const categoryLabel = formatRouteSegmentLabel(categorySlug) || messages.shellCategories;

    return (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: publicHomeRoute, label: messages.shellHome },
          { href: publicCategoriesRoute, label: messages.shellCategories },
          { label: categoryLabel, isCurrent: true }
        ]}
      />
    );
  }

  if (breadcrumbKind === "rankings") {
    return (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: publicHomeRoute, label: messages.shellHome },
          { label: messages.rankingTitle, isCurrent: true }
        ]}
      />
    );
  }

  if (breadcrumbKind === "skill-detail") {
    return (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.stageSkillDetail}
        className="skill-detail-shell-breadcrumb"
        testId="skill-detail-topbar-breadcrumb"
        items={[
          { href: publicHomeRoute, label: messages.shellHome },
          { label: messages.stageSkillDetail, isCurrent: true, isSoft: true }
        ]}
      />
    );
  }

  return undefined;
}

function resolvePresetStageLabel(
  descriptor: PublicTopbarRoutePresetDescriptor,
  messages: MarketplaceStageMessages
): string | undefined {
  switch (descriptor.stageId) {
    case "categories":
      return messages.stageCategories;
    case "rankings":
      return messages.stageRankings;
    case "results":
      return messages.stageResults;
    case "skill-detail":
      return messages.stageSkillDetail;
    default:
      return undefined;
  }
}

export function buildMarketplaceTopbarSlots({
  belowContent,
  stageLabel,
  variant = "landing"
}: MarketplaceTopbarSlotsInput = {}): PublicTopbarSlots {
  if (variant === "skill-detail") {
    return {
      brandContent: <MarketplaceSkillDetailBrand />,
      primaryNavigationContent: <MarketplaceSkillDetailPrimaryNavigation />,
      statusContent: <></>,
      actionsContent: <MarketplaceSkillDetailTopbarActions />,
      belowContent
    };
  }

  return {
    brandContent: <MarketplaceHomeBrand />,
    primaryNavigationContent: <MarketplaceHomePrimaryNavigation />,
    statusContent: stageLabel ? <MarketplaceTopbarStageStatus label={stageLabel} /> : <></>,
    actionsContent: variant === "landing" ? <MarketplaceHomeTopbarActions /> : <MarketplaceSectionTopbarActions />,
    belowContent
  };
}

export function resolveMarketplaceTopbarRoutePreset(
  corePath: string,
  messages: MarketplaceStageMessages
): MarketplaceTopbarRoutePreset | null {
  const descriptor = resolvePublicTopbarRoutePresetDescriptor(corePath);

  if (!descriptor) {
    return null;
  }

  return {
    variant: descriptor.variant,
    stageLabel: descriptor.variant === "skill-detail" ? undefined : resolvePresetStageLabel(descriptor, messages),
    belowContent: descriptor.breadcrumbKind ? buildPresetBreadcrumb(corePath, descriptor.breadcrumbKind, messages) : undefined
  };
}
