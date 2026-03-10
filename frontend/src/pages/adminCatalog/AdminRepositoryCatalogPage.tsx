import { useCallback, useEffect, useMemo, useState } from "react";

import type { AppLocale } from "../../lib/i18n";
import { fetchConsoleJSON, postConsoleJSON } from "../../lib/api";
import { getAdminRepositoryCatalogCopy } from "./AdminRepositoryCatalogPage.copy";
import AdminRepositoryCatalogPageContent from "./AdminRepositoryCatalogPageContent";
import type {
  AdminRepositoryCatalogRoute,
  AsyncJobItem,
  RepositorySyncPolicy,
  SyncJobRunItem
} from "./AdminRepositoryCatalogPage.helpers";
export { isAdminRepositoryCatalogRoute } from "./AdminRepositoryCatalogPage.helpers";

interface AdminRepositoryCatalogPageProps {
  locale: AppLocale;
  route: AdminRepositoryCatalogRoute;
  onNavigate: (path: string) => void;
}

const initialPolicy: RepositorySyncPolicy = {
  enabled: false,
  interval: "30m",
  timeout: "10m",
  batch_size: 20
};

export default function AdminRepositoryCatalogPage({ locale, route, onNavigate }: AdminRepositoryCatalogPageProps) {
  const text = useMemo(() => getAdminRepositoryCatalogCopy(locale), [locale]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jobs, setJobs] = useState<AsyncJobItem[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [syncJobs, setSyncJobs] = useState<SyncJobRunItem[]>([]);
  const [syncJobsTotal, setSyncJobsTotal] = useState(0);
  const [policy, setPolicy] = useState<RepositorySyncPolicy | null>(null);
  const [policyForm, setPolicyForm] = useState<RepositorySyncPolicy>(initialPolicy);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (route === "/admin/jobs") {
        const payload = await fetchConsoleJSON<{ items?: AsyncJobItem[]; total?: number }>("/api/v1/admin/jobs");
        const items = Array.isArray(payload.items) ? payload.items : [];
        setJobs(items);
        setJobsTotal(Number(payload.total || items.length));
        setSyncJobs([]);
        setSyncJobsTotal(0);
        setPolicy(null);
      } else if (route === "/admin/sync-jobs") {
        const payload = await fetchConsoleJSON<{ items?: SyncJobRunItem[]; total?: number }>("/api/v1/admin/sync-jobs");
        const items = Array.isArray(payload.items) ? payload.items : [];
        setSyncJobs(items);
        setSyncJobsTotal(Number(payload.total || items.length));
        setJobs([]);
        setJobsTotal(0);
        setPolicy(null);
      } else {
        const payload = await fetchConsoleJSON<RepositorySyncPolicy>("/api/v1/admin/sync-policy/repository");
        const nextPolicy: RepositorySyncPolicy = {
          enabled: Boolean(payload.enabled),
          interval: String(payload.interval || initialPolicy.interval),
          timeout: String(payload.timeout || initialPolicy.timeout),
          batch_size: Number(payload.batch_size || initialPolicy.batch_size)
        };
        setPolicy(nextPolicy);
        setPolicyForm(nextPolicy);
        setJobs([]);
        setJobsTotal(0);
        setSyncJobs([]);
        setSyncJobsTotal(0);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.requestFailed);
    } finally {
      setLoading(false);
    }
  }, [route, text.requestFailed]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSavePolicy = useCallback(async () => {
    if (route !== "/admin/sync-policy/repository") {
      return;
    }

    const batchSize = Number(policyForm.batch_size);
    if (!Number.isFinite(batchSize) || batchSize <= 0) {
      setError(text.batchSizePositive);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await postConsoleJSON("/api/v1/admin/sync-policy/repository", {
        enabled: policyForm.enabled,
        interval: policyForm.interval.trim(),
        timeout: policyForm.timeout.trim(),
        batch_size: Math.round(batchSize)
      });
      setSuccess(text.policyUpdatedSuccessfully);
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.requestFailed);
    } finally {
      setSaving(false);
    }
  }, [loadData, policyForm, route, text.batchSizePositive, text.policyUpdatedSuccessfully, text.requestFailed]);

  return (
    <AdminRepositoryCatalogPageContent
      locale={locale}
      route={route}
      loading={loading}
      saving={saving}
      error={error}
      success={success}
      jobs={jobs}
      jobsTotal={jobsTotal}
      syncJobs={syncJobs}
      syncJobsTotal={syncJobsTotal}
      policy={policy}
      policyForm={policyForm}
      onRefresh={() => void loadData()}
      onNavigate={onNavigate}
      onPolicyFormChange={(patch) => setPolicyForm((previous) => ({ ...previous, ...patch }))}
      onSavePolicy={() => void handleSavePolicy()}
    />
  );
}
