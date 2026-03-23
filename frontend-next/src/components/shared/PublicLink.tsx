"use client";

import Link from "next/link";
import { useEffect, useRef, type ComponentProps } from "react";

import { shouldEnablePublicSkillViewportWarmupForEnvironment } from "@/src/lib/marketplace/publicSkillWarmupPolicy";
import { buildPublicLinkTarget, splitPublicPathPrefix } from "@/src/lib/routing/publicCompat";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";

type PublicLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  warmOnViewport?: boolean;
};

type PublicSkillRouteWarmupModule = typeof import("./publicSkillRouteWarmup");

let publicSkillRouteWarmupModulePromise: Promise<PublicSkillRouteWarmupModule> | null = null;

function loadPublicSkillRouteWarmupModule(): Promise<PublicSkillRouteWarmupModule> {
  if (!publicSkillRouteWarmupModulePromise) {
    publicSkillRouteWarmupModulePromise = import("./publicSkillRouteWarmup");
  }

  return publicSkillRouteWarmupModulePromise;
}

async function resolvePublicLinkWarmupTarget(href: string, as?: string): Promise<string | null> {
  const { resolvePublicSkillWarmupTarget } = await loadPublicSkillRouteWarmupModule();
  return resolvePublicSkillWarmupTarget(href, as);
}

async function warmResolvedPublicLinkRoute(route: string | null): Promise<void> {
  if (!route || typeof window === "undefined") {
    return;
  }

  const { warmPublicSkillRoute } = await loadPublicSkillRouteWarmupModule();
  await warmPublicSkillRoute(window.fetch.bind(window), route);
}

export function PublicLink({
  href,
  onFocus,
  onMouseEnter,
  onTouchStart,
  prefetch,
  warmOnViewport = false,
  ...props
}: PublicLinkProps) {
  const { prefix } = usePublicRouteState();
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const enableViewportWarmup = shouldEnablePublicSkillViewportWarmupForEnvironment(process.env.NODE_ENV);
  const browserPrefix =
    typeof window !== "undefined" ? splitPublicPathPrefix(window.location.pathname || "/").prefix : prefix;
  const target = buildPublicLinkTarget(browserPrefix || prefix, href);
  const targetAs = typeof target.as === "string" ? target.as : undefined;

  useEffect(() => {
    if (
      !warmOnViewport ||
      !enableViewportWarmup ||
      typeof window === "undefined" ||
      typeof window.IntersectionObserver !== "function"
    ) {
      return;
    }

    const currentLink = linkRef.current;
    if (!currentLink) {
      return;
    }

    let canceled = false;
    let observer: IntersectionObserver | null = null;

    void resolvePublicLinkWarmupTarget(target.href, targetAs).then((warmupTarget) => {
      if (canceled || !warmupTarget) {
        return;
      }

      observer = new window.IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) {
            return;
          }

          observer?.disconnect();
          void warmResolvedPublicLinkRoute(warmupTarget);
        },
        {
          rootMargin: "240px 0px"
        }
      );

      observer.observe(currentLink);
    });

    return () => {
      canceled = true;
      observer?.disconnect();
    };
  }, [enableViewportWarmup, target.href, targetAs, warmOnViewport]);

  function handleWarmup() {
    if (typeof window === "undefined") {
      return;
    }

    void resolvePublicLinkWarmupTarget(target.href, targetAs).then((warmupTarget) => {
      void warmResolvedPublicLinkRoute(warmupTarget);
    });
  }

  return (
    <Link
      {...props}
      href={target.href}
      as={target.as}
      prefetch={prefetch ?? false}
      ref={linkRef}
      onFocus={(event) => {
        onFocus?.(event);
        handleWarmup();
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        handleWarmup();
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        handleWarmup();
      }}
    />
  );
}
