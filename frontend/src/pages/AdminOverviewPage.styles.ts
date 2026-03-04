import type { CSSProperties } from "react";

export const adminOverviewColors = {
  stage: "#0B1326",
  topBar: "#12213F",
  cardBase: "#1B2E57",
  cardHighlight: "#1F3B62",
  chipBlue: "#1D4ED8",
  title: "#EEF3FB",
  textPrimary: "#EAF2FF",
  textBody: "#DBEAFE",
  textMuted: "#BFD8FF",
  textHint: "#93C5FD"
} as const;

export const adminOverviewStyles: Record<string, CSSProperties> = {
  stageShell: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    overflow: "hidden"
  },
  stage: {
    width: 1440,
    height: 900,
    background: adminOverviewColors.stage,
    display: "grid",
    gap: 12,
    paddingBottom: 12,
    boxSizing: "border-box"
  },
  topBar: {
    height: 86,
    background: adminOverviewColors.topBar,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "22px 32px"
  },
  topTitle: {
    margin: 0,
    color: adminOverviewColors.title,
    fontFamily: '"Noto Sans SC", "Noto Sans", sans-serif',
    fontSize: 31,
    fontWeight: 700,
    lineHeight: 1.1
  },
  chipRow: {
    display: "flex",
    gap: 6,
    alignItems: "center"
  },
  chip: {
    borderRadius: 999,
    padding: "4px 10px",
    color: adminOverviewColors.textBody,
    fontFamily: '"Noto Sans SC", "Noto Sans", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    lineHeight: "11px",
    whiteSpace: "nowrap"
  },
  alertWrap: {
    width: 1360,
    margin: "0 auto"
  },
  mainGrid: {
    width: 1360,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "932px 412px",
    gap: 16,
    alignItems: "start"
  },
  column: {
    display: "grid",
    gap: 14
  },
  card: {
    background: adminOverviewColors.cardBase,
    borderRadius: 16,
    boxSizing: "border-box",
    display: "grid",
    gap: 8
  },
  cardHeader: {
    margin: 0,
    color: adminOverviewColors.textPrimary,
    fontFamily: '"Noto Sans SC", "Noto Sans", sans-serif',
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.2
  },
  cardMeta: {
    color: adminOverviewColors.textMuted,
    fontFamily: '"Noto Sans SC", "Noto Sans", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.1
  },
  loadingWrap: {
    width: 1360,
    margin: "0 auto",
    minHeight: 48,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};
