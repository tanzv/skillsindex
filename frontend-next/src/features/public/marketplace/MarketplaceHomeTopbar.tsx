"use client";

import { Globe2, Languages, MoonStar, SunMedium } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, type ReactNode } from "react";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicViewerSession } from "@/src/features/public/PublicViewerSessionProvider";
import { usePublicLoginTarget } from "@/src/lib/auth/usePublicLoginTarget";
import { buildPublicPrefix, withPublicPathPrefix } from "@/src/lib/routing/publicCompat";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import { cn } from "@/src/lib/utils";

import {
  buildPublicMarketplaceWarmupTargets,
  prefetchPublicMarketplaceRoutes,
  warmPublicMarketplaceRoutes
} from "./publicRouteWarmup";

type MarketplaceBrandVariant = "landing" | "skill-detail";
type MarketplaceNavigationVariant = "landing" | "skill-detail";
type MarketplaceActionsVariant = "landing" | "market" | "skill-detail";

interface MarketplacePrimaryNavigationItem {
  id: string;
  label: string;
  href: string;
  isActive: boolean;
  testID: string;
  badgeLabel?: string;
}

type IdleCapableWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const completedMarketplaceWarmupSignatures = new Set<string>();

function useOptionalRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
}

function isHomeTopbarNavActive(corePath: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => corePath === prefix || corePath.startsWith(`${prefix}/`));
}

