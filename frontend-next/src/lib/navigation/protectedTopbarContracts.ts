export type ProtectedTopbarEntryKind = "primary" | "access" | "quick";

export interface ProtectedTopbarEntrySeed {
  id: string;
  href: string;
  label: string;
  description: string;
  kind: ProtectedTopbarEntryKind;
  overflowGroupId: string;
  exactMatch?: boolean;
  matchPrefixes?: string[];
}

export interface ProtectedTopbarPrimaryGroupConfig {
  id: string;
  label: string;
  tagLabel: string;
  kind: ProtectedTopbarEntryKind;
}

export interface ProtectedTopbarConfig {
  entries: ProtectedTopbarEntrySeed[];
  primaryGroups: ProtectedTopbarPrimaryGroupConfig[];
  overflowGroupTitles: Record<string, string>;
  overflowGroupOrder: string[];
  overflowTitle: string;
  overflowHint: string;
  overflowMetricLabels: {
    visible: string;
    hidden: string;
  };
}
