import type { ReactNode } from "react";

import { AdminShell } from "@/src/components/shared/AdminShell";
import { requireRouteSession } from "@/src/lib/auth/guards";
import { getServerSessionContext } from "@/src/lib/auth/session";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSessionContext();
  requireRouteSession(session, "/admin/overview");

  return <AdminShell session={session}>{children}</AdminShell>;
}
