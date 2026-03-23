import type { ReactElement } from "react";

import type { AccountRoute } from "@/src/lib/routing/routes";

export async function renderAccountRoute(route: AccountRoute): Promise<ReactElement> {
  const { AccountCenterPage } = await import("./AccountCenterPage");
  return <AccountCenterPage route={route} />;
}
