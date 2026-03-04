import { Alert, Button, Card, Empty, Segmented, Space, Spin, Tag, Typography } from "antd";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { PublicMarketplaceResponse, SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import { ThemeMode } from "../lib/themeModePath";
import MarketplaceHomeLocaleThemeSwitch from "./MarketplaceHomeLocaleThemeSwitch";
import { buildLightTopbarPrimaryActions, buildLightTopbarUtilityActions } from "./MarketplaceHomePage.lightTopbar";
import { buildMarketplaceFallback } from "./MarketplaceHomePage.fallback";
import MarketplaceHomePageStyles from "./MarketplaceHomePage.styles";
import PublicStandardTopbar from "./PublicStandardTopbar";
import {
  PrototypeSplitRow,
  PrototypeUtilityHeaderActions,
  PrototypeUtilityLoading,
  PrototypeUtilityPanel,
  PrototypeUtilityShell
} from "./prototypeCssInJs";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "./prototypeDataFallback";
import { isLightPrototypePath } from "./prototypePageTheme";
import { createPublicPageNavigator } from "./publicPageNavigation";
import {
  RankingSortKey,
  buildRankingCategoriesPath,
  buildRankingSkillPath,
  buildRankingSummaryMetrics,
  formatRankingCompactNumber,
  formatRankingUpdatedAt,
  resolveRankingSourceItems,
  sortRankingItems,
  splitRankingSections
} from "./PublicRankingPage.helpers";
import { resolvePublicRankingCopy } from "./PublicRankingPage.copy";

export interface PublicRankingPageProps {
  locale: AppLocale;
  onNavigate: (path: string) => void;
  onThemeModeChange: (nextMode: ThemeMode) => void;
  onLocaleChange: (nextLocale: AppLocale) => void;
  sessionUser: SessionUser | null;
}

export default function PublicRankingPage({
  locale,
  onNavigate,
  onThemeModeChange,
  onLocaleChange,
  sessionUser
}: PublicRankingPageProps) {
  const currentPath = window.location.pathname;
  const text = resolvePublicRankingCopy(locale);
  const [sortKey, setSortKey] = useState<RankingSortKey>("stars");
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  const lightTheme = isLightPrototypePath(currentPath);
  const topbarThemeMode: ThemeMode = lightTheme ? "light" : "dark";
  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || /^\/mobile(\/|$)/.test(currentPath);
  const shellClassName = `prototype-shell marketplace-home-stage${isMobileLayout ? " is-mobile-stage" : ""}${lightTheme ? " is-light-stage" : ""}`;
  const rootClassName = `marketplace-home${lightTheme ? " is-light-theme" : ""}${isMobileLayout ? " is-mobile" : ""}`;
  const navigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const dataMode = useMemo(() => resolvePrototypeDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE), []);
  const fallbackPayload = useMemo(
    () => buildMarketplaceFallback({ sort: "stars", page: 1 }, locale, sessionUser),
    [locale, sessionUser]
  );

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [payload, setPayload] = useState<PublicMarketplaceResponse | null>(null);

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
    setLoading(true);
    setErrorMessage("");

    loadMarketplaceWithFallback({
      query: { sort: "stars", page: 1 },
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
  }, [dataMode, fallbackPayload, locale, sessionUser, text.loadError]);

  const sourceItems = useMemo(() => resolveRankingSourceItems(payload, fallbackPayload), [fallbackPayload, payload]);
  const rankedItems = useMemo(() => sortRankingItems(sourceItems, sortKey).slice(0, 10), [sourceItems, sortKey]);
  const rankingSections = useMemo(() => splitRankingSections(rankedItems), [rankedItems]);
  const rankingSummary = useMemo(() => buildRankingSummaryMetrics(rankedItems), [rankedItems]);
  const panelStyle: CSSProperties = {
    background: "var(--si-color-panel)",
    border: "1px solid var(--si-color-border)",
    boxShadow: "none",
    backdropFilter: "none"
  };
  const sectionCardStyle: CSSProperties = {
    border: "1px solid var(--si-color-border)",
    background: "var(--si-color-surface)",
    boxShadow: "none"
  };
  const rowCardStyle: CSSProperties = {
    border: "1px solid var(--si-color-border-soft)",
    background: "var(--si-color-surface)",
    boxShadow: "none"
  };
  const metricTagStyle: CSSProperties = {
    border: "1px solid var(--si-color-border-soft)",
    background: "var(--si-color-muted-surface)",
    color: "var(--si-color-text-secondary)",
    marginInlineEnd: 0
  };
  const valueTagStyle: CSSProperties = {
    border: "1px solid var(--si-color-border-soft)",
    background: "var(--si-color-surface)",
    color: "var(--si-color-text-primary)",
    marginInlineEnd: 0
  };
  const defaultRankTagStyle: CSSProperties = {
    border: "1px solid var(--si-color-border-soft)",
    background: "var(--si-color-muted-surface)",
    color: "var(--si-color-text-primary)",
    marginInlineEnd: 0,
    fontWeight: 700
  };
  const topRankTagStyle: CSSProperties = {
    border: "1px solid var(--si-color-accent)",
    background: "var(--si-color-accent)",
    color: "var(--si-color-accent-contrast)",
    marginInlineEnd: 0,
    fontWeight: 700
  };

  const topbarPrimaryActions = useMemo(
    () =>
      buildLightTopbarPrimaryActions({
        onNavigate,
        toPublicPath: navigator.toPublic,
        labels: {
          categoryNav: text.topbar.categoryNav,
          downloadRankingNav: text.topbar.downloadRankingNav
        },
        activeActionID: "download-ranking"
      }),
    [navigator.toPublic, onNavigate, text.topbar.categoryNav, text.topbar.downloadRankingNav]
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

  return (
    <div className={shellClassName}>
      <MarketplaceHomePageStyles />
      <div className={rootClassName}>
        <PublicStandardTopbar
          shellClassName="animated-fade-down"
          dataAnimated
          brandTitle="SkillsIndex"
          brandSubtitle={text.topbar.brandSubtitle}
          onBrandClick={() => onNavigate(navigator.toPublic("/"))}
          isLightTheme={lightTheme}
          primaryActions={topbarPrimaryActions}
          utilityActions={topbarUtilityActions}
          statusLabel={sessionUser ? text.topbar.signedIn : text.topbar.signedOut}
          ctaLabel={sessionUser ? text.topbar.openWorkspace : text.topbar.signIn}
          onCtaClick={() => onNavigate(sessionUser ? navigator.toPublic("/workspace") : navigator.toPublic("/login"))}
          localeThemeSwitch={
            <MarketplaceHomeLocaleThemeSwitch
              locale={locale}
              currentThemeMode={topbarThemeMode}
              onThemeModeChange={onThemeModeChange}
              onLocaleChange={onLocaleChange}
            />
          }
        />

        <PrototypeUtilityShell>
          {errorMessage ? <Alert type="warning" showIcon message={errorMessage} /> : null}

          {loading ? (
            <PrototypeUtilityPanel>
              <PrototypeUtilityLoading>
                <Spin size="large" />
              </PrototypeUtilityLoading>
            </PrototypeUtilityPanel>
          ) : null}

          {!loading ? (
            <PrototypeUtilityPanel style={panelStyle}>
              <PrototypeSplitRow>
                <div style={{ display: "grid", gap: 8 }}>
                  <Typography.Title level={2} style={{ margin: 0, color: "var(--si-color-text-primary)" }}>
                    {text.title}
                  </Typography.Title>
                  <Typography.Paragraph style={{ margin: 0, color: "var(--si-color-text-secondary)", maxWidth: "72ch" }}>
                    {text.subtitle}
                  </Typography.Paragraph>
                  <Space size={8} wrap>
                    <Tag style={metricTagStyle}>{`${text.totalComparedLabel}: ${rankingSummary.totalCompared}`}</Tag>
                    <Tag style={metricTagStyle}>{`${text.topStarsMetricLabel}: ${formatRankingCompactNumber(rankingSummary.topStars)}`}</Tag>
                    <Tag style={metricTagStyle}>{`${text.topQualityMetricLabel}: ${rankingSummary.topQuality.toFixed(1)}`}</Tag>
                    <Tag style={metricTagStyle}>{`${text.averageQualityMetricLabel}: ${rankingSummary.averageQuality.toFixed(1)}`}</Tag>
                  </Space>
                </div>

                <PrototypeUtilityHeaderActions>
                  <Button onClick={() => onNavigate(buildRankingCategoriesPath(currentPath))}>{text.viewCategories}</Button>
                </PrototypeUtilityHeaderActions>
              </PrototypeSplitRow>

              <Space size={10} align="center" wrap>
                <Typography.Text style={{ color: "var(--si-color-text-secondary)" }}>{text.sortByLabel}</Typography.Text>
                <Segmented
                  options={[
                    { label: text.sortByStars, value: "stars" },
                    { label: text.sortByQuality, value: "quality" }
                  ]}
                  value={sortKey}
                  onChange={(value) => setSortKey(value as RankingSortKey)}
                />
              </Space>

              {rankedItems.length === 0 ? (
                <Card variant="borderless">
                  <Empty description={text.noData} />
                </Card>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  <Card
                    variant="borderless"
                    style={sectionCardStyle}
                    styles={{ body: { padding: 14, display: "grid", gap: 10 } }}
                  >
                    <Typography.Text strong style={{ color: "var(--si-color-text-primary)" }}>
                      {text.topThreeLabel}
                    </Typography.Text>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobileLayout ? "1fr" : "repeat(3, minmax(0, 1fr))",
                        gap: 10
                      }}
                    >
                      {rankingSections.highlightedItems.map((item, index) => (
                        <Card
                          key={`ranking-highlight-${item.id}`}
                          variant="borderless"
                          style={rowCardStyle}
                          styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
                        >
                          <Space size={8} align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                            <Tag style={index === 0 ? topRankTagStyle : defaultRankTagStyle}>{`#${index + 1}`}</Tag>
                            <Typography.Text style={{ color: "var(--si-color-text-secondary)" }}>
                              {`${text.starsLabel} ${formatRankingCompactNumber(item.star_count)}`}
                            </Typography.Text>
                          </Space>

                          <Button
                            type="link"
                            onClick={() => onNavigate(buildRankingSkillPath(currentPath, item.id))}
                            data-testid="ranking-highlight-skill-button"
                            style={{
                              padding: 0,
                              justifyContent: "flex-start",
                              color: "var(--si-color-text-primary)",
                              fontWeight: 700,
                              textWrap: "pretty"
                            }}
                          >
                            {item.name}
                          </Button>

                          <Typography.Text style={{ color: "var(--si-color-text-secondary)" }}>
                            {`${item.category} / ${item.subcategory}`}
                          </Typography.Text>
                          <Space size={8} wrap>
                            <Tag style={valueTagStyle}>{`${text.qualityLabel} ${item.quality_score.toFixed(1)}`}</Tag>
                            <Tag style={metricTagStyle}>{`${text.updatedLabel} ${formatRankingUpdatedAt(item.updated_at, locale)}`}</Tag>
                          </Space>
                        </Card>
                      ))}
                    </div>
                  </Card>

                  {rankingSections.listItems.length > 0 ? (
                    <Card
                      variant="borderless"
                      style={sectionCardStyle}
                      styles={{ body: { padding: 14, display: "grid", gap: 8 } }}
                    >
                      <Typography.Text strong style={{ color: "var(--si-color-text-primary)" }}>
                        {text.fullRankingLabel}
                      </Typography.Text>

                      {!isMobileLayout ? (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "72px minmax(0, 1.8fr) minmax(0, 1.1fr) 100px 100px 120px 112px",
                            gap: 8,
                            alignItems: "center",
                            color: "var(--si-color-text-secondary)",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                            padding: "0 6px"
                          }}
                        >
                          <span>{text.rankLabel}</span>
                          <span>{text.skillLabel}</span>
                          <span>{text.categoryLabel}</span>
                          <span>{text.starsLabel}</span>
                          <span>{text.qualityLabel}</span>
                          <span>{text.updatedLabel}</span>
                          <span />
                        </div>
                      ) : null}

                      <div style={{ display: "grid", gap: 8 }}>
                        {rankingSections.listItems.map((item, index) => {
                          const rankNumber = rankingSections.highlightedItems.length + index + 1;
                          return (
                            <Card
                              key={`ranking-row-${item.id}`}
                              variant="borderless"
                              style={rowCardStyle}
                              styles={{ body: { padding: 10 } }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: isMobileLayout
                                    ? "minmax(0, 1fr)"
                                    : "72px minmax(0, 1.8fr) minmax(0, 1.1fr) 100px 100px 120px 112px",
                                  gap: 8,
                                  alignItems: "center"
                                }}
                              >
                                <Tag style={defaultRankTagStyle}>{`#${rankNumber}`}</Tag>
                                <Button
                                  type="link"
                                  onClick={() => onNavigate(buildRankingSkillPath(currentPath, item.id))}
                                  style={{
                                    padding: 0,
                                    justifyContent: "flex-start",
                                    color: "var(--si-color-text-primary)",
                                    fontWeight: 700
                                  }}
                                >
                                  {item.name}
                                </Button>
                                <Typography.Text style={{ color: "var(--si-color-text-secondary)" }}>
                                  {`${item.category} / ${item.subcategory}`}
                                </Typography.Text>
                                <Typography.Text style={{ color: "var(--si-color-text-primary)" }}>
                                  {formatRankingCompactNumber(item.star_count)}
                                </Typography.Text>
                                <Typography.Text style={{ color: "var(--si-color-text-primary)" }}>{item.quality_score.toFixed(1)}</Typography.Text>
                                <Typography.Text style={{ color: "var(--si-color-text-secondary)" }}>
                                  {formatRankingUpdatedAt(item.updated_at, locale)}
                                </Typography.Text>
                                <Button
                                  type="default"
                                  size="small"
                                  data-testid="ranking-open-skill-button"
                                  onClick={() => onNavigate(buildRankingSkillPath(currentPath, item.id))}
                                >
                                  {text.openSkillLabel}
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </Card>
                  ) : null}
                </div>
              )}
            </PrototypeUtilityPanel>
          ) : null}
        </PrototypeUtilityShell>
      </div>
    </div>
  );
}
