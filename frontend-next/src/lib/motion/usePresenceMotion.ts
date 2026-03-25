"use client";

import { useEffect, useState } from "react";

import { type MotionPresenceState } from "./contracts";

interface UsePresenceMotionOptions {
  open: boolean;
  reducedMotion: boolean;
  exitDurationMs: number;
}

interface UsePresenceMotionResult {
  isPresent: boolean;
  motionState: MotionPresenceState;
}

export function usePresenceMotion({
  open,
  reducedMotion,
  exitDurationMs
}: UsePresenceMotionOptions): UsePresenceMotionResult {
  const [isPresent, setIsPresent] = useState(open);
  const [motionState, setMotionState] = useState<MotionPresenceState>(open ? "open" : "closing");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (open) {
      if (isPresent && motionState === "open") {
        return;
      }

      const animationFrameId = window.requestAnimationFrame(() => {
        setIsPresent(true);
        setMotionState("open");
      });

      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    }

    if (!isPresent) {
      return;
    }

    if (reducedMotion) {
      const animationFrameId = window.requestAnimationFrame(() => {
        setIsPresent(false);
      });

      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      setMotionState("closing");
    });

    const timeoutId = window.setTimeout(() => {
      setIsPresent(false);
    }, exitDurationMs);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(timeoutId);
    };
  }, [exitDurationMs, isPresent, motionState, open, reducedMotion]);

  return { isPresent, motionState };
}
