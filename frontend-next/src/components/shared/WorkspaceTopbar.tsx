import type { SessionContext } from "@/src/lib/schemas/session";

import { workspaceProtectedTopbarConfig } from "./protectedTopbarConfigs";
import { ProtectedTopbar } from "./ProtectedTopbar";

export interface WorkspaceTopbarProps {
  pathname: string;
  session: SessionContext;
  brandTitle: string;
  brandSubtitle: string;
  defaultOverflowExpanded?: boolean;
}

export function WorkspaceTopbar({
  pathname,
  session,
  brandTitle,
  brandSubtitle,
  defaultOverflowExpanded = false
}: WorkspaceTopbarProps) {
  return (
    <ProtectedTopbar
      pathname={pathname}
      session={session}
      brandTitle={brandTitle}
      brandSubtitle={brandSubtitle}
      brandHref="/workspace"
      config={workspaceProtectedTopbarConfig}
      dataTestId="workspace-topbar"
      navigationAriaLabel="Workspace top navigation"
      defaultOverflowExpanded={defaultOverflowExpanded}
    />
  );
}
