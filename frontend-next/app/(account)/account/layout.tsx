import type { ReactNode } from "react";

import { AccountShell } from "@/src/components/shared/AccountShell";
import { requireRouteSession } from "@/src/lib/auth/guards";
import { getServerSessionContext } from "@/src/lib/auth/session";

interface AccountLayoutProps {
  children: ReactNode;
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await getServerSessionContext();
  requireRouteSession(session, "/account/profile");

  return <AccountShell session={session}>{children}</AccountShell>;
}
