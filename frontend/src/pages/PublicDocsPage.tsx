import { Button, Card, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { SessionUser, buildServerURL } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import MarketplacePageBreadcrumb, { type MarketplacePageBreadcrumbItem } from "../components/MarketplacePageBreadcrumb";
import MarketplaceHomeLocaleThemeSwitch from "./MarketplaceHomeLocaleThemeSwitch";
import {
  buildMarketplaceTopbarActionBundle,
} from "./MarketplaceHomePage.lightTopbar";
import { marketplaceHomeCopy } from "./MarketplaceHomePage.copy";
import { buildMarketplaceWorkspaceAuthRightRegistrations } from "./MarketplaceTopbarRightRegistrations";
import MarketplaceHomePageStyles from "./MarketplaceHomePage.styles";
import {
  PrototypeSplitRow,
  PrototypeTwoColumnGrid,
  PrototypeUtilityHeaderActions,
  PrototypeUtilityPanel,
  PrototypeUtilityShell,
} from "./prototypeCssInJs";
import MarketplaceTopbar from "./MarketplaceTopbar";
import {
  createPrototypePalette,
  isLightPrototypePath,
} from "./prototypePageTheme";
import { publicDocsPageCopy, type DocsEntry } from "./PublicDocsPage.copy";
import { resolvePublicRankingCopy } from "./PublicRankingPage.copy";
import { createPublicPageNavigator } from "./publicPageNavigation";

interface PublicDocsPageProps {
  locale: AppLocale;
  onNavigate: (path: string) => void;
  onLogout?: () => Promise<void> | void;
  onThemeModeChange: (nextMode: ThemeMode) => void;
  onLocaleChange: (nextLocale: AppLocale) => void;
  sessionUser: SessionUser | null;
}

interface EndpointMetadata {
  key: string;
  label: string;
  value: string;
  summary: string;
}

export default function PublicDocsPage({
  locale,
  onNavigate,
  onLogout,
  onThemeModeChange,
  onLocaleChange,
  sessionUser,
}: PublicDocsPageProps) {
  const text = publicDocsPageCopy[locale];
  const currentPath = window.location.pathname;
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const lightMode = isLightPrototypePath(currentPath);
  const topbarThemeMode: ThemeMode = lightMode ? "light" : "dark";
  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || /^\/mobile(\/|$)/.test(currentPath);
  const shellClassName = `prototype-shell marketplace-home-stage${isMobileLayout ? " is-mobile-stage" : ""}${lightMode ? " is-light-stage" : ""}`;
  const rootClassName = `marketplace-home is-docs-page${lightMode ? " is-light-theme" : ""}${isMobileLayout ? " is-mobile" : ""}`;
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);
  const topbarCopy = useMemo(
    () => resolvePublicRankingCopy(locale).topbar,
    [locale],
  );
  const topbarLocaleCopy = useMemo(() => marketplaceHomeCopy[locale] || marketplaceHomeCopy.en, [locale]);
  const navigator = useMemo(
    () => createPublicPageNavigator(currentPath),
    [currentPath],
  );
  const toPublicPath = navigator.toPublic;
  const docsByKey = useMemo(
    () => new Map(text.docs.map((entry) => [entry.key, entry])),
    [text.docs],
  );
  const totalDocs = text.docs.length;
  const specDocs = text.docs.filter(
    (entry) => entry.path.endsWith(".json") || entry.path.endsWith(".yaml"),
  ).length;
  const interactiveTools = text.docs.filter(
    (entry) => entry.badge === "Explore" || entry.key === "swagger",
  ).length;
  const inAppRoutes = text.docs.filter((entry) =>
    Boolean(entry.appPath),
  ).length;
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

  const topbarActionBundle = useMemo(
    () =>
      buildMarketplaceTopbarActionBundle({
        onNavigate,
        toPublicPath,
        locale,
        hasSessionUser: Boolean(sessionUser),
        authActionLabel: sessionUser ? topbarLocaleCopy.signOut : topbarLocaleCopy.signIn,
        onAuthAction: handleTopbarAuthAction
      }),
    [handleTopbarAuthAction, locale, onNavigate, sessionUser, toPublicPath, topbarLocaleCopy.signIn, topbarLocaleCopy.signOut],
  );
  const topbarRightRegistrations = useMemo(
    () =>
      buildMarketplaceWorkspaceAuthRightRegistrations({
        sessionUser,
        workspaceLabel: topbarLocaleCopy.openWorkspace,
        signInLabel: topbarLocaleCopy.signIn,
        signOutLabel: topbarLocaleCopy.signOut,
        onWorkspaceClick: handleTopbarConsoleAction,
        onAuthClick: handleTopbarAuthAction
      }),
    [
      handleTopbarAuthAction,
      handleTopbarConsoleAction,
      sessionUser,
      topbarLocaleCopy.openWorkspace,
      topbarLocaleCopy.signIn,
      topbarLocaleCopy.signOut,
    ],
  );
  const endpointMetadata = useMemo<EndpointMetadata[]>(
    () => [
      {
        key: "base-url",
        label: "Server Base URL",
        value: new URL(buildServerURL("/")).origin,
        summary:
          "Shared backend origin used by all public documentation endpoints.",
      },
      {
        key: "api-doc-path",
        label: "API Docs Endpoint",
        value: buildServerURL("/docs/api"),
        summary: "Session-aware endpoint for rendered API documentation.",
      },
      {
        key: "openapi-json-path",
        label: "OpenAPI JSON Endpoint",
        value: buildServerURL("/docs/openapi.json"),
        summary:
          "Structured schema source for integrations and code generation.",
      },
      {
        key: "openapi-yaml-path",
        label: "OpenAPI YAML Endpoint",
        value: buildServerURL("/docs/openapi.yaml"),
        summary: "Human-readable schema variant for governance pipelines.",
      },
    ],
    [],
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
        label: text.title
      }
    ],
    [navigator, onNavigate, text.title]
  );

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function openExternal(path: string): void {
    window.open(buildServerURL(path), "_blank", "noopener,noreferrer");
  }

  function openInApp(path: string): void {
    onNavigate(navigator.toApp(path));
  }

  return (
    <div className={shellClassName}>
      <MarketplaceHomePageStyles />
      <div className={rootClassName}>
        <MarketplaceTopbar
          shellClassName="animated-fade-down"
          dataAnimated
          brandTitle="SkillsIndex"
          brandSubtitle={topbarCopy.brandSubtitle}
          onBrandClick={() => onNavigate(navigator.toPublic("/"))}
          isLightTheme={lightMode}
          primaryActions={topbarActionBundle.primaryActions}
          utilityActions={topbarActionBundle.utilityActions}
          rightRegistrations={topbarRightRegistrations}
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
          <MarketplacePageBreadcrumb
            items={breadcrumbItems}
            ariaLabel="Docs page breadcrumb"
            testIdPrefix="docs-page-breadcrumb"
          />

          <Card
            variant="borderless"
            style={{
              borderRadius: 16,
              border: "none",
              background:
                "color-mix(in srgb, var(--si-color-panel) 82%, transparent)",
              boxShadow: "none",
              backdropFilter: "blur(10px) saturate(120%)",
            }}
            styles={{ body: { padding: "14px 16px" } }}
          >
            <PrototypeSplitRow>
              <div style={{ display: "grid", gap: 6 }}>
                <Typography.Title
                  level={2}
                  style={{
                    margin: 0,
                    color: palette.headerTitle,
                    fontFamily: '"Syne", sans-serif',
                    fontSize: "clamp(1.12rem, 2.5vw, 1.72rem)",
                    lineHeight: 1.18,
                  }}
                >
                  {text.title}
                </Typography.Title>
                <Typography.Paragraph
                  style={{
                    margin: 0,
                    color: palette.headerSubtitle,
                    fontSize: "0.82rem",
                    maxWidth: "72ch",
                  }}
                >
                  {text.subtitle}
                </Typography.Paragraph>
                <Typography.Text
                  style={{
                    color: palette.headerSubtitle,
                    fontSize: "0.78rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  {text.summaryTitle}: {text.summarySubtitle}
                </Typography.Text>
              </div>
              <PrototypeUtilityHeaderActions>
                <Button onClick={() => onNavigate(navigator.toPublic("/"))}>
                  {text.openMarketplace}
                </Button>
                <Button
                  type="primary"
                  onClick={() =>
                    onNavigate(
                      sessionUser
                        ? navigator.toAdmin("/admin/overview")
                        : navigator.toPublic("/login"),
                    )
                  }
                >
                  {sessionUser ? text.openDashboard : text.signIn}
                </Button>
              </PrototypeUtilityHeaderActions>
            </PrototypeSplitRow>
            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 10,
              }}
            >
              {[
                { label: text.metricTotalDocs, value: totalDocs },
                { label: text.metricSpecs, value: specDocs },
                { label: text.metricTools, value: interactiveTools },
                { label: text.metricInApp, value: inAppRoutes },
              ].map((metric) => (
                <div
                  key={metric.label}
                  style={{
                    borderRadius: 12,
                    border: "none",
                    background:
                      "color-mix(in srgb, var(--si-color-muted-surface) 52%, transparent)",
                    padding: "10px 12px",
                    display: "grid",
                    gap: 3,
                  }}
                >
                  <Typography.Text
                    style={{
                      color: palette.metricLabel,
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {metric.label}
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      color: palette.metricValue,
                      fontSize: "1.2rem",
                      fontWeight: 700,
                    }}
                  >
                    {metric.value}
                  </Typography.Text>
                </div>
              ))}
            </div>
          </Card>

          <PrototypeUtilityPanel
            style={{ background: "transparent", border: "none", padding: 0 }}
          >
            <PrototypeTwoColumnGrid>
              <Card
                variant="borderless"
                style={{
                  borderRadius: 14,
                  border: "none",
                  background:
                    "color-mix(in srgb, var(--si-color-surface) 72%, transparent)",
                  boxShadow: "none",
                }}
                title={text.docsSectionTitle}
                styles={{ body: { display: "grid", gap: 12 } }}
              >
                {text.categories.map((category) => (
                  <div
                    key={category.key}
                    style={{
                      borderRadius: 12,
                      border: "none",
                      background:
                        "color-mix(in srgb, var(--si-color-muted-surface) 52%, transparent)",
                      padding: 10,
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "grid", gap: 4 }}>
                      <Typography.Text
                        style={{
                          color: palette.headerTitle,
                          fontSize: "0.85rem",
                          fontWeight: 700,
                        }}
                      >
                        {category.title}
                      </Typography.Text>
                      <Typography.Text
                        style={{
                          color: palette.headerSubtitle,
                          fontSize: "0.76rem",
                          lineHeight: 1.45,
                        }}
                      >
                        {category.summary}
                      </Typography.Text>
                    </div>
                    {category.docsKeys
                      .map((docsKey) => docsByKey.get(docsKey))
                      .filter((entry): entry is DocsEntry => Boolean(entry))
                      .map((entry) => (
                        <div
                          key={entry.key}
                          style={{
                            borderRadius: 10,
                            border: "none",
                            background:
                              "color-mix(in srgb, var(--si-color-surface) 66%, transparent)",
                            padding: 10,
                            display: "grid",
                            gap: 8,
                          }}
                        >
                          <PrototypeSplitRow>
                            <Typography.Text
                              style={{
                                color: palette.cardTitle,
                                fontWeight: 700,
                              }}
                            >
                              {entry.title}
                            </Typography.Text>
                            <Tag color="blue">{entry.badge}</Tag>
                          </PrototypeSplitRow>
                          <Typography.Paragraph
                            style={{
                              margin: 0,
                              color: palette.cardText,
                              fontSize: "0.8rem",
                              lineHeight: 1.45,
                            }}
                          >
                            {entry.summary}
                          </Typography.Paragraph>
                          <PrototypeUtilityHeaderActions>
                            <Button
                              type="primary"
                              onClick={() => openExternal(entry.path)}
                            >
                              {text.openLink}
                            </Button>
                            <Button
                              onClick={() =>
                                entry.appPath
                                  ? openInApp(entry.appPath)
                                  : openExternal(entry.path)
                              }
                            >
                              {text.openInApp}
                            </Button>
                          </PrototypeUtilityHeaderActions>
                        </div>
                      ))}
                  </div>
                ))}
              </Card>

              <div style={{ display: "grid", gap: 10 }}>
                <Card
                  variant="borderless"
                  style={{
                    borderRadius: 14,
                    border: "none",
                    background:
                      "color-mix(in srgb, var(--si-color-surface) 72%, transparent)",
                    boxShadow: "none",
                  }}
                  title={text.quickActionsTitle}
                  styles={{ body: { display: "grid", gap: 10 } }}
                >
                  {text.quickActions.map((action) => (
                    <div
                      key={action.key}
                      style={{
                        borderRadius: 10,
                        border: "none",
                        background:
                          "color-mix(in srgb, var(--si-color-muted-surface) 52%, transparent)",
                        padding: 10,
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <Typography.Text
                        style={{ color: palette.headerTitle, fontWeight: 700 }}
                      >
                        {action.title}
                      </Typography.Text>
                      <Typography.Text
                        style={{
                          color: palette.headerSubtitle,
                          fontSize: "0.77rem",
                          lineHeight: 1.45,
                        }}
                      >
                        {action.summary}
                      </Typography.Text>
                      <Button
                        type="primary"
                        onClick={() =>
                          action.inApp
                            ? openInApp(action.path)
                            : openExternal(action.path)
                        }
                      >
                        {action.inApp ? text.openInApp : text.openLink}
                      </Button>
                    </div>
                  ))}
                </Card>

                <Card
                  variant="borderless"
                  style={{
                    borderRadius: 14,
                    border: "none",
                    background:
                      "color-mix(in srgb, var(--si-color-surface) 72%, transparent)",
                    boxShadow: "none",
                  }}
                  title={text.endpointMetadataTitle}
                  styles={{ body: { display: "grid", gap: 10 } }}
                >
                  {endpointMetadata.map((meta) => (
                    <div
                      key={meta.key}
                      style={{
                        borderRadius: 10,
                        border: "none",
                        background:
                          "color-mix(in srgb, var(--si-color-muted-surface) 52%, transparent)",
                        padding: 10,
                        display: "grid",
                        gap: 4,
                      }}
                    >
                      <Typography.Text
                        style={{
                          color: palette.metricLabel,
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {meta.label}
                      </Typography.Text>
                      <Typography.Text
                        style={{
                          color: palette.metricValue,
                          fontSize: "0.78rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {meta.value}
                      </Typography.Text>
                      <Typography.Text
                        style={{
                          color: palette.headerSubtitle,
                          fontSize: "0.75rem",
                          lineHeight: 1.4,
                        }}
                      >
                        {meta.summary}
                      </Typography.Text>
                    </div>
                  ))}
                </Card>
              </div>
            </PrototypeTwoColumnGrid>
          </PrototypeUtilityPanel>
        </PrototypeUtilityShell>
      </div>
    </div>
  );
}
