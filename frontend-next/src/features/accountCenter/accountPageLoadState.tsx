import type { ReactNode } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";

export type AccountPageLoadState = "loading" | "ready" | "error";

export function resolveAccountPageLoadState({
  loading,
  error,
  hasData
}: {
  loading: boolean;
  error: string;
  hasData: boolean;
}): AccountPageLoadState {
  if (hasData) {
    return "ready";
  }

  if (loading) {
    return "loading";
  }

  if (error) {
    return "error";
  }

  return "loading";
}

export function AccountPageLoadStateFrame({
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
