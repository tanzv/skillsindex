import type { ReactElement } from "react";

import { notFound } from "next/navigation";

import { isSupportedPublicStateRoute } from "./publicStateModel";

export interface PublicStateRouteEntryProps {
  params: Promise<{
    state: string;
  }>;
}

export async function renderPublicStateRoute(params: PublicStateRouteEntryProps["params"]): Promise<ReactElement> {
  const { state } = await params;

  if (!isSupportedPublicStateRoute(state)) {
    notFound();
  }

  const { PublicStatePage } = await import("./PublicStatePage");
  return <PublicStatePage state={state} />;
}
