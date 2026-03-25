export const MOTION_DURATION_MS = {
  fast: 160,
  medium: 220,
  slow: 420,
  enter: 720,
  ambient: 10000,
  ambientSlow: 16000,
  loadingLoop: 1200,
  loadingSpin: 2200
} as const;

export const MOTION_DELAY_MS = {
  none: 0,
  xs: 120,
  sm: 140,
  md: 160,
  lg: 180,
  xl: 260,
  staggerStep: 80
} as const;

export const MOTION_EXIT_DURATION_MS = MOTION_DURATION_MS.medium;

export const MOTION_DELAY_TOKENS = {
  none: "var(--motion-delay-none)",
  xs: "var(--motion-delay-xs)",
  sm: "var(--motion-delay-sm)",
  md: "var(--motion-delay-md)",
  lg: "var(--motion-delay-lg)",
  xl: "var(--motion-delay-xl)",
  staggerStep: "var(--motion-delay-stagger-step)"
} as const;

export const MOTION_EASING_TOKENS = {
  standard: "var(--motion-ease-standard)",
  emphasized: "var(--motion-ease-emphasized)",
  linear: "var(--motion-ease-linear)"
} as const;

export const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

export type MotionPresenceState = "open" | "closing";
