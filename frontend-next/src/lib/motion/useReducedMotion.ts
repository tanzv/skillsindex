"use client";

import { useEffect, useState } from "react";

import { REDUCED_MOTION_MEDIA_QUERY } from "./contracts";

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY);
    const animationFrameId = window.requestAnimationFrame(() => {
      setPrefersReducedMotion(mediaQueryList.matches);
    });

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQueryList.addEventListener("change", handleChange);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
