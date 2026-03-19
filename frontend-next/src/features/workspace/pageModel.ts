import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import { defaultPublicLocale, type PublicLocale } from "@/src/lib/i18n/publicLocale";
import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";
import type { SessionContext } from "@/src/lib/schemas/session";

import { resolveWorkspaceMessages } from "./messages";
import { buildSummaryMetrics } from "./pageMetrics";
import { buildRouteSections } from "./pageSections";
import { buildWorkspaceSnapshot } from "./snapshot";
import type { WorkspacePageModel, WorkspaceRoutePath } from "./types";
import { buildWorkspaceRouteMeta } from "./workspaceRouteMeta";

export function buildWorkspacePageModel(
  pathname: string,
  session: SessionContext,
  payload: PublicMarketplaceResponse = buildPublicMarketplaceFallback(),
  messageOverrides?: Partial<WorkspaceMessages>,
  locale: PublicLocale = defaultPublicLocale
): WorkspacePageModel {
  const messages = resolveWorkspaceMessages(messageOverrides);
  const routeMeta = buildWorkspaceRouteMeta(messages);
  const route = (routeMeta[pathname] ? pathname : "/workspace") as WorkspaceRoutePath;
  const snapshot = buildWorkspaceSnapshot(payload, session, messages, locale);
  const meta = routeMeta[route];
  const sections = buildRouteSections(session, snapshot, messages);

  return {
    locale,
    route,
    eyebrow: messages.pageEyebrow,
    title: meta.title,
    description: meta.description,
    messages,
    snapshot,
    summaryMetrics: buildSummaryMetrics(snapshot, session, messages),
    ...sections[route]
  };
}
