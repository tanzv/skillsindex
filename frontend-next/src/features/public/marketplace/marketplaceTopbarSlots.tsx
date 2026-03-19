"use client";

import type { ReactNode } from "react";

import type { PublicTopbarSlots } from "@/src/components/shared/PublicTopbar";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

import {
  MarketplaceHomeBrand,
  MarketplaceHomePrimaryNavigation,
  MarketplaceHomeTopbarActions,
  MarketplaceSkillDetailBrand,
  MarketplaceSkillDetailPrimaryNavigation,
  MarketplaceSkillDetailTopbarActions,
  MarketplaceSectionTopbarActions,
  MarketplaceTopbarStageStatus
} from "./MarketplaceHomeTopbar";
import { MarketplaceTopbarBreadcrumb } from "./MarketplaceTopbarBreadcrumb";

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

const marketplaceNarrativeRoutes = new Set(["/about", "/docs", "/governance", "/rollout", "/timeline"]);

export function resolveMarketplaceShellRouteKind(corePath: string): MarketplaceShellRouteKind {
  if (corePath === "/") {
    return "landing";
  }

  if (corePath.startsWith("/categories") || corePath === "/rankings" || corePath === "/compare") {
    return "section";
  }

  if (corePath === "/results" || corePath === "/search") {
    return "section";
  }

  if (corePath.startsWith("/skills/")) {
    return "skill-detail";
  }

  if (marketplaceNarrativeRoutes.has(corePath)) {
    return "narrative";
  }

  return "default";
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

function buildPresetBreadcrumb(corePath: string, messages: MarketplaceStageMessages): ReactNode | undefined {
  if (corePath === "/results" || corePath === "/search") {
    return (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: "/", label: messages.shellHome },
          { label: messages.resultsLedgerTitle, isCurrent: true }
        ]}
        testId="search-shell-breadcrumb"
      />
    );
  }

  if (corePath === "/categories") {
    return (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: "/", label: messages.shellHome },
          { label: messages.categoryBrowseTitle, isCurrent: true }
        ]}
      />
    );
  }

  if (corePath.startsWith("/categories/")) {
    const categorySlug = corePath.split("/")[2] || "";
    const categoryLabel = formatRouteSegmentLabel(categorySlug) || messages.shellCategories;

    return (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: "/", label: messages.shellHome },
          { href: "/categories", label: messages.shellCategories },
          { label: categoryLabel, isCurrent: true }
        ]}
      />
    );
  }

  if (corePath === "/rankings" || corePath === "/compare") {
    return (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.categoryBreadcrumbAriaLabel}
        items={[
          { href: "/", label: messages.shellHome },
          { label: messages.rankingTitle, isCurrent: true }
        ]}
      />
    );
  }

  if (corePath.startsWith("/skills/")) {
    return (
      <MarketplaceTopbarBreadcrumb
        ariaLabel={messages.stageSkillDetail}
        className="skill-detail-shell-breadcrumb"
        testId="skill-detail-shell-breadcrumb"
        items={[
          { href: "/", label: messages.shellHome },
          { label: messages.stageSkillDetail, isCurrent: true, isSoft: true }
        ]}
      />
    );
  }

  return undefined;
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
  if (corePath === "/") {
    return { variant: "landing" };
  }

  if (corePath.startsWith("/categories")) {
    return {
      variant: "market",
      stageLabel: messages.stageCategories,
      belowContent: buildPresetBreadcrumb(corePath, messages)
    };
  }

  if (corePath === "/rankings" || corePath === "/compare") {
    return {
      variant: "market",
      stageLabel: messages.stageRankings,
      belowContent: buildPresetBreadcrumb(corePath, messages)
    };
  }

  if (corePath.startsWith("/skills/")) {
    return {
      variant: "market",
      stageLabel: messages.stageSkillDetail
    };
  }

  if (corePath === "/results" || corePath === "/search") {
    return {
      variant: "market",
      stageLabel: messages.stageResults,
      belowContent: buildPresetBreadcrumb(corePath, messages)
    };
  }

  return null;
}
