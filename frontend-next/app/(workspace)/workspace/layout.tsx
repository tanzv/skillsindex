import type { ReactNode } from "react";

import { WorkspaceShell } from "@/src/components/shared/WorkspaceShell";
import { requireRouteSession } from "@/src/lib/auth/guards";
import { getServerSessionContext } from "@/src/lib/auth/session";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default async function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const session = await getServerSessionContext();
  requireRouteSession(session, "/workspace");

  return <WorkspaceShell session={session}>{children}</WorkspaceShell>;
}
