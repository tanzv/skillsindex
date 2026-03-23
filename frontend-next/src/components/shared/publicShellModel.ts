import { buildPublicLoginPath } from "@/src/lib/auth/loginPaths";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import {
  listPublicTopbarNavRegistrations,
  resolvePublicRouteStage,
  resolvePublicTopbarNavSection
} from "@/src/lib/navigation/publicNavigationRegistry";
import { publicHomeRoute, publicResultsRoute } from "@/src/lib/routing/publicRouteRegistry";
import { workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { buildPublicPrefix, withPublicPathPrefix } from "@/src/lib/routing/publicCompat";

export interface PublicTopbarNavItem {
  href: string;
  label: string;
  isActive: boolean;
}

export interface PublicTopbarLinkAction {
  href: string;
  label: string;
  variant?: "default" | "primary" | "subtle";
}

export interface PublicTopbarToggleAction {
  href?: string;
  label: string;
  isActive: boolean;
}

export interface PublicTopbarModel {
  brandHref: string;
  navItems: PublicTopbarNavItem[];
  statusLabels: string[];
  utilityLinks: PublicTopbarLinkAction[];
  themeLinks: PublicTopbarToggleAction[];
  localeActions: PublicTopbarToggleAction[];
}

function buildPresentationHref(corePath: string, searchSuffix: string, isLightTheme: boolean, isMobileLayout: boolean): string {
  const prefix = buildPublicPrefix(isLightTheme, isMobileLayout);
  return `${withPublicPathPrefix(prefix, corePath)}${searchSuffix}`;
}

function resolveCurrentStageLabel(
  corePath: string,
  messages: Pick<
    PublicMarketplaceMessages,
    "stageLanding" | "stageCategories" | "stageRankings" | "stageSkillDetail" | "stageResults" | "stageAccess" | "stageMarketplace"
  >
): string {
  switch (resolvePublicRouteStage(corePath)) {
    case "landing":
      return messages.stageLanding;
    case "categories":
      return messages.stageCategories;
    case "rankings":
      return messages.stageRankings;
    case "skill-detail":
      return messages.stageSkillDetail;
    case "results":
      return messages.stageResults;
    case "access":
      return messages.stageAccess;
    case "marketplace":
      return messages.stageMarketplace;
  }
}

interface BuildPublicTopbarModelInput {
  prefix: string;
  corePath: string;
  searchSuffix: string;
  isLightTheme: boolean;
  isMobileLayout: boolean;
  isAuthenticated: boolean;
  locale: "zh" | "en";
  messages: PublicMarketplaceMessages;
}

export function buildPublicTopbarModel(input: BuildPublicTopbarModelInput): PublicTopbarModel {
  const stageLabel = resolveCurrentStageLabel(input.corePath, input.messages);
  const utilityLinks: PublicTopbarLinkAction[] = [];
  const activeNavSection = resolvePublicTopbarNavSection(input.corePath);

  if (input.corePath !== "/") {
    utilityLinks.push({
      href: withPublicPathPrefix(input.prefix, publicResultsRoute),
      label: input.messages.shellSearch,
      variant: "subtle"
    });
  }

  utilityLinks.push({
    href: workspaceOverviewRoute,
    label: input.messages.shellWorkspace,
    variant: input.isAuthenticated ? "primary" : "default"
  });

  if (!input.isAuthenticated) {
    utilityLinks.push({
      href: buildPublicLoginPath(input.prefix, input.corePath, input.searchSuffix),
      label: input.messages.shellSignIn,
      variant: "primary"
    });
  }

  return {
    brandHref: withPublicPathPrefix(input.prefix, publicHomeRoute),
    navItems: listPublicTopbarNavRegistrations().map((registration) => ({
      href: withPublicPathPrefix(input.prefix, registration.href),
      label:
        registration.id === "categories"
          ? input.messages.shellCategories
          : registration.id === "rankings"
            ? input.messages.shellRankings
            : input.messages.shellDocs,
      isActive: activeNavSection === registration.id
    })),
    statusLabels: [stageLabel, input.isMobileLayout ? input.messages.layoutCompact : input.messages.layoutDesktop],
    utilityLinks,
    themeLinks: [
      {
        href: buildPresentationHref(input.corePath, input.searchSuffix, false, input.isMobileLayout),
        label: input.messages.themeDark,
        isActive: !input.isLightTheme
      },
      {
        href: buildPresentationHref(input.corePath, input.searchSuffix, true, input.isMobileLayout),
        label: input.messages.themeLight,
        isActive: input.isLightTheme
      }
    ],
    localeActions: [
      {
        label: input.messages.shellLocaleZh,
        isActive: input.locale === "zh"
      },
      {
        label: input.messages.shellLocaleEn,
        isActive: input.locale === "en"
      }
    ]
  };
}
