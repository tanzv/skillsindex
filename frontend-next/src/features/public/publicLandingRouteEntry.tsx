import type { ReactElement } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";

import { loadPublicMarketplaceRoute } from "./publicMarketplaceRouteLoader";

export async function renderPublicLandingRoute(): Promise<ReactElement> {
  const result = await loadPublicMarketplaceRoute({
    fallbackScope: "public-landing-marketplace",
    fallbackContext: {
      route: "/"
    }
  });

  if (!result.ok) {
    return <ErrorState description={result.errorMessage} />;
  }

  const { PublicLanding } = await import("./PublicLanding");

  return <PublicLanding marketplace={result.marketplace} />;
}
