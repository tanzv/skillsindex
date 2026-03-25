import type { CSSProperties } from "react";

import { MOTION_DELAY_MS } from "./contracts";

interface CreateMotionDelayStyleOptions {
  cssVariableName?: `--${string}`;
}

interface CreateStaggerMotionStyleOptions extends CreateMotionDelayStyleOptions {
  baseDelayMs?: number;
  stepDelayMs?: number;
}

export function formatMotionTimeMs(value: number): string {
  return `${Math.max(0, Math.round(value))}ms`;
}

export function createMotionDelayStyle(
  delayMs: number,
  { cssVariableName = "--motion-delay" }: CreateMotionDelayStyleOptions = {}
): CSSProperties {
  return {
    [cssVariableName]: formatMotionTimeMs(delayMs)
  } as CSSProperties;
}

export function createStaggerMotionStyle(
  index: number,
  {
    baseDelayMs = MOTION_DELAY_MS.none,
    stepDelayMs = MOTION_DELAY_MS.staggerStep,
    cssVariableName = "--motion-delay"
  }: CreateStaggerMotionStyleOptions = {}
): CSSProperties {
  const resolvedIndex = Math.max(0, index);
  const resolvedDelayMs = baseDelayMs + resolvedIndex * stepDelayMs;

  return createMotionDelayStyle(resolvedDelayMs, { cssVariableName });
}
