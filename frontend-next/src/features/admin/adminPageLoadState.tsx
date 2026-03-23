import type { ReactNode } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";

export type AdminPageLoadState = "loading" | "ready" | "error";

export function resolveAdminPageLoadState({
  loading,
  error,
  hasData
}: {
  loading: boolean;
  error: string;
  hasData: boolean;
}): AdminPageLoadState {
  if (loading) {
    return "loading";
  }

  if (hasData) {
    return "ready";
  }

  if (error) {
    return "error";
  }

  return "loading";
}

export function AdminPageLoadStateFrame({
  eyebrow,
  title,
  description,
  actions,
  error
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      {error ? <ErrorState description={error} /> : null}
    </div>
  );
}
