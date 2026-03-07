import type { CSSProperties } from "react";

export const rankingPanelStyle: CSSProperties = {
  background: "color-mix(in srgb, var(--si-color-panel) 82%, transparent)",
  border: "none",
  boxShadow: "none",
  backdropFilter: "blur(10px) saturate(120%)"
};

export const rankingSectionCardStyle: CSSProperties = {
  border: "none",
  background: "color-mix(in srgb, var(--si-color-surface) 74%, transparent)",
  boxShadow: "none"
};

export const rankingRowCardStyle: CSSProperties = {
  border: "none",
  background: "color-mix(in srgb, var(--si-color-surface) 68%, transparent)",
  boxShadow: "none"
};

export const rankingMetricTagStyle: CSSProperties = {
  border: "none",
  background: "color-mix(in srgb, var(--si-color-muted-surface) 70%, transparent)",
  color: "var(--si-color-text-secondary)",
  marginInlineEnd: 0
};

export const rankingValueTagStyle: CSSProperties = {
  border: "none",
  background: "color-mix(in srgb, var(--si-color-surface) 66%, transparent)",
  color: "var(--si-color-text-primary)",
  marginInlineEnd: 0
};

export const rankingDefaultRankTagStyle: CSSProperties = {
  border: "none",
  background: "color-mix(in srgb, var(--si-color-muted-surface) 78%, transparent)",
  color: "var(--si-color-text-primary)",
  marginInlineEnd: 0,
  fontWeight: 700
};

export const rankingTopRankTagStyle: CSSProperties = {
  border: "none",
  background: "color-mix(in srgb, var(--si-color-accent) 88%, transparent)",
  color: "var(--si-color-accent-contrast)",
  marginInlineEnd: 0,
  fontWeight: 700
};