function MarketplaceTopbarIconControls() {
  const searchParams = useSearchParams();
  const { locale, messages, setLocale } = usePublicI18n();
  const { corePath, isLightTheme, isMobileLayout } = usePublicRouteState();
  const searchSuffix = useMemo(() => {
    const encoded = searchParams.toString();
    return encoded ? `?${encoded}` : "";
  }, [searchParams]);
  const darkThemeHref = `${withPublicPathPrefix(buildPublicPrefix(false, isMobileLayout), corePath)}${searchSuffix}`;
  const lightThemeHref = `${withPublicPathPrefix(buildPublicPrefix(true, isMobileLayout), corePath)}${searchSuffix}`;

  return (
    <div className="marketplace-home-topbar-icon-shell" role="group" aria-label={messages.themeSwitchAriaLabel}>
      <div className="marketplace-home-topbar-icon-segment">
        <a
          href={darkThemeHref}
          aria-current={!isLightTheme ? "true" : undefined}
          aria-label={messages.themeDark}
          title={messages.themeDark}
          className={cn("marketplace-home-icon-button", !isLightTheme && "is-active")}
          data-testid="topbar-theme-switch-dark"
        >
          <MoonStar size={15} aria-hidden="true" />
        </a>
        <a
          href={lightThemeHref}
          aria-current={isLightTheme ? "true" : undefined}
          aria-label={messages.themeLight}
          title={messages.themeLight}
          className={cn("marketplace-home-icon-button", isLightTheme && "is-active")}
          data-testid="topbar-theme-switch-light"
        >
          <SunMedium size={15} aria-hidden="true" />
        </a>
      </div>

      <div className="marketplace-home-topbar-icon-segment" role="group" aria-label={messages.localeSwitchAriaLabel}>
        <button
          type="button"
          className={cn("marketplace-home-icon-button", locale === "zh" && "is-active")}
          onClick={() => setLocale("zh")}
          aria-pressed={locale === "zh"}
          aria-label={messages.shellLocaleZh}
          title={messages.shellLocaleZh}
          data-testid="topbar-locale-switch-zh"
        >
          <Languages size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cn("marketplace-home-icon-button", locale === "en" && "is-active")}
          onClick={() => setLocale("en")}
          aria-pressed={locale === "en"}
          aria-label={messages.shellLocaleEn}
          title={messages.shellLocaleEn}
          data-testid="topbar-locale-switch-en"
        >
          <Globe2 size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function MarketplaceTopbarStageStatus({ label }: { label: string }) {
  return <span className="marketplace-topbar-status">{label}</span>;
}

function MarketplaceTopbarAnchor({
  href,
  className,
  children,
  ariaCurrent,
  ariaLabel,
  testID,
  dataSlot,
  dataVariant
}: {
  href: string;
  className: string;
  children: ReactNode;
  ariaCurrent?: "page" | "true";
  ariaLabel?: string;
  testID?: string;
  dataSlot?: "brand" | "primary-navigation" | "actions";
  dataVariant?: MarketplaceBrandVariant | MarketplaceNavigationVariant | MarketplaceActionsVariant;
}) {
  return (
    <PublicLink
      href={href}
      className={className}
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      data-testid={testID}
      data-marketplace-topbar-slot={dataSlot}
      data-marketplace-topbar-variant={dataVariant}
    >
      {children}
    </PublicLink>
  );
}

function buildMarketplacePrimaryNavigationItems(
  corePath: string,
  toPublicPath: (route: string) => string,
  labels: {
    shellCategories: string;
    shellRankings: string;
  }
): MarketplacePrimaryNavigationItem[] {
  return [
    {
      id: "categories",
      label: labels.shellCategories,
      href: toPublicPath("/categories"),
      isActive: isHomeTopbarNavActive(corePath, ["/categories"]),
      testID: "landing-topbar-nav-categories"
    },
    {
      id: "rankings",
      label: labels.shellRankings,
      href: toPublicPath("/rankings"),
      isActive: isHomeTopbarNavActive(corePath, ["/rankings", "/compare"]),
      testID: "landing-topbar-nav-rankings",
      badgeLabel: "TOP"
    }
  ];
}

function MarketplaceTopbarBrandPrimitive({ variant }: { variant: MarketplaceBrandVariant }) {
  const { messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const isSkillDetailVariant = variant === "skill-detail";
  const brandClassName = isSkillDetailVariant ? "marketplace-brand skill-detail-brand" : "marketplace-brand marketplace-home-brand";
  const dotClassName = isSkillDetailVariant ? "marketplace-brand-dot skill-detail-brand-dot" : "marketplace-home-brand-dot";
  const copyClassName = isSkillDetailVariant ? "marketplace-brand-copy skill-detail-brand-copy" : "marketplace-home-brand-copy";
  const titleClassName = isSkillDetailVariant ? undefined : "marketplace-home-brand-title";

  return (
    <MarketplaceTopbarAnchor
      href={toPublicPath("/")}
      className={brandClassName}
      ariaLabel={messages.shellBrandTitle}
      dataSlot="brand"
      dataVariant={variant}
    >
      <span className={dotClassName} aria-hidden="true">
        SI
      </span>
      <span className={copyClassName}>
        <strong className={titleClassName}>{messages.shellBrandTitle}</strong>
        <small>{messages.shellBrandSubtitle}</small>
      </span>
    </MarketplaceTopbarAnchor>
  );
}

function MarketplaceTopbarPrimaryNavigationPrimitive({ variant }: { variant: MarketplaceNavigationVariant }) {
  const { messages } = usePublicI18n();
  const { corePath, toPublicPath } = usePublicRouteState();
  const navigationItems = buildMarketplacePrimaryNavigationItems(corePath, toPublicPath, {
    shellCategories: messages.shellCategories,
    shellRankings: messages.shellRankings
  });
  const navigationClassName =
    variant === "skill-detail" ? "marketplace-nav-shell skill-detail-topbar-nav" : "marketplace-nav-shell marketplace-home-topbar-nav";

  return (
    <nav
      className={navigationClassName}
      aria-label={messages.shellNavigationAriaLabel}
      data-marketplace-topbar-slot="primary-navigation"
      data-marketplace-topbar-variant={variant}
    >
      {navigationItems.map((item) => (
        <MarketplaceTopbarAnchor
          key={item.id}
          href={item.href}
          ariaCurrent={item.isActive ? "page" : undefined}
          className={cn("marketplace-nav-button", item.isActive && "is-active")}
          testID={item.testID}
        >
          <span>{item.label}</span>
          {item.badgeLabel ? <span className="marketplace-home-nav-badge">{item.badgeLabel}</span> : null}
        </MarketplaceTopbarAnchor>
      ))}
    </nav>
  );
}

function MarketplaceTopbarActionsPrimitive({ variant }: { variant: MarketplaceActionsVariant }) {
  const router = useOptionalRouter();
  const { messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const { isAuthenticated } = usePublicViewerSession();
  const loginTarget = usePublicLoginTarget();
  const authenticationHref = isAuthenticated ? "/workspace" : loginTarget.as || loginTarget.href;
  const authenticationWarmupRoute = isAuthenticated ? "/workspace" : toPublicPath("/login");
  const actionsClassName =
    variant === "skill-detail" ? "marketplace-topbar-actions skill-detail-topbar-actions" : "marketplace-topbar-actions marketplace-home-topbar-actions";

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const warmupTargets = buildPublicMarketplaceWarmupTargets(toPublicPath, authenticationWarmupRoute);
    if (warmupTargets.length === 0) {
      return;
    }

    const warmupSignature = warmupTargets.join("|");
    if (completedMarketplaceWarmupSignatures.has(warmupSignature)) {
      return;
    }

    let canceled = false;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    let idleHandle: number | null = null;

    const executeWarmup = () => {
      if (canceled || completedMarketplaceWarmupSignatures.has(warmupSignature)) {
        return;
      }

      completedMarketplaceWarmupSignatures.add(warmupSignature);
      if (router) {
        prefetchPublicMarketplaceRoutes(router.prefetch.bind(router), warmupTargets);
      }
      void warmPublicMarketplaceRoutes(fetch, warmupTargets);
    };

    const idleWindow = window as IdleCapableWindow;

    if (typeof idleWindow.requestIdleCallback === "function") {
      idleHandle = idleWindow.requestIdleCallback(() => {
        executeWarmup();
      }, { timeout: 1200 });
    } else {
      timeoutHandle = setTimeout(executeWarmup, 500);
    }

    return () => {
      canceled = true;

      if (idleHandle !== null && typeof idleWindow.cancelIdleCallback === "function") {
        idleWindow.cancelIdleCallback(idleHandle);
      }

      if (timeoutHandle !== null) {
        clearTimeout(timeoutHandle);
      }
    };
  }, [authenticationWarmupRoute, router, toPublicPath]);

  if (variant === "landing") {
    return (
      <div
        className={actionsClassName}
        data-marketplace-topbar-slot="actions"
        data-marketplace-topbar-variant={variant}
      >
        <div className="marketplace-home-auth-cluster" data-testid="landing-topbar-auth-cluster">
          <span className="marketplace-home-topbar-status" data-testid="landing-topbar-status">
            {isAuthenticated ? messages.shellSignedIn : messages.shellSignedOut}
          </span>

          <MarketplaceTopbarAnchor href={authenticationHref} className="marketplace-home-pill-button is-primary">
            {isAuthenticated ? messages.shellWorkspace : messages.shellSignIn}
          </MarketplaceTopbarAnchor>
        </div>

        <MarketplaceTopbarIconControls />
      </div>
    );
  }

  const searchButtonClassName = variant === "skill-detail" ? "marketplace-topbar-button" : "marketplace-topbar-button is-subtle";

  return (
    <div
      className={actionsClassName}
      data-marketplace-topbar-slot="actions"
      data-marketplace-topbar-variant={variant}
    >
      <MarketplaceTopbarAnchor href={toPublicPath("/results")} className={searchButtonClassName}>
        {messages.shellSearch}
      </MarketplaceTopbarAnchor>
      <MarketplaceTopbarAnchor href={authenticationHref} className="marketplace-topbar-button is-primary">
        {isAuthenticated ? messages.shellWorkspace : messages.shellSignIn}
      </MarketplaceTopbarAnchor>
      <MarketplaceTopbarIconControls />
    </div>
  );
}

export function MarketplaceHomeBrand() {
  return <MarketplaceTopbarBrandPrimitive variant="landing" />;
}

export function MarketplaceSkillDetailBrand() {
  return <MarketplaceTopbarBrandPrimitive variant="skill-detail" />;
}

export function MarketplaceHomePrimaryNavigation() {
  return <MarketplaceTopbarPrimaryNavigationPrimitive variant="landing" />;
}

export function MarketplaceSkillDetailPrimaryNavigation() {
  return <MarketplaceTopbarPrimaryNavigationPrimitive variant="skill-detail" />;
}

export function MarketplaceHomeTopbarActions() {
  return <MarketplaceTopbarActionsPrimitive variant="landing" />;
}

export function MarketplaceSectionTopbarActions() {
  return <MarketplaceTopbarActionsPrimitive variant="market" />;
}

export function MarketplaceSkillDetailTopbarActions() {
  return <MarketplaceTopbarActionsPrimitive variant="skill-detail" />;
}
