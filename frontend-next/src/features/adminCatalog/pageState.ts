import {
  buildAdminCatalogViewModel,
  normalizeJobsPayload,
  normalizeSkillsPayload,
  normalizeSyncJobsPayload,
  normalizeSyncPolicyPayload,
  type AdminCatalogModelMessages,
  type AdminCatalogRoute,
  type AdminCatalogViewModel,
  type RepositorySyncPolicy
} from "./model";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";

export function buildAdminCatalogRequestPath(endpoint: string, query: Record<string, string>) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value.trim()) {
      params.set(key, value.trim());
    }
  });

  const suffix = params.toString();
  return suffix ? `${endpoint}?${suffix}` : endpoint;
}

export function createInitialRepositorySyncPolicyDraft(): RepositorySyncPolicy {
  return {
    enabled: false,
    interval: "30m",
    timeout: "10m",
    batchSize: 20
  };
}

export function patchRepositorySyncPolicyDraft(
  currentDraft: RepositorySyncPolicy,
  patch: Partial<RepositorySyncPolicy>
): RepositorySyncPolicy {
  return {
    ...currentDraft,
    ...patch
  };
}

export function updateAdminCatalogQuery(current: Record<string, string>, key: string, value: string) {
  if (key === "page") {
    return {
      ...current,
      [key]: value
    };
  }

  return {
    ...current,
    [key]: value,
    page: "1"
  };
}

export function buildAdminCatalogPageViewModel({
  route,
  rawPayload,
  locale,
  messages
}: {
  route: AdminCatalogRoute;
  rawPayload: unknown;
  locale: PublicLocale;
  messages: AdminCatalogModelMessages;
}): {
  viewModel: AdminCatalogViewModel;
  normalizedPolicy: RepositorySyncPolicy;
} {
  const normalizedPolicy = normalizeSyncPolicyPayload(rawPayload);

  if (route === "/admin/skills") {
    return {
      normalizedPolicy,
      viewModel: buildAdminCatalogViewModel(route, normalizeSkillsPayload(rawPayload), {
        locale,
        messages
      })
    };
  }

  if (route === "/admin/jobs") {
    return {
      normalizedPolicy,
      viewModel: buildAdminCatalogViewModel(route, normalizeJobsPayload(rawPayload), {
        locale,
        messages
      })
    };
  }

  if (route === "/admin/sync-jobs") {
    return {
      normalizedPolicy,
      viewModel: buildAdminCatalogViewModel(route, normalizeSyncJobsPayload(rawPayload), {
        locale,
        messages
      })
    };
  }

  return {
    normalizedPolicy,
    viewModel: buildAdminCatalogViewModel(route, normalizedPolicy, {
      locale,
      messages
    })
  };
}
