import type { SessionContext } from "@/src/lib/schemas/session";
import {
  adminNavigationMessageFallbacks,
  type AdminNavigationMessages,
  type ProtectedTopbarMessages,
  type WorkspaceShellMessages
} from "@/src/lib/i18n/protectedMessages";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import { marketplaceHomeRoute, workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import {
  buildWorkspaceShellNavigationRegistry,
  buildProtectedTopbarConfigFromRegistry
} from "@/src/lib/navigation/protectedNavigationRegistry";

import { buildAccountCenterMenuConfig } from "./protectedTopbarConfigs";
import { ProtectedTopbar } from "./ProtectedTopbar";

export interface WorkspaceTopbarProps {
  pathname: string;
  session: SessionContext;
  brandTitle: string;
  brandSubtitle: string;
  messages: ProtectedTopbarMessages;
  workspaceMessages: WorkspaceMessages;
  navigationMessages?: AdminNavigationMessages;
  workspaceShellMessages?: WorkspaceShellMessages;
  theme: "light" | "dark";
  onThemeChange: (nextTheme: "light" | "dark") => void;
  accountMenuTriggerVariant?: "pill" | "avatar";
  defaultOverflowExpanded?: boolean;
  onOpenNavigation?: () => void;
  navigationToggleLabel?: string;
  navigationToggleTestId?: string;
  navigationToggleControlsId?: string;
  navigationToggleExpanded?: boolean;
}

export function WorkspaceTopbar({
  pathname,
  session,
  brandTitle,
  brandSubtitle,
  messages,
  workspaceMessages,
  navigationMessages = adminNavigationMessageFallbacks,
  workspaceShellMessages,
  theme,
  onThemeChange,
  accountMenuTriggerVariant,
  defaultOverflowExpanded = false,
  onOpenNavigation,
  navigationToggleLabel,
  navigationToggleTestId,
  navigationToggleControlsId,
  navigationToggleExpanded
}: WorkspaceTopbarProps) {
  const registry = buildWorkspaceShellNavigationRegistry({
    adminNavigation: navigationMessages,
    workspacePage: workspaceMessages,
    workspaceShell: workspaceShellMessages
  });

  return (
    <ProtectedTopbar
      pathname={pathname}
      session={session}
      brandTitle={brandTitle}
      brandSubtitle={brandSubtitle}
      brandHref={workspaceOverviewRoute}
      config={buildProtectedTopbarConfigFromRegistry(
        pathname,
        registry,
        {
          primaryGroupLabel: workspaceMessages.topbarPrimaryGroupLabel,
          primaryGroupTag: workspaceMessages.topbarPrimaryGroupTag,
          overflowTitle: workspaceMessages.topbarOverflowTitle,
          overflowHint: workspaceMessages.topbarOverflowHint,
          overflowPrimaryTitle: workspaceMessages.topbarOverflowAppSectionsTitle
        },
        messages
      )}
      accountCenterMenu={buildAccountCenterMenuConfig(messages)}
      dataTestId="workspace-topbar"
      navigationAriaLabel={messages.navigationAriaLabelWorkspace}
      messages={messages}
      utilityLink={{ href: marketplaceHomeRoute, label: messages.marketplaceLinkLabel }}
      accountMenuTriggerVariant={accountMenuTriggerVariant ?? "avatar"}
      theme={theme}
      onThemeChange={onThemeChange}
      defaultOverflowExpanded={defaultOverflowExpanded}
      onOpenNavigation={onOpenNavigation}
      navigationToggleLabel={navigationToggleLabel}
      navigationToggleTestId={navigationToggleTestId}
      navigationToggleControlsId={navigationToggleControlsId}
      navigationToggleExpanded={navigationToggleExpanded}
    />
  );
}
