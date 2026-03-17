import { useEffect, useMemo, useState } from "react";

import type { SessionUser } from "../../lib/api";
import type { AppLocale } from "../../lib/i18n";
import type { ThemeMode } from "../../lib/themeModePath";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import {
  buildWorkspaceSidebarNavigation,
  resolveWorkspaceSectionMenuItemID,
  resolveWorkspaceSectionPage
} from "./WorkspaceCenterPage.navigation";
import WorkspaceCenterRoutePage from "./WorkspaceCenterRoutePage";
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
  const pageNavigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const activeWorkspaceMenuID = useMemo(() => resolveWorkspaceSectionMenuItemID(currentPath), [currentPath]);
  const activeSectionPage = useMemo(() => resolveWorkspaceSectionPage(currentPath), [currentPath]);
  const [viewport, setViewport] = useState<WorkspaceViewportSnapshot>(() => resolveInitialViewport());

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
      mobileLayout={isMobileLayout}
      showSidebar={!isDashboardRoute}
      title={text.title}
      subtitle={text.subtitle}
      hideSummaryHeader
    >
      <WorkspaceCenterRoutePage
        locale={locale}
        currentPath={currentPath}
        onNavigate={onNavigate}
        sessionUser={sessionUser}
      />
    </WorkspacePrototypePageShell>
  );
}
