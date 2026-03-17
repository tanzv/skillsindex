"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicViewerSession } from "@/src/features/public/PublicViewerSessionProvider";
import { splitPublicPathPrefix } from "@/src/lib/routing/publicCompat";
import { useResolvedPublicPathname } from "@/src/lib/routing/useResolvedPublicPathname";
import { cn } from "@/src/lib/utils";
import {
  buildMarketplaceTopbarSlots,
  resolveMarketplaceTopbarRoutePreset
} from "@/src/features/public/marketplace/marketplaceTopbarSlots";

import { PublicShellSlotsProvider } from "./PublicShellSlots";
import { PublicTopbar, type PublicTopbarSlots } from "./PublicTopbar";
import { buildPublicTopbarModel } from "./publicShellModel";

interface PublicShellProps {
  children: ReactNode;
}

function buildSearchSuffix(searchParams: ReturnType<typeof useSearchParams>): string {
  const encoded = searchParams.toString();
  return encoded ? `?${encoded}` : "";
}

export function PublicShell({ children }: PublicShellProps) {
  const resolvedPathname = useResolvedPublicPathname();
  const searchParams = useSearchParams();
  const { prefix, corePath, isLightTheme, isMobileLayout } = splitPublicPathPrefix(resolvedPathname);
  const { locale, messages, setLocale } = usePublicI18n();
  const { isAuthenticated } = usePublicViewerSession();
  const [slots, setSlots] = useState<PublicTopbarSlots | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const searchSuffix = buildSearchSuffix(searchParams);
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

  useEffect(() => {
    const shellNode = shellRef.current;
    if (!shellNode) {
      return;
    }

    const browserRouteState = splitPublicPathPrefix(window.location.pathname || resolvedPathname);
    shellNode.classList.toggle("is-light-theme", browserRouteState.isLightTheme);
    shellNode.classList.toggle("is-mobile-layout", browserRouteState.isMobileLayout);
  }, [resolvedPathname]);

  return (
    <div
      ref={shellRef}
      className={cn(
        "marketplace-shell",
        corePath === "/" && "is-landing-route",
        isLightTheme && "is-light-theme",
        isMobileLayout && "is-mobile-layout"
      )}
    >
      <PublicTopbar
        brandTitle={messages.shellBrandTitle}
        brandSubtitle={messages.shellBrandSubtitle}
        model={topbarModel}
        messages={messages}
        locale={locale}
        onLocaleChange={setLocale}
        slots={effectiveSlots}
      />

      <PublicShellSlotsProvider onSlotsChange={setSlots}>
        <main className="marketplace-shell-content">{children}</main>
      </PublicShellSlotsProvider>
    </div>
  );
}
