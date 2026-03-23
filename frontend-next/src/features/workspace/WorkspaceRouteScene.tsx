"use client";

import { useMemo } from "react";

import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";
import type { SessionContext } from "@/src/lib/schemas/session";

import { buildWorkspacePageModel } from "./pageModel";
import { WorkspaceRoutePage } from "./WorkspaceRoutePage";
import type { WorkspaceRoutePath } from "./types";

interface WorkspaceRouteSceneProps {
  pathname: WorkspaceRoutePath;
  session: SessionContext;
  payload: PublicMarketplaceResponse;
}

export function WorkspaceRouteScene({
  pathname,
  session,
  payload
}: WorkspaceRouteSceneProps) {
  const { locale, messages } = useProtectedI18n();
  const model = useMemo(
    () => buildWorkspacePageModel(pathname, session, payload, messages.workspace, locale),
    [locale, messages.workspace, pathname, payload, session]
  );

  return <WorkspaceRoutePage model={model} />;
}
