import "server-only";

import { headers } from "next/headers";

import type { SessionContext } from "@/src/lib/schemas/session";
import { loadProtectedPageMessages } from "@/src/lib/i18n/protectedPageMessages.server";
import { resolveServerLocale } from "@/src/lib/i18n/serverLocale";
import { resolveWorkspaceRoute } from "@/src/lib/routing/workspaceRouteMeta";

import { buildWorkspacePageModel } from "./pageModel";
import { loadWorkspaceRouteData } from "./workspaceRouteDataLoader";

export async function loadWorkspaceRouteModel(pathname: string, session: SessionContext) {
  const locale = await resolveServerLocale();
  const pageMessages = await loadProtectedPageMessages(locale);
  const route = resolveWorkspaceRoute(pathname);
  const requestHeaders = new Headers(await headers());
  const payload = await loadWorkspaceRouteData(route, requestHeaders);

  return buildWorkspacePageModel(
    route,
    session,
    payload,
    pageMessages.workspace,
    locale
  );
}
