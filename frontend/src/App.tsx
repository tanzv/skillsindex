import { Button, ConfigProvider, theme } from "antd";
import { GlobalOutlined, TranslationOutlined } from "@ant-design/icons";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LocaleSwitchButton,
  PublicLocaleSwitchMode,
  QuickJumpActions,
  QuickJumpLabel,
  QuickJumpSection,
  SideLocaleSwitch,
  isAccountRoute,
  isAdminRoute,
  isProtectedRoute,
  resolveLegacyPublicRouteRedirect,
  resolvePublicLocaleSwitchMode
} from "./App.shared";
import PublicGlobalControls from "./components/PublicGlobalControls";
import { SessionUser, getSessionUser, login, logout } from "./lib/api";
import { extractSkillID, normalizeAppRoute } from "./lib/appPathnameResolver";
import { AppLocale, changeLocale, resolveActiveLocale } from "./lib/i18n";
import {
  matchPrototypeCatalog,
  routeNeedsAuth
} from "./lib/prototypeCatalog";
import {
  ProtectedRoute,
  accountQuickRoutes,
  adminQuickRoutes,
  isAdminCatalogRoute,
  isAdminOpsControlRoute,
  isAdminSecurityRoute,
  navItems,
} from "./appNavigationConfig";
import AccountCenterPage from "./pages/AccountCenterPage";
import AdminIntegrationsPage from "./pages/AdminIntegrationsPage";
import AdminCatalogPage from "./pages/AdminCatalogPage";
import AdminOpsControlPage from "./pages/AdminOpsControlPage";
import AdminOpsMetricsPage from "./pages/AdminOpsMetricsPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminSecurityPage from "./pages/AdminSecurityPage";
import AdminWorkbenchPage from "./pages/AdminWorkbenchPage";
import LoginPage from "./pages/LoginPage";
import { resolveLoginBrandConfig } from "./pages/loginBrandConfig";
import { resolveLoginInfoPanelConfigOverride } from "./pages/loginInfoPanelConfig";
import MarketplaceHomePage from "./pages/MarketplaceHomePage";
import OrganizationCenterPage from "./pages/OrganizationCenterPage";
import PrototypeRouteRenderer from "./pages/PrototypeRouteRenderer";
import PublicComparePage from "./pages/PublicComparePage";
import PublicCategoriesPage from "./pages/PublicCategoriesPage";
import PublicDocsPage from "./pages/PublicDocsPage";
import PublicRankingPage from "./pages/PublicRankingPage";
import PublicSkillDetailPage from "./pages/PublicSkillDetailPage";
import { buildPathWithThemeMode, resolveThemeMode, ThemeMode } from "./lib/themeModePath";
import { applyThemeTokens } from "./theme/themeSystem";

