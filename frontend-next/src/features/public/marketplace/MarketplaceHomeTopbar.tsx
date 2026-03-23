"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { PublicLink } from "@/src/components/shared/PublicLink";
import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicViewerSession } from "@/src/features/public/PublicViewerSessionProvider";
import { usePublicLoginTarget } from "@/src/lib/auth/usePublicLoginTarget";
import { workspaceOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { publicLoginRoute } from "@/src/lib/routing/publicRouteRegistry";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";

import {
  buildPublicMarketplaceWarmupTargets,
  prefetchPublicMarketplaceRoutes,
  shouldWarmPublicMarketplaceRoutesInDev,
  warmPublicMarketplaceRoutes
} from "./publicRouteWarmup";
import { MarketplaceTopbarIconControls } from "./MarketplaceTopbarPrimitives";

type IdleCapableWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const completedMarketplaceWarmupSignatures = new Set<string>();

function useOptionalRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
}

export function MarketplaceHomeTopbarActions() {
  const router = useOptionalRouter();
  const { messages } = usePublicI18n();
  const { toPublicPath } = usePublicRouteState();
  const { isAuthenticated } = usePublicViewerSession();
  const loginTarget = usePublicLoginTarget();
  const authenticationHref = isAuthenticated ? workspaceOverviewRoute : loginTarget.as || loginTarget.href;
  const authenticationWarmupRoute = isAuthenticated ? workspaceOverviewRoute : toPublicPath(publicLoginRoute);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !shouldWarmPublicMarketplaceRoutesInDev()) {
      return;
    }

    const warmupTargets = buildPublicMarketplaceWarmupTargets(toPublicPath, authenticationWarmupRoute);
    if (warmupTargets.length === 0) {
      return;
    }

    const warmupSignature = warmupTargets.join("|");
    if (completedMarketplaceWarmupSignatures.has(warmupSignature)) {
      return;
    }

    let canceled = false;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    let idleHandle: number | null = null;

    const executeWarmup = () => {
      if (canceled || completedMarketplaceWarmupSignatures.has(warmupSignature)) {
        return;
      }

      completedMarketplaceWarmupSignatures.add(warmupSignature);
      if (router) {
        prefetchPublicMarketplaceRoutes(router.prefetch.bind(router), warmupTargets);
      }
      void warmPublicMarketplaceRoutes(fetch, warmupTargets);
    };

    const idleWindow = window as IdleCapableWindow;

    if (typeof idleWindow.requestIdleCallback === "function") {
      idleHandle = idleWindow.requestIdleCallback(() => {
        executeWarmup();
      }, { timeout: 1200 });
    } else {
      timeoutHandle = setTimeout(executeWarmup, 500);
    }

    return () => {
      canceled = true;

      if (idleHandle !== null && typeof idleWindow.cancelIdleCallback === "function") {
        idleWindow.cancelIdleCallback(idleHandle);
      }

      if (timeoutHandle !== null) {
        clearTimeout(timeoutHandle);
      }
    };
  }, [authenticationWarmupRoute, router, toPublicPath]);

  return (
    <div
      className="marketplace-topbar-actions marketplace-home-topbar-actions"
      data-marketplace-topbar-slot="actions"
      data-marketplace-topbar-variant="landing"
    >
      <div className="marketplace-home-auth-cluster" data-testid="landing-topbar-auth-cluster">
        <span className="marketplace-home-topbar-status" data-testid="landing-topbar-status">
          {isAuthenticated ? messages.shellSignedIn : messages.shellSignedOut}
        </span>

        <PublicLink href={authenticationHref} className="marketplace-home-pill-button is-primary">
          {isAuthenticated ? messages.shellWorkspace : messages.shellSignIn}
        </PublicLink>
      </div>

      <MarketplaceTopbarIconControls />
    </div>
  );
}
