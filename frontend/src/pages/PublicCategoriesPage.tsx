import { Alert, Card, Empty, Spin, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { PublicMarketplaceResponse, SessionUser } from "../lib/api";
import type { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import MarketplacePageBreadcrumb, { type MarketplacePageBreadcrumbItem } from "../components/MarketplacePageBreadcrumb";
import { buildMarketplaceFallback } from "./MarketplaceHomePage.fallback";
import MarketplaceHomePageStyles from "./MarketplaceHomePage.styles";
import { marketplaceHomeCopy } from "./MarketplaceHomePage.copy";
import MarketplaceHomeLocaleThemeSwitch from "./MarketplaceHomeLocaleThemeSwitch";
import {
  buildMarketplaceTopbarActionBundle
} from "./MarketplaceHomePage.lightTopbar";
import { buildMarketplaceWorkspaceAuthRightRegistrations } from "./MarketplaceTopbarRightRegistrations";
import { resolvePublicCategoriesCopy } from "./PublicCategoriesPage.copy";
import {
  buildCategoryDetailPath,
  resolveCategoryCardsFromPayload,
  resolveCategoriesViewPayload
} from "./PublicCategoriesPage.helpers";
import MarketplaceTopbar from "./MarketplaceTopbar";
import {
  PrototypeUtilityLoading,
  PrototypeUtilityPanel,
  PrototypeUtilityShell,
  PrototypeTwoColumnGrid
} from "./prototypeCssInJs";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "./prototypeDataFallback";
import { isLightPrototypePath } from "./prototypePageTheme";
import { createPublicPageNavigator } from "./publicPageNavigation";

interface PublicCategoriesPageProps {
  locale: AppLocale;
  onNavigate: (path: string) => void;
  onLogout?: () => Promise<void> | void;
  onThemeModeChange: (nextMode: ThemeMode) => void;
  onLocaleChange: (nextLocale: AppLocale) => void;
  sessionUser: SessionUser | null;
  payloadOverride?: PublicMarketplaceResponse | null;
}

export default function PublicCategoriesPage({
  locale,
  onNavigate,
  onLogout,
  onThemeModeChange,
  onLocaleChange,
  sessionUser,
  payloadOverride
}: PublicCategoriesPageProps) {
  const text = resolvePublicCategoriesCopy(locale);
  const topbarText = marketplaceHomeCopy[locale] || marketplaceHomeCopy.en;
  const currentPath = window.location.pathname;
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));
  const isLightTheme = isLightPrototypePath(currentPath);
  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || /^\/mobile(\/|$)/.test(currentPath);
  const currentThemeMode: ThemeMode = isLightTheme ? "light" : "dark";
  const shellClassName = `prototype-shell marketplace-home-stage${isMobileLayout ? " is-mobile-stage" : ""}${isLightTheme ? " is-light-stage" : ""}`;
  const rootClassName = `marketplace-home is-categories-index-page${isLightTheme ? " is-light-theme" : ""}${isMobileLayout ? " is-mobile" : ""}`;
  const navigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const dataMode = useMemo(() => resolvePrototypeDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE), []);
  const fallbackPayload = useMemo(
    () => buildMarketplaceFallback({ page: 1, sort: "recent" }, locale, sessionUser),
    [locale, sessionUser]
  );

  const [loading, setLoading] = useState(!payloadOverride);
  const [payload, setPayload] = useState<PublicMarketplaceResponse | null>(payloadOverride || null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (payloadOverride) {
      setPayload(payloadOverride);
      setErrorMessage("");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setErrorMessage("");
    loadMarketplaceWithFallback({
      query: { page: 1, sort: "recent" },
      locale,
      sessionUser,
      mode: dataMode
    })
      .then((result) => {
        if (!active) {
          return;
        }
        setPayload(result.payload);
        setErrorMessage(result.degraded ? result.errorMessage || text.loadError : "");
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setPayload(fallbackPayload);
        setErrorMessage(error instanceof Error ? error.message : text.loadError);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataMode, fallbackPayload, locale, payloadOverride, sessionUser, text.loadError]);

  const categoryCards = useMemo(
    () =>
      resolveCategoryCardsFromPayload(resolveCategoriesViewPayload(payload), {
        noDescription: text.noDescription,
        uncategorizedName: text.uncategorizedName,
        generalSubcategoryName: text.generalSubcategoryName,
        iconPlaceholderFallback: text.iconPlaceholderFallback
      }),
    [payload, text.generalSubcategoryName, text.iconPlaceholderFallback, text.noDescription, text.uncategorizedName]
  );

  const topbarActionBundle = useMemo(
    () =>
      buildMarketplaceTopbarActionBundle({
        onNavigate,
        toPublicPath: navigator.toPublic,
        locale,
        hasSessionUser: Boolean(sessionUser),
        activeActionID: "category",
        authActionLabel: sessionUser ? topbarText.signOut : topbarText.signIn,
        onAuthAction: handleTopbarAuthAction
      }),
    [handleTopbarAuthAction, locale, navigator.toPublic, onNavigate, sessionUser, topbarText.signIn, topbarText.signOut]
  );
  const topbarRightRegistrations = useMemo(
    () =>
      buildMarketplaceWorkspaceAuthRightRegistrations({
        sessionUser,
        workspaceLabel: topbarText.openWorkspace,
        signInLabel: topbarText.signIn,
        signOutLabel: topbarText.signOut,
        onWorkspaceClick: handleTopbarConsoleAction,
        onAuthClick: handleTopbarAuthAction
      }),
    [
      handleTopbarAuthAction,
      handleTopbarConsoleAction,
      sessionUser,
      topbarText.openWorkspace,
      topbarText.signIn,
      topbarText.signOut
    ]
  );
  const breadcrumbItems = useMemo<MarketplacePageBreadcrumbItem[]>(
    () => [
      {
        key: "home",
        label: "SkillsIndex",
        onClick: () => onNavigate(navigator.toPublic("/"))
      },
      {
        key: "current",
        label: text.pageTitle
      }
    ],
    [navigator, onNavigate, text.pageTitle]
  );
  const lightBrandTitle = "SkillsIndex";
  const lightBrandSubtitle = "User Portal";
  const topbarBrandTitle = isLightTheme ? lightBrandTitle : topbarText.brandTitle;
  const topbarBrandSubtitle = isLightTheme ? lightBrandSubtitle : topbarText.brandSubtitle;

  function toPublicPath(path: string): string {
    return navigator.toPublic(path);
  }

  function handleTopbarAuthAction(): void {
    if (sessionUser) {
      void onLogout?.();
      return;
    }
    onNavigate(toPublicPath("/login"));
  }

  function handleTopbarConsoleAction(): void {
    onNavigate("/workspace");
  }

  function handleCategoryCardOpen(categorySlug: string): void {
    const normalizedSlug = String(categorySlug || "").trim();
    if (!normalizedSlug) {
      return;
    }
    onNavigate(navigator.toPublic(buildCategoryDetailPath(normalizedSlug)));
  }

  return (
    <div className={shellClassName}>
      <MarketplaceHomePageStyles />

      <div className={rootClassName}>
        <MarketplaceTopbar
          shellClassName="animated-fade-down"
          dataAnimated
          brandTitle={topbarBrandTitle}
          brandSubtitle={topbarBrandSubtitle}
          onBrandClick={() => onNavigate(navigator.toPublic("/"))}
          isLightTheme={isLightTheme}
          primaryActions={topbarActionBundle.primaryActions}
          utilityActions={topbarActionBundle.utilityActions}
          rightRegistrations={topbarRightRegistrations}
          localeThemeSwitch={
            <MarketplaceHomeLocaleThemeSwitch
              locale={locale}
              currentThemeMode={currentThemeMode}
              onThemeModeChange={onThemeModeChange}
              onLocaleChange={onLocaleChange}
            />
          }
        />

        <PrototypeUtilityShell>
          <MarketplacePageBreadcrumb
            items={breadcrumbItems}
            ariaLabel="Categories page breadcrumb"
            testIdPrefix="categories-page-breadcrumb"
          />

          {errorMessage ? (
            <Alert type="warning" showIcon message={text.loadError} description={errorMessage} />
          ) : null}

          {loading ? (
            <PrototypeUtilityPanel>
              <PrototypeUtilityLoading>
                <Spin size="large" />
              </PrototypeUtilityLoading>
            </PrototypeUtilityPanel>
          ) : null}

          {!loading ? (
            <Card
              className="marketplace-category-header-card"
              variant="borderless"
              style={{ borderRadius: 16, border: "none" }}
              styles={{ body: { padding: "14px 16px" } }}
            >
              <div style={{ display: "grid", gap: 6 }}>
                <Typography.Title
                  level={2}
                  style={{
                    margin: 0,
                    color: "var(--si-color-text-primary)",
                    fontFamily: '"Syne", sans-serif',
                    fontSize: "clamp(1.12rem, 2.5vw, 1.72rem)",
                    lineHeight: 1.18
                  }}
                >
                  {text.pageTitle}
                </Typography.Title>
                {text.pageSubtitle.trim().length > 0 ? (
                  <Typography.Paragraph
                    style={{ margin: 0, color: "var(--si-color-text-secondary)", fontSize: "0.82rem", maxWidth: "72ch" }}
                  >
                    {text.pageSubtitle}
                  </Typography.Paragraph>
                ) : null}
              </div>
            </Card>
          ) : null}

          {!loading && categoryCards.length === 0 ? (
            <PrototypeUtilityPanel>
              <Empty description={text.emptyState} />
            </PrototypeUtilityPanel>
          ) : null}

          {!loading && categoryCards.length > 0 ? (
            <PrototypeTwoColumnGrid style={{ gap: 14 }}>
              {categoryCards.map((category) => (
                <Card
                  key={category.slug || category.name}
                  variant="borderless"
                  style={{
                    borderRadius: 0,
                    border: "none",
                    background: "transparent"
                  }}
                  styles={{ body: { padding: 0 } }}
                >
                  <div
                    className="marketplace-skill-row marketplace-featured-row marketplace-category-row"
                    role={category.slug ? "button" : undefined}
                    tabIndex={category.slug ? 0 : undefined}
                    style={{
                      cursor: category.slug ? "pointer" : "default"
                    }}
                    onClick={() => handleCategoryCardOpen(category.slug)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") {
                        return;
                      }
                      event.preventDefault();
                      handleCategoryCardOpen(category.slug);
                    }}
                  >
                    <div className="marketplace-card-head" aria-hidden="true">
                      <span className="marketplace-card-cover">
                        <span
                          className="marketplace-card-cover-thumb marketplace-category-icon-fallback"
                          data-testid="category-icon-placeholder"
                          title={`${text.iconPlaceholderLabel}: ${category.name}`}
                        >
                          {category.iconPlaceholder}
                        </span>
                        <span className="marketplace-card-cover-chip">{category.count}</span>
                      </span>
                    </div>

                    <div className="marketplace-skill-secondary">
                      <div className="marketplace-skill-name">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCategoryCardOpen(category.slug);
                          }}
                        >
                          {category.name}
                        </button>
                      </div>
                      <p className="marketplace-skill-description">{category.description}</p>
                      <div className="marketplace-skill-chip-row">
                        <span className="is-primary">{`${text.cardCountLabel} ${category.count}`}</span>
                        <span>{`${text.subcategoryCountLabel} ${category.subcategoryCount}`}</span>
                        <span>{`${text.topSubcategoryCountLabel} ${category.topSubcategoryTotalCount}`}</span>
                      </div>
                      <div className="marketplace-skill-row-foot">
                        <span className="is-primary">{text.topSubcategories}</span>
                        <span>
                          {category.topSubcategories.length > 0
                            ? category.topSubcategories.map((subcategory) => subcategory.name).join(" / ")
                            : text.generalSubcategoryName}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </PrototypeTwoColumnGrid>
          ) : null}
        </PrototypeUtilityShell>
      </div>
    </div>
  );
}
