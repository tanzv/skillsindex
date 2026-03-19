"use client";

import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { Button } from "@/src/components/ui/button";

import type { AdminIngestionRoute } from "./model";
import type {
  ImportsIngestionViewProps,
  ManualIngestionViewProps,
  RepositoryIngestionViewProps
} from "./AdminIngestionViewProps";
import {
  ImportsIngestionView,
  ManualIngestionView,
  RepositoryIngestionView
} from "./AdminIngestionViews";
import { IngestionMessage, IngestionMetricGrid } from "./shared";

interface AdminIngestionContentProps {
  route: AdminIngestionRoute;
  title: string;
  description: string;
  loading: boolean;
  error: string;
  message: string;
  metrics: Array<{ label: string; value: string }>;
  onRefresh: () => void;
  manualView: ManualIngestionViewProps;
  repositoryView: RepositoryIngestionViewProps;
  importsView: ImportsIngestionViewProps;
}

export function AdminIngestionContent({
  route,
  title,
  description,
  loading,
  error,
  message,
  metrics,
  onRefresh,
  manualView,
  repositoryView,
  importsView
}: AdminIngestionContentProps) {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;

  return (
    <AdminPageScaffold
      eyebrow={commonMessages.adminEyebrow}
      title={title}
      description={description}
      actions={<Button onClick={onRefresh}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>}
      error={error}
    >
      <IngestionMessage message={message} />
      <IngestionMetricGrid metrics={metrics} />
      {route === "/admin/ingestion/manual" ? <ManualIngestionView {...manualView} /> : null}
      {route === "/admin/ingestion/repository" ? <RepositoryIngestionView {...repositoryView} /> : null}
      {route === "/admin/records/imports" ? <ImportsIngestionView {...importsView} /> : null}
    </AdminPageScaffold>
  );
}
