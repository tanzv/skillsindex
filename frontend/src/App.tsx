import { ConfigProvider, theme } from "antd";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PublicLocaleSwitchMode,
  isAccountRoute,
  isAdminRoute,
  isProtectedRoute,
  resolveLegacyPublicRouteRedirect,
  resolvePublicLocaleSwitchMode,
  shouldShowPublicGlobalControls
} from "./App.shared";
import PublicGlobalControls from "./components/PublicGlobalControls";
import BackendWorkbenchShell from "./components/BackendWorkbenchShell";
import { SessionUser, getSessionUser, login, logout } from "./lib/api";
import { extractCategorySlug, extractSkillID, normalizeAppRoute } from "./lib/appPathnameResolver";
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
import AccountCenterPage from "./pages/accountCenter/AccountCenterPage";
import AdminIntegrationsPage from "./pages/adminWorkbench/AdminIntegrationsPage";
import AdminCatalogPage from "./pages/adminCatalog/AdminCatalogPage";
import AdminRepositoryCatalogPage, { isAdminRepositoryCatalogRoute } from "./pages/adminCatalog/AdminRepositoryCatalogPage";
import AdminOpsControlPage from "./pages/adminOps/AdminOpsControlPage";
import AdminOpsMetricsPage from "./pages/adminOps/AdminOpsMetricsPage";
import AdminOverviewPage from "./pages/adminOverview/AdminOverviewPage";
import AdminSecurityPage from "./pages/adminSecurity/AdminSecurityPage";
import AdminWorkbenchPage from "./pages/adminWorkbench/AdminWorkbenchPage";
import LoginPage from "./pages/login/LoginPage";
import { resolveLoginBrandConfig } from "./pages/login/loginBrandConfig";
import { resolveLoginInfoPanelConfigOverride } from "./pages/login/loginInfoPanelConfig";
import MarketplaceHomePage from "./pages/marketplaceHome/MarketplaceHomePage";
import MarketplaceCategoryDetailPage from "./pages/marketplacePublic/MarketplaceCategoryDetailPage";
import OrganizationCenterPage from "./pages/organizationCenter/OrganizationCenterPage";
import PrototypeRouteRenderer from "./pages/prototype/PrototypeRouteRenderer";
import PublicComparePage from "./pages/publicCompare/PublicComparePage";
import PublicCategoriesPage from "./pages/publicCategories/PublicCategoriesPage";
import PublicDocsPage from "./pages/publicDocs/PublicDocsPage";
import PublicRankingPage from "./pages/publicRanking/PublicRankingPage";
import PublicSkillDetailPage from "./pages/publicSkillDetail/PublicSkillDetailPage";
import SkillOperationsPage from "./pages/skillOperations/SkillOperationsPage";
import { isSkillOperationsRoute } from "./pages/skillOperations/SkillOperationsPage.helpers";
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
  const categorySlug = useMemo(() => extractCategorySlug(window.location.pathname), [locationKey]);
  const prototypeMatch = useMemo(() => matchPrototypeCatalog(window.location.pathname), [locationKey]);
  const text = useMemo(
    () => ({
      brandName: t("app.brandName"),
      brandTitle: t("app.brandTitle"),
      home: t("app.home"),
      homeSubtitle: t("app.homeSubtitle"),
      signOut: t("app.signOut"),
      quickJump: t("app.quickJump"),
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
    if (sessionUser && route === "/login" && !submitLoading) {
      navigate("/");
    }
  }, [authLoading, route, sessionUser, submitLoading]);

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
      route === "/categories/:slug" ||
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

  useEffect(() => {
    if (route !== "/skills/:id") {
      return;
    }
    if (window.location.hash) {
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [locationKey, route]);

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
    route === "/categories/:slug" ||
    route === "/rankings" ||
    route === "/skills/:id" ||
    route === "/prototype"
  ) {
    const showPublicGlobalControls = shouldShowPublicGlobalControls(route, window.location.pathname);
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
            onLogout={handleLogout}
            onThemeModeChange={handleThemeModeChange}
            onLocaleChange={(nextLocale) => {
              void handleLocaleChange(nextLocale);
            }}
            locationKey={locationKey}
            isResultsPage={route === "/results"}
          />
        ) : null}
        {route === "/categories/:slug" ? (
          <MarketplaceCategoryDetailPage
            locale={locale}
            sessionUser={sessionUser}
            onNavigate={navigate}
            onLogout={handleLogout}
            onThemeModeChange={handleThemeModeChange}
            onLocaleChange={(nextLocale) => {
              void handleLocaleChange(nextLocale);
            }}
            locationKey={locationKey}
            categorySlug={categorySlug}
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
        {route === "/docs" ? (
          <PublicDocsPage
            locale={locale}
            onNavigate={navigate}
            onLogout={handleLogout}
            onThemeModeChange={handleThemeModeChange}
            onLocaleChange={(nextLocale) => {
              void handleLocaleChange(nextLocale);
            }}
            sessionUser={sessionUser}
          />
        ) : null}
        {route === "/categories" ? (
          <PublicCategoriesPage
            locale={locale}
            onNavigate={navigate}
            onLogout={handleLogout}
            onThemeModeChange={handleThemeModeChange}
            onLocaleChange={(nextLocale) => {
              void handleLocaleChange(nextLocale);
            }}
            sessionUser={sessionUser}
          />
        ) : null}
        {route === "/rankings" ? (
          <PublicRankingPage
            locale={locale}
            onNavigate={navigate}
            onLogout={handleLogout}
            onThemeModeChange={handleThemeModeChange}
            onLocaleChange={(nextLocale) => {
              void handleLocaleChange(nextLocale);
            }}
            sessionUser={sessionUser}
          />
        ) : null}
        {route === "/skills/:id" ? (
          <PublicSkillDetailPage
            locale={locale}
            skillID={skillID || 0}
            onNavigate={navigate}
            sessionUser={sessionUser}
            onLogout={handleLogout}
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
            onThemeModeChange={handleThemeModeChange}
            onLocaleChange={(nextLocale) => {
              void handleLocaleChange(nextLocale);
            }}
            onLogout={() => {
              void handleLogout();
            }}
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

  const quickRoutes: ProtectedRoute[] = isProtectedRoute(route)
    ? isAdminRoute(route)
      ? adminQuickRoutes
      : accountQuickRoutes
    : [];
  const protectedRoute = route as ProtectedRoute;
  const protectedContent = isAdminRoute(protectedRoute) ? (
    protectedRoute === "/admin/overview" ? (
      <AdminOverviewPage currentPath={window.location.pathname} onNavigate={navigate} />
    ) : protectedRoute === "/admin/integrations" ? (
      <AdminIntegrationsPage />
    ) : protectedRoute === "/admin/ops/metrics" ? (
      <AdminOpsMetricsPage />
    ) : protectedRoute === "/admin/organizations" ? (
      <OrganizationCenterPage
        locale={locale}
        currentPath={window.location.pathname}
        onNavigate={navigate}
        sessionUser={sessionUser}
        onThemeModeChange={handleThemeModeChange}
        onLocaleChange={(nextLocale) => {
          void handleLocaleChange(nextLocale);
        }}
        onLogout={handleLogout}
      />
    ) : isSkillOperationsRoute(protectedRoute) ? (
      <SkillOperationsPage
        locale={locale}
        route={protectedRoute}
        currentPath={window.location.pathname}
        onNavigate={navigate}
        sessionUser={sessionUser}
        onThemeModeChange={handleThemeModeChange}
        onLocaleChange={(nextLocale) => {
          void handleLocaleChange(nextLocale);
        }}
        onLogout={handleLogout}
      />
    ) : isAdminCatalogRoute(protectedRoute) ? (
      isAdminRepositoryCatalogRoute(protectedRoute) ? (
        <AdminRepositoryCatalogPage locale={locale} route={protectedRoute} onNavigate={navigate} />
      ) : (
        <AdminCatalogPage route={protectedRoute} />
      )
    ) : isAdminSecurityRoute(protectedRoute) ? (
      <AdminSecurityPage route={protectedRoute} />
    ) : isAdminOpsControlRoute(protectedRoute) ? (
      <AdminOpsControlPage route={protectedRoute} />
    ) : (
      <AdminWorkbenchPage route={protectedRoute} />
    )
  ) : isAccountRoute(protectedRoute) ? (
    <AccountCenterPage locale={locale} route={protectedRoute} onNavigate={navigate} />
  ) : null;
  const shouldRenderProtectedContentDirectly = isAdminRoute(protectedRoute) && isSkillOperationsRoute(protectedRoute);

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
      {shouldRenderProtectedContentDirectly ? (
        protectedContent
      ) : (
        <BackendWorkbenchShell
          route={protectedRoute}
          locale={locale}
          themeMode={themeMode}
          submitLoading={submitLoading}
          sessionUser={sessionUser}
          navItems={navItems}
          navByPath={navByPath}
          quickRoutes={quickRoutes}
          text={text}
          onNavigate={navigate}
          onLocaleChange={(nextLocale) => {
            void handleLocaleChange(nextLocale);
          }}
          onThemeModeChange={handleThemeModeChange}
          onLogout={() => {
            void handleLogout();
          }}
        >
          {protectedContent}
        </BackendWorkbenchShell>
      )}
    </ConfigProvider>
  );
}
