import { ReactNode, useMemo } from "react";

import { SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import {
  buildWorkspaceSidebarNavigation,
  resolveWorkspaceSidebarGroupsByPanelMode,
  resolveWorkspaceSidebarPanelMode
} from "./WorkspaceCenterPage.navigation";
import { createPublicPageNavigator } from "./publicPageNavigation";
import WorkspacePrototypePageShell from "./WorkspacePrototypePageShell";

interface OrganizationManagementSubpageShellProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
  activeMenuID: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  children: ReactNode;
}

export default function OrganizationManagementSubpageShell({
  locale,
  currentPath,
  onNavigate,
  sessionUser,
  onThemeModeChange,
  onLocaleChange,
  onLogout,
  activeMenuID,
  title,
  subtitle,
  eyebrow,
  children
}: OrganizationManagementSubpageShellProps) {
  const workspaceText = useMemo(() => getWorkspaceCenterCopy(locale), [locale]);
  const pageNavigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);

  const topbarMenuGroups = useMemo(
    () =>
      buildWorkspaceSidebarNavigation({
        text: workspaceText,
        toPublicPath: pageNavigator.toPublic,
        toAdminPath: pageNavigator.toAdmin,
        sectionMode: "workspace-route"
      }),
    [pageNavigator.toAdmin, pageNavigator.toPublic, workspaceText]
  );
  const sidebarGroups = useMemo(() => {
    const panelMode = resolveWorkspaceSidebarPanelMode(currentPath);
    return resolveWorkspaceSidebarGroupsByPanelMode(topbarMenuGroups, panelMode);
  }, [currentPath, topbarMenuGroups]);

  return (
    <WorkspacePrototypePageShell
      locale={locale}
      currentPath={currentPath}
      onNavigate={onNavigate}
      sessionUser={sessionUser}
      onThemeModeChange={onThemeModeChange}
      onLocaleChange={onLocaleChange}
      onLogout={onLogout}
      activeMenuID={activeMenuID}
      sidebarGroups={sidebarGroups}
      topbarMenuGroups={topbarMenuGroups}
      sidebarTitle={workspaceText.sidebarOrganizationTitle}
      sidebarHint=""
      sidebarMode="secondary"
      hideSummaryHeader
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
    >
      {children}
    </WorkspacePrototypePageShell>
  );
}
