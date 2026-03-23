"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { ProtectedTopbarConfig } from "@/src/lib/navigation/protectedTopbarContracts";

import { resolveProtectedResponsivePrimaryVisibleCount } from "./protectedTopbarModel";

interface UseProtectedTopbarLayoutOptions {
  config: ProtectedTopbarConfig;
  defaultOverflowExpanded: boolean;
}

function resolveTopbarWindow(): (Window & typeof globalThis) | null {
  if (typeof window === "undefined" || typeof window.innerWidth !== "number") {
    return null;
  }
  return window;
}

function resolveProtectedNavigationToggleVisibility(viewportWidth: number | null) {
  if (viewportWidth === null) {
    return false;
  }
  return viewportWidth <= 1180;
}

function resolvePendingPrimaryVisibleCount(config: ProtectedTopbarConfig) {
  return Math.min(4, Math.max(2, config.entries.length));
}

function resolveRequiredPrimaryVisibleCount(config: ProtectedTopbarConfig) {
  return config.entries.length <= 3 ? config.entries.length : null;
}

const useSynchronizedLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useProtectedTopbarLayout({ config, defaultOverflowExpanded }: UseProtectedTopbarLayoutOptions) {
  const [isOverflowExpanded, setIsOverflowExpanded] = useState(defaultOverflowExpanded);
  const overflowScopeRef = useRef<HTMLDivElement | null>(null);
  const primaryNavigationRef = useRef<HTMLElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [primaryShellWidth, setPrimaryShellWidth] = useState<number | null>(null);
  const [hasMeasuredPrimaryNavigation, setHasMeasuredPrimaryNavigation] = useState(false);
  const pendingPrimaryVisibleCount = useMemo(() => resolvePendingPrimaryVisibleCount(config), [config]);
  const requiredPrimaryVisibleCount = useMemo(() => resolveRequiredPrimaryVisibleCount(config), [config]);
  const primaryVisibleCount = useMemo(() => {
    if (typeof requiredPrimaryVisibleCount === "number") {
      return requiredPrimaryVisibleCount;
    }

    return hasMeasuredPrimaryNavigation ? resolveProtectedResponsivePrimaryVisibleCount(primaryShellWidth) : pendingPrimaryVisibleCount;
  }, [hasMeasuredPrimaryNavigation, pendingPrimaryVisibleCount, primaryShellWidth, requiredPrimaryVisibleCount]);
  const showNavigationToggle = resolveProtectedNavigationToggleVisibility(viewportWidth);

  useEffect(() => {
    const browserWindow = resolveTopbarWindow();
    if (!browserWindow) {
      return;
    }

    const updateViewportWidth = () => {
      setViewportWidth((previousWidth) => (previousWidth === browserWindow.innerWidth ? previousWidth : browserWindow.innerWidth));
    };

    updateViewportWidth();
    browserWindow.addEventListener("resize", updateViewportWidth);
    return () => {
      browserWindow.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  useSynchronizedLayoutEffect(() => {
    const navigationElement = primaryNavigationRef.current;
    const browserWindow = resolveTopbarWindow();
    if (!navigationElement) {
      return;
    }

    let frameId: number | null = null;

    const commitPrimaryShellWidth = (nextWidth: number) => {
      setHasMeasuredPrimaryNavigation(true);
      setPrimaryShellWidth((previousWidth) => (previousWidth === nextWidth ? previousWidth : nextWidth));
    };

    const updatePrimaryShellWidth = () => {
      const nextWidth = Math.round(navigationElement.getBoundingClientRect().width);
      commitPrimaryShellWidth(nextWidth);
    };

    const schedulePrimaryShellWidthUpdate = () => {
      if (!browserWindow || typeof browserWindow.requestAnimationFrame !== "function") {
        updatePrimaryShellWidth();
        return;
      }

      if (frameId !== null) {
        browserWindow.cancelAnimationFrame(frameId);
      }

      frameId = browserWindow.requestAnimationFrame(() => {
        frameId = null;
        updatePrimaryShellWidth();
      });
    };

    schedulePrimaryShellWidthUpdate();

    if (!browserWindow || typeof ResizeObserver === "undefined") {
      browserWindow?.addEventListener("resize", schedulePrimaryShellWidthUpdate);
      return () => {
        if (frameId !== null) {
          browserWindow?.cancelAnimationFrame(frameId);
        }
        browserWindow?.removeEventListener("resize", schedulePrimaryShellWidthUpdate);
      };
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = Math.round(entries[0]?.contentRect.width || navigationElement.getBoundingClientRect().width);
      commitPrimaryShellWidth(nextWidth);
    });

    resizeObserver.observe(navigationElement);
    browserWindow.addEventListener("resize", schedulePrimaryShellWidthUpdate);
    return () => {
      if (frameId !== null) {
        browserWindow.cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();
      browserWindow.removeEventListener("resize", schedulePrimaryShellWidthUpdate);
    };
  }, [config.entries.length]);

  return {
    hasMeasuredPrimaryNavigation,
    isOverflowExpanded,
    overflowScopeRef,
    primaryNavigationRef,
    primaryVisibleCount,
    setIsOverflowExpanded,
    showNavigationToggle
  };
}
