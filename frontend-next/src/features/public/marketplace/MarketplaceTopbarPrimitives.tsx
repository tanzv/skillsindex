"use client";

import { Globe2, Languages, MoonStar, SunMedium } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { resolveBrandWordmarkAlt, resolveBrandWordmarkSrc } from "@/src/components/shared/brandWordmark";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicViewerSession } from "@/src/features/public/PublicViewerSessionProvider";
import { usePublicLoginTarget } from "@/src/lib/auth/usePublicLoginTarget";
import { isPublicTopbarNavSectionActive } from "@/src/lib/navigation/publicNavigationRegistry";
import { buildPublicPrefix, withPublicPathPrefix } from "@/src/lib/routing/publicCompat";
import {
  publicCategoriesRoute,
  publicHomeRoute,
  publicRankingsRoute,
  publicResultsRoute
} from "@/src/lib/routing/publicRouteRegistry";
import { workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import { cn } from "@/src/lib/utils";

type MarketplaceBrandVariant = "landing" | "skill-detail";
type MarketplaceNavigationVariant = "landing" | "skill-detail";
type MarketplaceActionsVariant = "market" | "skill-detail";

interface MarketplacePrimaryNavigationItem {
  badgeLabel?: string;
  href: string;
  id: string;
  isActive: boolean;
  label: string;
  testID: string;
}

export function MarketplaceTopbarIconControls() {
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
      href: toPublicPath(publicCategoriesRoute),
      isActive: isPublicTopbarNavSectionActive(corePath, "categories"),
      testID: "landing-topbar-nav-categories"
    },
    {
      id: "rankings",
      label: labels.shellRankings,
      href: toPublicPath(publicRankingsRoute),
      isActive: isPublicTopbarNavSectionActive(corePath, "rankings"),
      testID: "landing-topbar-nav-rankings",
      badgeLabel: "TOP"
    }
  ];
}

function MarketplaceTopbarBrandPrimitive({ variant }: { variant: MarketplaceBrandVariant }) {
  const { messages } = usePublicI18n();
  const { isLightTheme, toPublicPath } = usePublicRouteState();
  const isSkillDetailVariant = variant === "skill-detail";
  const brandClassName = isSkillDetailVariant ? "marketplace-brand skill-detail-brand" : "marketplace-brand marketplace-home-brand";
  const copyClassName = isSkillDetailVariant
    ? "marketplace-brand-copy marketplace-brand-copy-accessible skill-detail-brand-copy"
    : "marketplace-brand-copy marketplace-brand-copy-accessible marketplace-home-brand-copy";
  const titleClassName = isSkillDetailVariant ? undefined : "marketplace-home-brand-title";
  const wordmarkSrc = resolveBrandWordmarkSrc(isLightTheme);

  return (
    <MarketplaceTopbarAnchor
      href={toPublicPath(publicHomeRoute)}
      className={brandClassName}
      ariaLabel={messages.shellBrandTitle}
      dataSlot="brand"
      dataVariant={variant}
    >
      <Image
        src={wordmarkSrc}
        alt={resolveBrandWordmarkAlt(messages.shellBrandTitle)}
        width={560}
        height={72}
        className="marketplace-brand-wordmark"
      />
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
  const { messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const { isAuthenticated } = usePublicViewerSession();
  const loginTarget = usePublicLoginTarget();
  const authenticationHref = isAuthenticated ? workspaceOverviewRoute : loginTarget.as || loginTarget.href;
  const actionsClassName =
    variant === "skill-detail" ? "marketplace-topbar-actions skill-detail-topbar-actions" : "marketplace-topbar-actions marketplace-home-topbar-actions";
  const searchButtonClassName = variant === "skill-detail" ? "marketplace-topbar-button" : "marketplace-topbar-button is-subtle";

  return (
    <div
      className={actionsClassName}
      data-marketplace-topbar-slot="actions"
      data-marketplace-topbar-variant={variant}
    >
      <MarketplaceTopbarAnchor href={toPublicPath(publicResultsRoute)} className={searchButtonClassName}>
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

export function MarketplaceSectionTopbarActions() {
  return <MarketplaceTopbarActionsPrimitive variant="market" />;
}

export function MarketplaceSkillDetailTopbarActions() {
  return <MarketplaceTopbarActionsPrimitive variant="skill-detail" />;
}
