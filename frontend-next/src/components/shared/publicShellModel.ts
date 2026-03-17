import { buildPublicLoginPath } from "@/src/lib/auth/loginPaths";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
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
  if (corePath === "/") {
    return messages.stageLanding;
  }
  if (corePath.startsWith("/categories")) {
    return messages.stageCategories;
  }
  if (corePath === "/rankings" || corePath === "/compare") {
    return messages.stageRankings;
  }
  if (corePath.startsWith("/skills/")) {
    return messages.stageSkillDetail;
  }
  if (corePath === "/results" || corePath === "/search") {
    return messages.stageResults;
  }
  if (corePath === "/login") {
    return messages.stageAccess;
  }

  return messages.stageMarketplace;
}

function isActivePublicNav(corePath: string, matchPrefixes: string[]): boolean {
  return matchPrefixes.some((matchPrefix) => corePath === matchPrefix || corePath.startsWith(`${matchPrefix}/`));
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

  if (input.corePath !== "/") {
    utilityLinks.push({
      href: withPublicPathPrefix(input.prefix, "/results"),
      label: input.messages.shellSearch,
      variant: "subtle"
    });
  }

  utilityLinks.push({
    href: "/workspace",
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
    brandHref: withPublicPathPrefix(input.prefix, "/"),
    navItems: [
      {
        href: withPublicPathPrefix(input.prefix, "/categories"),
        label: input.messages.shellCategories,
        isActive: isActivePublicNav(input.corePath, ["/categories"])
      },
      {
        href: withPublicPathPrefix(input.prefix, "/rankings"),
        label: input.messages.shellRankings,
        isActive: isActivePublicNav(input.corePath, ["/rankings", "/compare"])
      },
      {
        href: withPublicPathPrefix(input.prefix, "/docs"),
        label: input.messages.shellDocs,
        isActive: isActivePublicNav(input.corePath, ["/docs", "/about", "/rollout", "/timeline", "/governance", "/states"])
      }
    ],
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