function navigate(path: string): void {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function App() {
  const { t } = useTranslation();
  const [locationKey, setLocationKey] = useState(() => `${window.location.pathname}${window.location.search}`);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [locale, setLocale] = useState<AppLocale>(() => resolveActiveLocale());

  const route = useMemo(() => normalizeAppRoute(window.location.pathname), [locationKey]);
  const publicLocaleSwitchMode = useMemo<PublicLocaleSwitchMode>(
    () => resolvePublicLocaleSwitchMode(import.meta.env.VITE_PUBLIC_LOCALE_SWITCH_MODE),
    []
  );
  const themeMode = useMemo<ThemeMode>(() => resolveThemeMode(window.location.pathname), [locationKey]);
  const skillID = useMemo(() => extractSkillID(window.location.pathname), [locationKey]);
  const prototypeMatch = useMemo(() => matchPrototypeCatalog(window.location.pathname), [locationKey]);
  const text = useMemo(
    () => ({
      brandName: t("app.brandName"),
      brandTitle: t("app.brandTitle"),
      navMarketplace: t("app.navMarketplace"),
      navAdmin: t("app.navAdmin"),
      navAccount: t("app.navAccount"),
      home: t("app.home"),
      homeSubtitle: t("app.homeSubtitle"),
      signOut: t("app.signOut"),
      quickJump: t("app.quickJump"),
      controlCenter: t("app.controlCenter"),
      architecture: t("app.architecture"),
      bootstrapping: t("app.bootstrapping"),
      loginKicker: t("login.kicker"),
      loginTitle: t("login.title"),
      loginLead: t("login.lead")
    }),
    [t, locale]
  );

  const loginInfoPanelConfig = useMemo(
    () =>
      resolveLoginInfoPanelConfigOverride({
        locale,
        fallback: {
          kicker: text.loginKicker,
          title: text.loginTitle,
          lead: text.loginLead
        },
        search: window.location.search,
        runtimeConfig: (window as Window & { __SKILLSINDEX_LOGIN_INFO_PANEL__?: unknown }).__SKILLSINDEX_LOGIN_INFO_PANEL__
      }),
    [locale, locationKey, text.loginKicker, text.loginLead, text.loginTitle]
  );
  const loginBrandConfig = useMemo(
    () =>
      resolveLoginBrandConfig({
        locale,
        search: window.location.search,
        runtimeConfig: (window as Window & { __SKILLSINDEX_LOGIN_BRAND__?: unknown }).__SKILLSINDEX_LOGIN_BRAND__
      }),
    [locale, locationKey]
  );

  const currentNavItem = useMemo(
    () => (isProtectedRoute(route) ? navItems.find((item) => item.path === route) : undefined),
    [route]
  );
  const navByPath = useMemo(() => new Map(navItems.map((item) => [item.path, item])), []);

  useEffect(() => {
    function handleRouteChange() {
      setLocationKey(`${window.location.pathname}${window.location.search}`);
    }

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    const redirectPath = resolveLegacyPublicRouteRedirect(
      window.location.pathname,
      window.location.search,
      window.location.hash
    );
    if (!redirectPath) {
      return;
    }
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (redirectPath === currentPath) {
      return;
    }
    navigate(redirectPath);
  }, [locationKey]);

  async function handleLocaleChange(nextLocale: AppLocale) {
    const changedLocale = await changeLocale(nextLocale);
    setLocale(changedLocale);
  }

  function handleThemeModeChange(nextMode: ThemeMode) {
    const nextPath = buildPathWithThemeMode(window.location.pathname, nextMode, window.location.search, window.location.hash);
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextPath === currentPath) {
      return;
    }
    navigate(nextPath);
  }

  useLayoutEffect(() => {
    applyThemeTokens(themeMode);
  }, [themeMode]);

  useEffect(() => {
    let active = true;
    setAuthLoading(true);

    getSessionUser()
      .then((user) => {
        if (!active) {
          return;
        }
        setSessionUser(user);
      })
      .finally(() => {
        if (active) {
          setAuthLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!sessionUser && isProtectedRoute(route)) {
      navigate("/login");
      return;
    }
    if (!sessionUser && route === "/prototype" && routeNeedsAuth(window.location.pathname)) {
      navigate("/login");
      return;
    }
    if (sessionUser && route === "/login") {
      navigate("/");
    }
  }, [authLoading, route, sessionUser]);

  useEffect(() => {
    const classes = [
      "page-home-react",
      "page-home-react-light",
      "page-login-react",
      "page-login-react-light",
      "page-admin-react",
      "page-account-react"
    ];
    document.body.classList.remove(...classes);
    const lightPrototype = /^\/(light|mobile\/light)(\/|$)/.test(window.location.pathname);
    if (route === "/login") {
      document.body.classList.add(lightPrototype ? "page-login-react-light" : "page-login-react");
      return;
    }
    if (
      route === "/" ||
      route === "/results" ||
      route === "/compare" ||
      route === "/docs" ||
      route === "/categories" ||
      route === "/rankings" ||
      route === "/skills/:id" ||
      route === "/prototype"
    ) {
      document.body.classList.add(lightPrototype ? "page-home-react-light" : "page-home-react");
      return;
    }
    if (route.startsWith("/account")) {
      document.body.classList.add("page-account-react");
      return;
    }
    document.body.classList.add("page-admin-react");
  }, [route]);

  async function handleLogin(username: string, password: string) {
    setSubmitLoading(true);
    try {
      const user = await login(username, password);
      setSessionUser(user);
      navigate("/");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleLogout() {
    setSubmitLoading(true);
    try {
      await logout();
      setSessionUser(null);
      navigate("/login");
    } finally {
      setSubmitLoading(false);
    }
  }

  if (authLoading) {
    return <div className="app-loading">{text.bootstrapping}</div>;
  }

  const publicTheme = {
    algorithm: /^\/(light|mobile\/light)(\/|$)/.test(window.location.pathname)
      ? theme.defaultAlgorithm
      : theme.darkAlgorithm,
    token: {
      colorPrimary: "#0e8aa0",
      borderRadius: 10,
      fontFamily: '"Noto Sans SC", "Manrope", sans-serif'
    }
  };

  if (
    route === "/" ||
    route === "/results" ||
    route === "/compare" ||
    route === "/docs" ||
    route === "/categories" ||
    route === "/rankings" ||
    route === "/skills/:id" ||
    route === "/prototype"
  ) {
    const showPublicGlobalControls = route !== "/" && route !== "/results" && route !== "/skills/:id";
    return (
      <ConfigProvider theme={publicTheme}>
        {showPublicGlobalControls ? (
          <PublicGlobalControls
            locale={locale}
            showLocaleSwitch={publicLocaleSwitchMode === "overlay"}
            themeMode={themeMode}
            onLocaleChange={(nextLocale) => {
              void handleLocaleChange(nextLocale);
            }}
            onThemeModeChange={handleThemeModeChange}
          />
        ) : null}
        {route === "/" || route === "/results" ? (
          <MarketplaceHomePage
            locale={locale}
            sessionUser={sessionUser}
            onNavigate={navigate}
            onThemeModeChange={handleThemeModeChange}
            onLocaleChange={(nextLocale) => {
              void handleLocaleChange(nextLocale);
            }}
            locationKey={locationKey}
            isResultsPage={route === "/results"}
          />
        ) : null}
        {route === "/compare" ? (
          <PublicComparePage
            locale={locale}
            locationKey={locationKey}
            onNavigate={navigate}
            sessionUser={sessionUser}
          />
        ) : null}
        {route === "/docs" ? <PublicDocsPage locale={locale} onNavigate={navigate} sessionUser={sessionUser} /> : null}
        {route === "/categories" ? (
          <PublicCategoriesPage locale={locale} onNavigate={navigate} sessionUser={sessionUser} />
        ) : null}
        {route === "/rankings" ? (
          <PublicRankingPage locale={locale} onNavigate={navigate} sessionUser={sessionUser} />
        ) : null}
        {route === "/skills/:id" ? (
          <PublicSkillDetailPage
            locale={locale}
            skillID={skillID || 0}
            onNavigate={navigate}
            sessionUser={sessionUser}
            onThemeModeChange={handleThemeModeChange}
            onLocaleChange={(nextLocale) => {
              void handleLocaleChange(nextLocale);
            }}
          />
        ) : null}
        {route === "/prototype" && prototypeMatch ? (
          <PrototypeRouteRenderer
            locale={locale}
            currentPath={window.location.pathname}
            entry={prototypeMatch}
            onNavigate={navigate}
            sessionUser={sessionUser}
          />
        ) : null}
      </ConfigProvider>
    );
  }

  if (!sessionUser) {
    const lightPrototype = themeMode === "light";
    return (
      <ConfigProvider
        theme={{
          algorithm: lightPrototype ? theme.defaultAlgorithm : theme.darkAlgorithm,
          token: {
            colorPrimary: lightPrototype ? "#111111" : "#d6d6d6",
            borderRadius: 10,
            fontFamily: '"Noto Sans SC", "Noto Sans", sans-serif'
          }
        }}
      >
        <LoginPage
          loading={submitLoading}
          locale={locale}
          themeMode={themeMode}
          brandConfig={loginBrandConfig}
          infoPanelConfig={loginInfoPanelConfig}
          onLocaleChange={(nextLocale) => {
            void handleLocaleChange(nextLocale);
          }}
          onThemeModeChange={handleThemeModeChange}
          onSubmit={handleLogin}
        />
      </ConfigProvider>
    );
  }

  if (route === "/admin/overview") {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "#1d4ed8",
            borderRadius: 10,
            fontFamily: '"Noto Sans", "Manrope", sans-serif'
          }
        }}
      >
        <AdminOverviewPage currentPath={window.location.pathname} onNavigate={navigate} />
      </ConfigProvider>
    );
  }

  const adminNav = navItems.filter((item) => item.section === "admin");
  const accountNav = navItems.filter((item) => item.section === "account");

  const quickRoutes: ProtectedRoute[] = isProtectedRoute(route)
    ? isAdminRoute(route)
      ? adminQuickRoutes
      : accountQuickRoutes
    : [];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0e8aa0",
          borderRadius: 12,
          fontFamily: '"Noto Sans SC", "Manrope", sans-serif'
        }
      }}
    >
      <div className="app-shell">
        <aside className="side-nav">
          <div className="brand-block">
            <span className="brand-kicker">{text.brandName}</span>
            <h1>{text.brandTitle}</h1>
          </div>

          <nav className="side-nav-groups">
            <div className="side-nav-group">
              <p className="side-nav-group-title">{text.navMarketplace}</p>
              <button className="nav-item" onClick={() => navigate("/")} type="button">
                <strong>{text.home}</strong>
                <span>{text.homeSubtitle}</span>
              </button>
            </div>

            <div className="side-nav-group">
              <p className="side-nav-group-title">{text.navAdmin}</p>
              {adminNav.map((item) => (
                <button
                  key={item.path}
                  className={item.path === route ? "nav-item active" : "nav-item"}
                  onClick={() => navigate(item.path)}
                  type="button"
                >
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </button>
              ))}
            </div>

            <div className="side-nav-group">
              <p className="side-nav-group-title">{text.navAccount}</p>
              {accountNav.map((item) => (
                <button
                  key={item.path}
                  className={item.path === route ? "nav-item active" : "nav-item"}
                  onClick={() => navigate(item.path)}
                  type="button"
                >
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="user-block">
            <SideLocaleSwitch role="group" aria-label="Sidebar locale switch">
              <LocaleSwitchButton
                type="button"
                data-testid="sidebar-locale-switch-en"
                onClick={() => {
                  void handleLocaleChange("en");
                }}
                $active={locale === "en"}
                disabled={locale === "en"}
                aria-label="Switch to English locale"
                title="English locale"
              >
                <GlobalOutlined />
              </LocaleSwitchButton>
              <LocaleSwitchButton
                type="button"
                data-testid="sidebar-locale-switch-zh"
                onClick={() => {
                  void handleLocaleChange("zh");
                }}
                $active={locale === "zh"}
                disabled={locale === "zh"}
                aria-label="Switch to Chinese locale"
                title="Chinese locale"
              >
                <TranslationOutlined />
              </LocaleSwitchButton>
            </SideLocaleSwitch>
            <p>{sessionUser.username}</p>
            <small>{sessionUser.role}</small>
            <button className="ghost" onClick={handleLogout} disabled={submitLoading} type="button">
              {text.signOut}
            </button>
          </div>
        </aside>

        <main className="main-panel">
          <header className="main-header">
            <h2>{currentNavItem?.title || text.controlCenter}</h2>
            <p>{currentNavItem?.subtitle || text.architecture}</p>
          </header>

          {quickRoutes.length > 0 ? (
            <QuickJumpSection aria-label="quick route jump">
              <QuickJumpLabel>{text.quickJump}</QuickJumpLabel>
              <QuickJumpActions>
                {quickRoutes.map((path) => (
                  <Button
                    key={path}
                    type={path === route ? "primary" : "default"}
                    size="small"
                    onClick={() => navigate(path)}
                  >
                    {navByPath.get(path)?.title || path}
                  </Button>
                ))}
              </QuickJumpActions>
            </QuickJumpSection>
          ) : null}

          {isProtectedRoute(route) && isAdminRoute(route) ? (
            route === "/admin/integrations" ? (
              <AdminIntegrationsPage />
            ) : route === "/admin/ops/metrics" ? (
              <AdminOpsMetricsPage />
            ) : route === "/admin/organizations" ? (
              <OrganizationCenterPage locale={locale} onNavigate={navigate} />
            ) : isAdminCatalogRoute(route) ? (
              <AdminCatalogPage route={route} />
            ) : isAdminSecurityRoute(route) ? (
              <AdminSecurityPage route={route} />
            ) : isAdminOpsControlRoute(route) ? (
              <AdminOpsControlPage route={route} />
            ) : (
              <AdminWorkbenchPage route={route} />
            )
          ) : isProtectedRoute(route) && isAccountRoute(route) ? (
            <AccountCenterPage locale={locale} route={route} onNavigate={navigate} />
          ) : null}
        </main>
      </div>
    </ConfigProvider>
  );
}
