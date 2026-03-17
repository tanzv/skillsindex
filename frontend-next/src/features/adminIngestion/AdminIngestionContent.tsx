import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Button } from "@/src/components/ui/button";

import type { AdminIngestionRoute } from "./model";
import {
  ImportsIngestionView,
  type ImportsIngestionViewProps,
  ManualIngestionView,
  type ManualIngestionViewProps,
  RepositoryIngestionView,
  type RepositoryIngestionViewProps
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
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title={title}
        description={description}
        actions={<Button onClick={onRefresh}>{loading ? "Refreshing..." : "Refresh"}</Button>}
      />

      {error ? <ErrorState description={error} /> : null}
      <IngestionMessage message={message} />
      <IngestionMetricGrid metrics={metrics} />

      {route === "/admin/ingestion/manual" ? <ManualIngestionView {...manualView} /> : null}
      {route === "/admin/ingestion/repository" ? <RepositoryIngestionView {...repositoryView} /> : null}
      {route === "/admin/records/imports" ? <ImportsIngestionView {...importsView} /> : null}
    </div>
  );
}
