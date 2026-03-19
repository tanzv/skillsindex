import { asArray, asNumber, asObject, asString } from "../adminGovernance/shared";

import type { MetricCardItem, OperationsLedgerOverview, OpsCollection } from "./types";

export type OpsSourceRecord = Record<string, unknown>;

export function normalizeOpsCollection<TItem>(payload: unknown, mapItem: (item: OpsSourceRecord) => TItem): OpsCollection<TItem> {
  const record = asObject(payload);
  const items = asArray<OpsSourceRecord>(record.items);

  return {
    total: asNumber(record.total) || items.length,
    items: items.map(mapItem)
  };
}

export function buildOperationsLedgerOverview(metrics: OperationsLedgerOverview["metrics"]): OperationsLedgerOverview {
  return { metrics };
}

export function countMatching<TItem>(items: TItem[], predicate: (item: TItem) => boolean) {
  return items.filter(predicate).length;
}

export function averageMetric(items: number[], digits = 1) {
  if (items.length === 0) {
    return (0).toFixed(digits);
  }

  return (items.reduce((sum, item) => sum + item, 0) / items.length).toFixed(digits);
}

export function averageRounded(items: number[]) {
  if (items.length === 0) {
    return "0";
  }

  return String(Math.round(items.reduce((sum, item) => sum + item, 0) / items.length));
}

export function countDistinctNonEmpty(rows: OpsSourceRecord[], keys: string[]) {
  return new Set(
    rows
      .map((row) => keys.map((key) => asString(row[key])).find(Boolean) || "")
      .filter(Boolean)
  ).size;
}

export function resolveMetricSeverity(value: number, warningAt: number, criticalAt: number): MetricCardItem["severity"] {
  if (value >= criticalAt) {
    return "critical";
  }

  if (value >= warningAt) {
    return "warning";
  }

  return "normal";
}
