import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import { defaultPublicLocale, type PublicLocale } from "@/src/lib/i18n/publicLocale";
import { buildWorkspaceRouteMeta, resolveWorkspaceRoute } from "@/src/lib/routing/workspaceRouteMeta";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";
import type { SessionContext } from "@/src/lib/schemas/session";

import { resolveWorkspaceMessages } from "./messages";
import { buildSummaryMetrics } from "./pageMetrics";
import { resolveRouteSections } from "./pageSections";
import { buildWorkspaceSnapshot } from "./snapshot";
import type { WorkspacePageModel, WorkspaceRoutePath } from "./types";

export function buildWorkspacePageModel(
  pathname: string,
  session: SessionContext,
  payload: PublicMarketplaceResponse,
  messageOverrides?: Partial<WorkspaceMessages>,
  locale: PublicLocale = defaultPublicLocale
): WorkspacePageModel {
  const messages = resolveWorkspaceMessages(messageOverrides);
  const routeMeta = buildWorkspaceRouteMeta(messages);
  const route = resolveWorkspaceRoute(pathname) as WorkspaceRoutePath;
  const snapshot = buildWorkspaceSnapshot(payload, session, messages, locale);
  const meta = routeMeta[route];
  const sections = resolveRouteSections(route, session, snapshot, messages);

  return {
    locale,
    route,
    eyebrow: messages.pageEyebrow,
    title: meta.title,
    description: meta.description,
    messages,
    snapshot,
    summaryMetrics: buildSummaryMetrics(snapshot, session, messages),
    ...sections
  };
}
