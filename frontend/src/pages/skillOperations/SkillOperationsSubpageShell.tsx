import { ReactNode, useMemo } from "react";

import type { SessionUser } from "../../lib/api";
import type { AppLocale } from "../../lib/i18n";
import type { ThemeMode } from "../../lib/themeModePath";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import { getWorkspaceCenterCopy } from "../workspace/WorkspaceCenterPage.copy";
import { buildWorkspaceSidebarNavigation } from "../workspace/WorkspaceCenterPage.navigation";
import WorkspacePrototypePageShell from "../workspace/WorkspacePrototypePageShell";
import { resolveSkillOperationsActiveMenuID, resolveSkillOperationsSidebarGroups } from "./SkillOperationsPage.helpers";

interface SkillOperationsSubpageShellProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser?: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
  title: string;
  subtitle: string;
  eyebrow: string;
  children: ReactNode;
}

export default function SkillOperationsSubpageShell({
  locale,
  currentPath,
  onNavigate,
  sessionUser,
  onThemeModeChange,
  onLocaleChange,
  onLogout,
  title,
  subtitle,
  eyebrow,
  children
}: SkillOperationsSubpageShellProps) {
  const workspaceText = useMemo(() => getWorkspaceCenterCopy(locale), [locale]);
  const pageNavigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const activeMenuID = useMemo(() => resolveSkillOperationsActiveMenuID(currentPath), [currentPath]);

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
  const sidebarGroups = useMemo(() => resolveSkillOperationsSidebarGroups(topbarMenuGroups), [topbarMenuGroups]);

  return (
    <WorkspacePrototypePageShell
      locale={locale}
      currentPath={currentPath}
      onNavigate={onNavigate}
      sessionUser={sessionUser || null}
      onThemeModeChange={onThemeModeChange}
      onLocaleChange={onLocaleChange}
      onLogout={onLogout}
      activeMenuID={activeMenuID}
      sidebarGroups={sidebarGroups}
      topbarMenuGroups={topbarMenuGroups}
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
