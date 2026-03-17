import { ConfigProvider, theme } from "antd";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PublicLocaleSwitchMode,
  buildLoginRedirectPath,
  isProtectedRoute,
  resolveLegacyPublicRouteRedirect,
  resolvePostLoginRedirect,
  resolvePublicLocaleSwitchMode,
  shouldRequireSession
} from "./App.shared";
import { SessionUser, getSessionContext, login, logout } from "./lib/api";
import { extractCategorySlug, extractSkillID, normalizeAppRoute } from "./lib/appPathnameResolver";
import { AppLocale, changeLocale, resolveActiveLocale } from "./lib/i18n";
import {
  matchPrototypeCatalog,
  routeNeedsAuth
} from "./lib/prototypeCatalog";
import LoginPage from "./pages/login/LoginPage";
import { resolveLoginBrandConfig } from "./pages/login/loginBrandConfig";
import { resolveLoginInfoPanelConfigOverride } from "./pages/login/loginInfoPanelConfig";
import { buildPathWithThemeMode, resolveThemeMode, ThemeMode } from "./lib/themeModePath";
import { applyThemeTokens } from "./theme/themeSystem";
import AppProtectedRouteRenderer from "./app/AppProtectedRouteRenderer";
import AppPublicRouteRenderer from "./app/AppPublicRouteRenderer";
import { type AppTextDictionary, isPublicExperienceRoute, resolveAppBodyClassName } from "./app/AppRoot.shared";

function navigate(path: string): void {
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (path === currentPath) {
    return;
  }
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function App() {
  const { t } = useTranslation();
  const [locationKey, setLocationKey] = useState(() => `${window.location.pathname}${window.location.search}`);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [marketplacePublicAccess, setMarketplacePublicAccess] = useState(true);
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
  const text = useMemo<AppTextDictionary>(
    () => ({
      brandName: t("app.brandName"),
      brandTitle: t("app.brandTitle"),
      home: t("app.home"),
      homeSubtitle: t("app.homeSubtitle"),
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

    getSessionContext()
      .then((payload) => {
        if (!active) {
          return;
        }
        setSessionUser(payload.user || null);
        setMarketplacePublicAccess(payload.marketplace_public_access !== false);
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

  const loginRedirectPath = useMemo(
    () => buildLoginRedirectPath(window.location.pathname, window.location.search, window.location.hash),
    [locationKey]
  );
  const postLoginRedirectPath = useMemo(
    () => resolvePostLoginRedirect(window.location.search, "/"),
    [locationKey]
  );
  const shouldRedirectToLogin =
    !authLoading &&
    !sessionUser &&
    (shouldRequireSession(route, marketplacePublicAccess) ||
      (route === "/prototype" && routeNeedsAuth(window.location.pathname)));

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (shouldRedirectToLogin) {
      navigate(loginRedirectPath);
      return;
    }
    if (sessionUser && route === "/login" && !submitLoading) {
      navigate(postLoginRedirectPath);
    }
  }, [authLoading, loginRedirectPath, postLoginRedirectPath, route, sessionUser, shouldRedirectToLogin, submitLoading]);

  useEffect(() => {
    const classes = ["page-home-react", "page-home-react-light", "page-login-react", "page-login-react-light", "page-admin-react", "page-account-react"];
    document.body.classList.remove(...classes);
    document.body.classList.add(resolveAppBodyClassName(route, window.location.pathname));
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

  const blocksOnAuthBootstrap =
    authLoading &&
    (route === "/login" ||
      shouldRequireSession(route, marketplacePublicAccess) ||
      (route === "/prototype" && routeNeedsAuth(window.location.pathname)));

  if (blocksOnAuthBootstrap || shouldRedirectToLogin) {
    return <div className="app-loading">{text.bootstrapping}</div>;
  }

  if (isPublicExperienceRoute(route)) {
    return (
      <AppPublicRouteRenderer
        route={route}
        locale={locale}
        locationKey={locationKey}
        themeMode={themeMode}
        publicLocaleSwitchMode={publicLocaleSwitchMode}
        categorySlug={categorySlug}
        skillID={skillID}
        prototypeMatch={prototypeMatch}
        sessionUser={sessionUser}
        onNavigate={navigate}
        onLocaleChange={handleLocaleChange}
        onThemeModeChange={handleThemeModeChange}
        onLogout={() => {
          void handleLogout();
        }}
      />
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

  if (!isProtectedRoute(route)) {
    return <div className="app-loading">{text.bootstrapping}</div>;
  }

  return (
    <AppProtectedRouteRenderer
      route={route}
      locale={locale}
      themeMode={themeMode}
      submitLoading={submitLoading}
      sessionUser={sessionUser}
      text={text}
      onNavigate={navigate}
      onLocaleChange={handleLocaleChange}
      onThemeModeChange={handleThemeModeChange}
      onLogout={() => {
        void handleLogout();
      }}
    />
  );
}
