"use client";

import Link from "next/link";
import { useEffect, useRef, type ComponentProps } from "react";

import { buildPublicLinkTarget, splitPublicPathPrefix } from "@/src/lib/routing/publicCompat";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";

import { resolvePublicSkillWarmupTarget, warmPublicSkillRoute } from "./publicSkillRouteWarmup";

type PublicLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  warmOnViewport?: boolean;
};

export function PublicLink({ href, onFocus, onMouseEnter, onTouchStart, warmOnViewport = false, ...props }: PublicLinkProps) {
  const { prefix } = usePublicRouteState();
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const browserPrefix =
    typeof window !== "undefined" ? splitPublicPathPrefix(window.location.pathname || "/").prefix : prefix;
  const target = buildPublicLinkTarget(browserPrefix || prefix, href);
  const warmupTarget = resolvePublicSkillWarmupTarget(
    target.href,
    typeof target.as === "string" ? target.as : undefined
  );
  const shouldObserveViewportWarmup = warmOnViewport && Boolean(warmupTarget);

  useEffect(() => {
    if (!shouldObserveViewportWarmup || typeof window === "undefined" || typeof window.IntersectionObserver !== "function") {
      return;
    }

    const currentLink = linkRef.current;
    if (!currentLink || !warmupTarget) {
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        observer.disconnect();
        void warmPublicSkillRoute(window.fetch.bind(window), warmupTarget);
      },
      {
        rootMargin: "240px 0px"
      }
    );

    observer.observe(currentLink);
    return () => {
      observer.disconnect();
    };
  }, [shouldObserveViewportWarmup, warmupTarget]);

  function handleWarmup() {
    if (!warmupTarget || typeof window === "undefined") {
      return;
    }

    void warmPublicSkillRoute(window.fetch.bind(window), warmupTarget);
  }

  return (
    <Link
      {...props}
      href={target.href}
      as={target.as}
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
