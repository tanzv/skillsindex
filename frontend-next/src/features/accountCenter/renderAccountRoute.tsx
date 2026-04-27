import type { ReactElement } from "react";

import type { AccountRoute } from "@/src/lib/routing/routes";

let accountCenterPageModulePromise:
  | Promise<typeof import("./AccountCenterPage")>
  | null = null;

function loadAccountCenterPageModule() {
  if (!accountCenterPageModulePromise) {
    accountCenterPageModulePromise = (async () => await import("./AccountCenterPage"))();
  }

  return accountCenterPageModulePromise;
}

export async function renderAccountRoute(route: AccountRoute): Promise<ReactElement> {
  const { AccountCenterPage } = await loadAccountCenterPageModule();
  return <AccountCenterPage route={route} />;
}
