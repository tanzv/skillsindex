"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { PublicMarketWebclientSlotsProvider } from "@/src/components/shared/PublicMarketWebclientSlots";
import { PublicTopbar, type PublicTopbarSlots } from "@/src/components/shared/PublicTopbar";
import { buildPublicTopbarModel } from "@/src/components/shared/publicShellModel";
import { cn } from "@/src/lib/utils";
import { splitPublicPathPrefix } from "@/src/lib/routing/publicCompat";
import { useResolvedPublicPathname } from "@/src/lib/routing/useResolvedPublicPathname";
import { persistBrowserThemePreference, resolveThemePreferenceFromLightFlag } from "@/src/lib/theme/sharedThemePreference";

import { usePublicViewerSession } from "./PublicViewerSessionProvider";
import { usePublicI18n } from "./i18n/PublicI18nProvider";
import {
  buildMarketplaceTopbarSlots,
  resolveMarketplaceShellContentWidth,
  resolveMarketplaceShellRouteKind,
  resolveMarketplaceTopbarRoutePreset
} from "./marketplace/marketplaceTopbarSlots";

interface PublicMarketWebclientProps {
  children: ReactNode;
}

function buildSearchSuffix(searchParams: ReturnType<typeof useSearchParams>): string {
  const encoded = searchParams.toString();
  return encoded ? `?${encoded}` : "";
}

export function PublicMarketWebclient({ children }: PublicMarketWebclientProps) {
  const resolvedPathname = useResolvedPublicPathname();
  const searchParams = useSearchParams();
  const { prefix, corePath, isLightTheme, isMobileLayout } = splitPublicPathPrefix(resolvedPathname);
  const { locale, messages, setLocale } = usePublicI18n();
  const { isAuthenticated } = usePublicViewerSession();
  const [slots, setSlots] = useState<PublicTopbarSlots | null>(null);
  const searchSuffix = buildSearchSuffix(searchParams);
  const routeKind = useMemo(() => resolveMarketplaceShellRouteKind(corePath), [corePath]);
  const contentWidth = useMemo(() => resolveMarketplaceShellContentWidth(routeKind), [routeKind]);

  useLayoutEffect(() => {
    persistBrowserThemePreference(resolveThemePreferenceFromLightFlag(isLightTheme));
  }, [isLightTheme]);

  const topbarModel = useMemo(
    () =>
      buildPublicTopbarModel({
        prefix,
        corePath,
        searchSuffix,
        isLightTheme,
        isMobileLayout,
        isAuthenticated,
        locale,
        messages
      }),
    [corePath, isAuthenticated, isLightTheme, isMobileLayout, locale, messages, prefix, searchSuffix]
  );
  const routePreset = useMemo(
    () =>
      resolveMarketplaceTopbarRoutePreset(corePath, {
        categoryBreadcrumbAriaLabel: messages.categoryBreadcrumbAriaLabel,
        categoryBrowseTitle: messages.categoryBrowseTitle,
        rankingTitle: messages.rankingTitle,
        resultsLedgerTitle: messages.resultsLedgerTitle,
        shellCategories: messages.shellCategories,
        shellHome: messages.shellHome,
        stageCategories: messages.stageCategories,
        stageRankings: messages.stageRankings,
        stageSkillDetail: messages.stageSkillDetail,
        stageResults: messages.stageResults
      }),
    [
      corePath,
      messages.categoryBreadcrumbAriaLabel,
      messages.categoryBrowseTitle,
      messages.rankingTitle,
      messages.resultsLedgerTitle,
      messages.shellCategories,
      messages.shellHome,
      messages.stageCategories,
      messages.stageRankings,
      messages.stageResults,
      messages.stageSkillDetail
    ]
  );
  const effectiveSlots = useMemo(() => {
    const routeSlots = routePreset ? buildMarketplaceTopbarSlots(routePreset) : null;

    if (!routeSlots) {
      return slots;
    }

    return slots ? { ...routeSlots, ...slots } : routeSlots;
  }, [routePreset, slots]);

  return (
    <div
      className={cn(
        "marketplace-shell",
        corePath === "/" && "is-landing-route",
        isLightTheme && "is-light-theme",
        isMobileLayout && "is-mobile-layout"
      )}
      data-marketplace-route-kind={routeKind}
      data-marketplace-content-width={contentWidth}
    >
      <PublicTopbar
        brandTitle={messages.shellBrandTitle}
        brandSubtitle={messages.shellBrandSubtitle}
        isLightTheme={isLightTheme}
        model={topbarModel}
        messages={messages}
        locale={locale}
        onLocaleChange={setLocale}
        slots={effectiveSlots}
      />

      <PublicMarketWebclientSlotsProvider onSlotsChange={setSlots}>
        <main className="marketplace-shell-content">{children}</main>
      </PublicMarketWebclientSlotsProvider>
    </div>
  );
}
