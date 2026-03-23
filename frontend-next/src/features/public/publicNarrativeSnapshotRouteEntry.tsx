import type { ReactElement } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import {
  resolvePublicNarrativeRouteDescriptorById,
  type PublicNarrativeRouteId
} from "@/src/lib/navigation/publicNavigationRegistry";
import type { PublicMarketplaceResponse } from "@/src/lib/schemas/public";

import { loadPublicMarketplaceSnapshotFromRequest, type PublicSnapshotSearchParams } from "./publicNarrativeSnapshotLoader.server";
import type { PublicProgramPageKey } from "./publicProgramModel";

export interface PublicNarrativeSnapshotRouteProps {
  searchParams: Promise<PublicSnapshotSearchParams>;
}

type PublicNarrativeSnapshotRouteId = Exclude<PublicNarrativeRouteId, "states">;

const narrativeSnapshotPageKeys: Record<Exclude<PublicNarrativeSnapshotRouteId, "docs">, PublicProgramPageKey> = {
  about: "about",
  governance: "governance",
  rollout: "rollout",
  timeline: "timeline"
};

async function renderNarrativeSnapshotPage(
  routeId: PublicNarrativeSnapshotRouteId,
  marketplace: PublicMarketplaceResponse
): Promise<ReactElement> {
  if (routeId === "docs") {
    const { PublicDocsPage } = await import("./PublicDocsPage");
    return <PublicDocsPage marketplace={marketplace} />;
  }

  const { PublicProgramPage } = await import("./PublicProgramPage");
  return <PublicProgramPage pageKey={narrativeSnapshotPageKeys[routeId]} marketplace={marketplace} />;
}

export async function renderPublicNarrativeSnapshotRoute(
  routeId: PublicNarrativeSnapshotRouteId,
  searchParams: Promise<PublicSnapshotSearchParams>
): Promise<ReactElement> {
  const routeDescriptor = resolvePublicNarrativeRouteDescriptorById(routeId);

  if (!routeDescriptor || routeDescriptor.id === "states") {
    throw new Error(`Unsupported public narrative snapshot route: ${routeId}`);
  }

  const result = await loadPublicMarketplaceSnapshotFromRequest(searchParams);
  if (!result.ok) {
    return <ErrorState description={result.errorMessage} />;
  }

  return await renderNarrativeSnapshotPage(routeId, result.marketplace);
}
