import type { AppLocale } from "../lib/i18n";

export interface RecordsSyncCenterPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export interface SyncRunRecord {
  id: number;
  trigger: string;
  scope: string;
  status: string;
  candidates: number;
  synced: number;
  failed: number;
  duration_ms: number;
  started_at: string;
  finished_at: string;
  error_summary: string;
  owner_username: string;
  actor_username: string;
}

export interface SyncPolicyRecord {
  enabled: boolean;
  interval: string;
  timeout: string;
  batch_size: number;
}

export interface SyncRunDetailSummary {
  status: string;
  durationMs: string;
  started: string;
  finished: string;
}
