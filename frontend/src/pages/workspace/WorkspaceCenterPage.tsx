import { useEffect, useMemo, useState } from "react";

import { SessionUser } from "../../lib/api";
import { AppLocale } from "../../lib/i18n";
import type { ThemeMode } from "../../lib/themeModePath";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "../prototype/prototypeDataFallback";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import WorkspaceCenterPageContent from "./WorkspaceCenterPageContent";
import WorkspaceDashboardPageContent from "./WorkspaceDashboardPageContent";
import { buildWorkspaceSnapshot } from "./WorkspaceCenterPage.helpers";
import {
  buildWorkspaceSidebarNavigation,
  resolveWorkspaceSectionMenuItemID,
  resolveWorkspaceSectionPage
} from "./WorkspaceCenterPage.navigation";
import WorkspacePrototypePageShell from "./WorkspacePrototypePageShell";

interface WorkspaceCenterPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
}

interface WorkspaceViewportSnapshot {
  width: number;
  height: number;
}

const DEFAULT_VIEWPORT: WorkspaceViewportSnapshot = {
  width: 1280,
  height: 720
};

function resolveInitialViewport(): WorkspaceViewportSnapshot {
  if (typeof window === "undefined") {
    return DEFAULT_VIEWPORT;
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

export default function WorkspaceCenterPage({
  locale,
  currentPath,
  onNavigate,
  sessionUser,
  onThemeModeChange,
  onLocaleChange,
  onLogout
}: WorkspaceCenterPageProps) {
  const text = useMemo(() => getWorkspaceCenterCopy(locale), [locale]);
  const dataMode = useMemo(() => resolvePrototypeDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE), []);
  const pageNavigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const activeSectionPage = useMemo(() => resolveWorkspaceSectionPage(currentPath), [currentPath]);
  const activeWorkspaceMenuID = useMemo(() => resolveWorkspaceSectionMenuItemID(currentPath), [currentPath]);
  const [viewport, setViewport] = useState<WorkspaceViewportSnapshot>(() => resolveInitialViewport());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [degradedMessage, setDegradedMessage] = useState("");
  const [payload, setPayload] = useState<Awaited<ReturnType<typeof loadMarketplaceWithFallback>>["payload"] | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleResize(): void {
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
    setError("");
    setDegradedMessage("");

    loadMarketplaceWithFallback({
      query: { sort: "recent", page: 1 },
      locale,
      sessionUser,
      mode: dataMode
    })
      .then((result) => {
        if (!active) {
          return;
        }

        setPayload(result.payload);
        setDegradedMessage(result.degraded ? result.errorMessage || text.degradedData : "");
      })
      .catch((loadError) => {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : text.requestFailed);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataMode, locale, sessionUser, text.degradedData, text.requestFailed]);

  const snapshot = useMemo(() => buildWorkspaceSnapshot({ payload, locale }), [locale, payload]);
  const sidebarGroups = useMemo(
    () =>
      buildWorkspaceSidebarNavigation({
        text,
        toPublicPath: pageNavigator.toPublic,
        toAdminPath: pageNavigator.toAdmin,
        sectionMode: "workspace-route"
      }),
    [pageNavigator.toAdmin, pageNavigator.toPublic, text]
  );
  const isDashboardRoute = activeSectionPage === "overview";
  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || /^\/mobile(\/|$)/.test(currentPath);

  const content = isDashboardRoute ? (
    <WorkspaceDashboardPageContent
      text={text}
      locale={locale}
      loading={loading}
      error={error}
      degradedMessage={degradedMessage}
      snapshot={snapshot}
    />
  ) : (
    <WorkspaceCenterPageContent
      text={text}
      locale={locale}
      loading={loading}
      error={error}
      degradedMessage={degradedMessage}
      snapshot={snapshot}
      activeSectionPage={activeSectionPage}
      onNavigate={onNavigate}
      toPublicPath={pageNavigator.toPublic}
      toAdminPath={pageNavigator.toAdmin}
    />
  );

  return (
    <WorkspacePrototypePageShell
      locale={locale}
      currentPath={currentPath}
      onNavigate={onNavigate}
      sessionUser={sessionUser}
      onThemeModeChange={onThemeModeChange}
      onLocaleChange={onLocaleChange}
      onLogout={onLogout}
      activeMenuID={activeWorkspaceMenuID}
      sidebarGroups={sidebarGroups}
      sidebarTitle={text.sidebarMenuTitle}
      sidebarHint={text.sidebarMenuHint}
      mobileLayout={isMobileLayout}
      showSidebar={!isDashboardRoute}
      title={text.title}
      subtitle={text.subtitle}
      hideSummaryHeader
    >
      {content}
    </WorkspacePrototypePageShell>
  );
}
