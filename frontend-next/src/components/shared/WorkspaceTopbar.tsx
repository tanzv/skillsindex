import type { SessionContext } from "@/src/lib/schemas/session";
import type { ProtectedTopbarMessages } from "@/src/lib/i18n/protectedMessages";
import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";

import { buildAccountCenterMenuConfig, buildWorkspaceProtectedTopbarConfig } from "./protectedTopbarConfigs";
import { ProtectedTopbar } from "./ProtectedTopbar";

export interface WorkspaceTopbarProps {
  pathname: string;
  session: SessionContext;
  brandTitle: string;
  brandSubtitle: string;
  messages: ProtectedTopbarMessages;
  workspaceMessages: WorkspaceMessages;
  theme: "light" | "dark";
  onThemeChange: (nextTheme: "light" | "dark") => void;
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
  theme,
  onThemeChange,
  defaultOverflowExpanded = false,
  onOpenNavigation,
  navigationToggleLabel,
  navigationToggleTestId,
  navigationToggleControlsId,
  navigationToggleExpanded
}: WorkspaceTopbarProps) {
  return (
    <ProtectedTopbar
      pathname={pathname}
      session={session}
      brandTitle={brandTitle}
      brandSubtitle={brandSubtitle}
      brandHref="/workspace"
      config={buildWorkspaceProtectedTopbarConfig(workspaceMessages, messages)}
      accountCenterMenu={buildAccountCenterMenuConfig(messages)}
      dataTestId="workspace-topbar"
      navigationAriaLabel={messages.navigationAriaLabelWorkspace}
      messages={messages}
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
