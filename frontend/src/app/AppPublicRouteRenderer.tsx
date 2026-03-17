import { ConfigProvider, theme } from "antd";

import { type PublicLocaleSwitchMode, shouldShowPublicGlobalControls } from "../App.shared";
import PublicGlobalControls from "../components/PublicGlobalControls";
import type { SessionUser } from "../lib/api";
import type { AppLocale } from "../lib/i18n";
import type { AppRoute } from "../lib/appPathnameResolver";
import type { PrototypeCatalogEntry } from "../lib/prototypeCatalog";
import type { ThemeMode } from "../lib/themeModePath";
import MarketplaceHomePage from "../pages/marketplaceHome/MarketplaceHomePage";
import MarketplaceCategoryDetailPage from "../pages/marketplacePublic/MarketplaceCategoryDetailPage";
import PrototypeRouteRenderer from "../pages/prototype/PrototypeRouteRenderer";
import PublicCategoriesPage from "../pages/publicCategories/PublicCategoriesPage";
import PublicComparePage from "../pages/publicCompare/PublicComparePage";
import PublicDocsPage from "../pages/publicDocs/PublicDocsPage";
import PublicRankingPage from "../pages/publicRanking/PublicRankingPage";
import PublicSkillDetailPage from "../pages/publicSkillDetail/PublicSkillDetailPage";

import { isLightPrototypePathname, isPublicExperienceRoute } from "./AppRoot.shared";

interface AppPublicRouteRendererProps {
  route: AppRoute;
  locale: AppLocale;
  locationKey: string;
  themeMode: ThemeMode;
  publicLocaleSwitchMode: PublicLocaleSwitchMode;
  categorySlug: string | null;
  skillID: number | null;
  prototypeMatch: PrototypeCatalogEntry | null;
  sessionUser: SessionUser | null;
  onNavigate: (path: string) => void;
  onLocaleChange: (nextLocale: AppLocale) => void;
  onThemeModeChange: (nextMode: ThemeMode) => void;
  onLogout: () => void;
}

export default function AppPublicRouteRenderer({
  route,
  locale,
  locationKey,
  themeMode,
  publicLocaleSwitchMode,
  categorySlug,
  skillID,
  prototypeMatch,
  sessionUser,
  onNavigate,
  onLocaleChange,
  onThemeModeChange,
  onLogout
}: AppPublicRouteRendererProps) {
  if (!isPublicExperienceRoute(route)) {
    return null;
  }

  const pathname = window.location.pathname;
  const showPublicGlobalControls = shouldShowPublicGlobalControls(route, pathname);
  const publicTheme = {
    algorithm: isLightPrototypePathname(pathname) ? theme.defaultAlgorithm : theme.darkAlgorithm,
    token: {
      colorPrimary: "#0e8aa0",
      borderRadius: 10,
      fontFamily: '"Noto Sans SC", "Manrope", sans-serif'
    }
  };

  return (
    <ConfigProvider theme={publicTheme}>
      {showPublicGlobalControls ? (
        <PublicGlobalControls
          locale={locale}
          showLocaleSwitch={publicLocaleSwitchMode === "overlay"}
          themeMode={themeMode}
          onLocaleChange={onLocaleChange}
          onThemeModeChange={onThemeModeChange}
        />
      ) : null}
      {route === "/" || route === "/results" ? (
        <MarketplaceHomePage
          locale={locale}
          sessionUser={sessionUser}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onThemeModeChange={onThemeModeChange}
          onLocaleChange={onLocaleChange}
          locationKey={locationKey}
          isResultsPage={route === "/results"}
        />
      ) : null}
      {route === "/categories/:slug" ? (
        <MarketplaceCategoryDetailPage
          locale={locale}
          sessionUser={sessionUser}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onThemeModeChange={onThemeModeChange}
          onLocaleChange={onLocaleChange}
          locationKey={locationKey}
          categorySlug={categorySlug}
        />
      ) : null}
      {route === "/compare" ? (
        <PublicComparePage locale={locale} locationKey={locationKey} onNavigate={onNavigate} sessionUser={sessionUser} />
      ) : null}
      {route === "/docs" ? (
        <PublicDocsPage
          locale={locale}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onThemeModeChange={onThemeModeChange}
          onLocaleChange={onLocaleChange}
          sessionUser={sessionUser}
        />
      ) : null}
      {route === "/categories" ? (
        <PublicCategoriesPage
          locale={locale}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onThemeModeChange={onThemeModeChange}
          onLocaleChange={onLocaleChange}
          sessionUser={sessionUser}
        />
      ) : null}
      {route === "/rankings" ? (
        <PublicRankingPage
          locale={locale}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onThemeModeChange={onThemeModeChange}
          onLocaleChange={onLocaleChange}
          sessionUser={sessionUser}
        />
      ) : null}
      {route === "/skills/:id" ? (
        <PublicSkillDetailPage
          locale={locale}
          skillID={skillID || 0}
          onNavigate={onNavigate}
          sessionUser={sessionUser}
          onLogout={onLogout}
          onThemeModeChange={onThemeModeChange}
          onLocaleChange={onLocaleChange}
        />
      ) : null}
      {route === "/prototype" && prototypeMatch ? (
        <PrototypeRouteRenderer
          locale={locale}
          currentPath={pathname}
          entry={prototypeMatch}
          onNavigate={onNavigate}
          sessionUser={sessionUser}
          onThemeModeChange={onThemeModeChange}
          onLocaleChange={onLocaleChange}
          onLogout={onLogout}
        />
      ) : null}
    </ConfigProvider>
  );
}
