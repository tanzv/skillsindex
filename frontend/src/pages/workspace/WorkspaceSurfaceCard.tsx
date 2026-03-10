import { Card } from "antd";
import type { CSSProperties, ReactNode } from "react";

export type WorkspaceSurfaceTone = "hero" | "metric" | "panel" | "quick";

const surfaceStyleByTone: Record<WorkspaceSurfaceTone, CSSProperties> = {
  hero: {
    borderRadius: 18,
    border: "1px solid color-mix(in srgb, var(--si-color-accent) 28%, var(--si-color-border-soft))",
    background:
      "linear-gradient(154deg, color-mix(in srgb, var(--si-color-accent) 22%, transparent) 0%, transparent 58%), color-mix(in srgb, var(--si-color-panel) 88%, transparent)",
    boxShadow: "0 18px 38px color-mix(in srgb, #05080f 62%, transparent)",
    backdropFilter: "blur(10px)"
  },
  metric: {
    borderRadius: 13,
    border: "1px solid color-mix(in srgb, var(--si-color-border) 74%, transparent)",
    background:
      "linear-gradient(150deg, color-mix(in srgb, var(--si-color-accent) 12%, transparent) 0%, transparent 64%), color-mix(in srgb, var(--si-color-surface) 82%, transparent)",
    boxShadow: "0 10px 20px color-mix(in srgb, #05080f 35%, transparent)",
    backdropFilter: "blur(8px)"
  },
  panel: {
    borderRadius: 14,
    border: "1px solid color-mix(in srgb, var(--si-color-border) 78%, transparent)",
    background:
      "linear-gradient(160deg, color-mix(in srgb, var(--si-color-accent) 8%, transparent) 0%, transparent 66%), color-mix(in srgb, var(--si-color-surface) 84%, transparent)",
    boxShadow: "0 12px 28px color-mix(in srgb, #070b13 36%, transparent)",
    backdropFilter: "blur(8px)"
  },
  quick: {
    borderRadius: 14,
    border: "1px solid color-mix(in srgb, var(--si-color-accent) 38%, transparent)",
    background:
      "linear-gradient(165deg, color-mix(in srgb, var(--si-color-accent) 70%, transparent) 0%, color-mix(in srgb, var(--si-color-accent) 52%, var(--si-color-panel)) 100%)",
    boxShadow: "0 14px 30px color-mix(in srgb, var(--si-color-accent) 30%, transparent)"
  }
};

const bodyStyleByTone: Record<WorkspaceSurfaceTone, CSSProperties> = {
  hero: {
    padding: "16px 18px",
    display: "grid",
    gap: 14
  },
  metric: {
    padding: "11px 12px",
    display: "grid",
    gap: 6
  },
  panel: {
    padding: "13px 14px",
    display: "grid",
    gap: 11
  },
  quick: {
    padding: "13px 14px",
    display: "grid",
    gap: 10
  }
};

interface WorkspaceSurfaceCardProps {
  className?: string;
  tone: WorkspaceSurfaceTone;
  children: ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}

export default function WorkspaceSurfaceCard({ className, tone, children, style, bodyStyle }: WorkspaceSurfaceCardProps) {
  return (
    <Card
      className={className}
      variant="borderless"
      style={{
        ...surfaceStyleByTone[tone],
        ...style
      }}
      styles={{
        body: {
          ...bodyStyleByTone[tone],
          ...bodyStyle
        }
      }}
    >
      {children}
    </Card>
  );
}
