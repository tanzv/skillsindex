"use client";

import { useEffect } from "react";

import { shouldDisableBatchSkillWarmup } from "./publicSkillWarmupPolicy";
import { warmPublicSkillBatchRoutes } from "./publicSkillBatchWarmup";

type IdleCapableWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

type WarmupCapableNavigator = Navigator & {
  connection?: {
    effectiveType?: string;
    saveData?: boolean;
  };
  deviceMemory?: number;
};

const completedPublicSkillWarmups = new Set<string>();

export function usePublicSkillBatchWarmup(routes: string[]) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || routes.length === 0) {
      return;
    }

    const warmupNavigator = navigator as WarmupCapableNavigator;
    if (shouldDisableBatchSkillWarmup({
      connection: warmupNavigator.connection,
      deviceMemory: warmupNavigator.deviceMemory,
      hardwareConcurrency: warmupNavigator.hardwareConcurrency
    })) {
      return;
    }

    const warmupKey = routes.join("|");
    if (!warmupKey || completedPublicSkillWarmups.has(warmupKey)) {
      return;
    }

    let canceled = false;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    let idleHandle: number | null = null;

    const executeWarmup = () => {
      if (canceled || completedPublicSkillWarmups.has(warmupKey)) {
        return;
      }

      completedPublicSkillWarmups.add(warmupKey);
      void warmPublicSkillBatchRoutes(window.fetch.bind(window), routes);
    };

    const idleWindow = window as IdleCapableWindow;
    if (typeof idleWindow.requestIdleCallback === "function") {
      idleHandle = idleWindow.requestIdleCallback(() => {
        executeWarmup();
      }, { timeout: 1800 });
    } else {
      timeoutHandle = setTimeout(executeWarmup, 800);
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
  }, [routes]);
}
