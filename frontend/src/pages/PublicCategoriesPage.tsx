import { Alert, Card, Empty, Spin, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { PublicMarketplaceResponse, SessionUser } from "../lib/api";
import type { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import { buildMarketplaceFallback } from "./MarketplaceHomePage.fallback";
import MarketplaceHomePageStyles from "./MarketplaceHomePage.styles";
import MarketplaceHomeLocaleThemeSwitch from "./MarketplaceHomeLocaleThemeSwitch";
import { buildLightTopbarPrimaryActions, buildLightTopbarUtilityActions } from "./MarketplaceHomePage.lightTopbar";
import { resolvePublicCategoriesCopy } from "./PublicCategoriesPage.copy";
import {
  buildCategoryDetailPath,
  resolveCategoryCardsFromPayload,
  resolveCategoriesViewPayload
} from "./PublicCategoriesPage.helpers";
import PublicStandardTopbar from "./PublicStandardTopbar";
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
  onThemeModeChange: (nextMode: ThemeMode) => void;
  onLocaleChange: (nextLocale: AppLocale) => void;
  sessionUser: SessionUser | null;
  payloadOverride?: PublicMarketplaceResponse | null;
}

export default function PublicCategoriesPage({
  locale,
  onNavigate,
  onThemeModeChange,
  onLocaleChange,
  sessionUser,
  payloadOverride
}: PublicCategoriesPageProps) {
  const text = resolvePublicCategoriesCopy(locale);
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
  const rootClassName = `marketplace-home${isLightTheme ? " is-light-theme" : ""}${isMobileLayout ? " is-mobile" : ""}`;
  const categoryHeaderCardStyle = useMemo(
    () => ({
      borderRadius: 16,
      border: "none",
      background: isLightTheme
        ? "linear-gradient(180deg, rgba(255,255,255,0.74) 0%, rgba(247,250,252,0.62) 100%)"
        : "linear-gradient(180deg, rgba(17,19,24,0.56) 0%, rgba(13,16,22,0.48) 100%)",
      boxShadow: isLightTheme ? "0 10px 26px rgba(15,23,42,0.06)" : "0 12px 28px rgba(2,6,23,0.26)",
      backdropFilter: "blur(10px)"
    }),
    [isLightTheme]
  );
  const categoryRowSurfaceStyle = useMemo(
    () => ({
      border: isLightTheme ? "1px solid rgba(148, 163, 184, 0.54)" : "1px solid rgba(148, 163, 184, 0.28)",
      background: isLightTheme
        ? "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.9) 100%)"
        : "linear-gradient(180deg, rgba(20,23,30,0.86) 0%, rgba(14,18,24,0.78) 100%)",
      boxShadow: isLightTheme
        ? "0 14px 28px rgba(15,23,42,0.14), inset 0 0 0 1px rgba(255,255,255,0.58)"
        : "0 16px 32px rgba(2,6,23,0.4), inset 0 0 0 1px rgba(226,232,240,0.06)",
      backdropFilter: "blur(6px)"
    }),
    [isLightTheme]
  );
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

  const topbarPrimaryActions = useMemo(
    () =>
      buildLightTopbarPrimaryActions({
        onNavigate,
        toPublicPath: navigator.toPublic,
        labels: {
          categoryNav: text.categoriesTab,
          downloadRankingNav: text.rankings
        },
        activeActionID: "category"
      }),
    [navigator.toPublic, onNavigate, text.categoriesTab, text.rankings]
  );
  const topbarUtilityActions = useMemo(
    () =>
      buildLightTopbarUtilityActions({
        onNavigate,
        toPublicPath: navigator.toPublic,
        hasSessionUser: Boolean(sessionUser)
      }),
    [navigator.toPublic, onNavigate, sessionUser]
  );

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
        <PublicStandardTopbar
          shellClassName="animated-fade-down"
          dataAnimated
          brandTitle="SkillsIndex"
          brandSubtitle={text.brandSubtitle}
          onBrandClick={() => onNavigate(navigator.toPublic("/"))}
          isLightTheme={isLightTheme}
          primaryActions={topbarPrimaryActions}
          utilityActions={topbarUtilityActions}
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
              variant="borderless"
              style={categoryHeaderCardStyle}
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
                      ...categoryRowSurfaceStyle,
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
                          className="marketplace-card-cover-thumb"
                          data-testid="category-icon-placeholder"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            border: isLightTheme ? "1px solid rgba(148, 163, 184, 0.6)" : "1px solid rgba(148, 163, 184, 0.45)",
                            background: isLightTheme
                              ? "linear-gradient(180deg, rgba(226, 232, 240, 0.92) 0%, rgba(203, 213, 225, 0.82) 100%)"
                              : "linear-gradient(180deg, rgba(51, 65, 85, 0.9) 0%, rgba(30, 41, 59, 0.86) 100%)",
                            color: isLightTheme ? "#1f2937" : "#e2e8f0"
                          }}
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
