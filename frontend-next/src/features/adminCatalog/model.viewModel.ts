import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import {
  adminJobsRoute,
  adminSkillsRoute,
  adminSyncJobsRoute,
} from "@/src/lib/routing/protectedSurfaceLinks";

import type { AdminCatalogDisplayMessages } from "./display";
import {
  resolveAdminCatalogDisplayMessages,
  resolveCatalogJobTypeLabel,
  resolveCatalogScopeLabel,
  resolveCatalogStatusLabel,
  resolveCatalogTriggerLabel,
} from "./display";
import { resolveModelMessages } from "./model.messages";
import { buildSkillRows } from "./model.skillRows";
import type {
  AdminCatalogPagination,
  AdminCatalogModelMessages,
  AdminCatalogRoute,
  AdminCatalogRow,
  AdminCatalogViewModel,
  AdminCatalogViewModelOptions,
  JobsPayload,
  RepositorySyncPolicy,
  SkillsPayload,
  SyncJobsPayload,
} from "./model.types";

function formatDateTime(
  value: string,
  locale: PublicLocale,
  notAvailable: string,
): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return notAvailable;
  }

  return new Date(parsed).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(
  durationMs: number,
  messages: AdminCatalogModelMessages,
): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return messages.valueNotAvailable;
  }

  if (durationMs < 1000) {
    return `${Math.round(durationMs)} ms`;
  }

  return `${(durationMs / 1000).toFixed(1)} s`;
}

function buildJobRow(
  item: JobsPayload["items"][number],
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
): AdminCatalogRow {
  return {
    id: item.id,
    name: `${resolveCatalogJobTypeLabel(item.jobType, displayMessages)} #${item.id}`,
    summary: `${messages.summarySkillPrefix} ${item.targetSkillId || messages.valueNotAvailable} · ${messages.summaryOwnerPrefix} ${item.ownerUserId || messages.valueNotAvailable} · ${messages.summaryActorPrefix} ${item.actorUserId || messages.valueNotAvailable}`,
    meta: [
      formatProtectedMessage(messages.attemptTemplate, {
        attempt: item.attempt,
        maxAttempts: item.maxAttempts,
      }),
      formatDateTime(item.updatedAt, locale, messages.valueNotAvailable),
    ],
    status: item.status || "unknown",
    statusLabel: resolveCatalogStatusLabel(item.status, displayMessages),
    detail: item.errorMessage || undefined,
  };
}

function buildSyncRunRow(
  item: SyncJobsPayload["items"][number],
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
): AdminCatalogRow {
  return {
    id: item.id,
    name: `${resolveCatalogTriggerLabel(item.trigger, displayMessages)} · ${resolveCatalogScopeLabel(item.scope, displayMessages)}`,
    summary: `${item.synced} ${messages.syncedSummarySuffix} / ${item.failed} ${messages.failedSummarySuffix} / ${item.candidates} ${messages.candidatesSummarySuffix}`,
    meta: [
      formatDuration(item.durationMs, messages),
      formatDateTime(
        item.finishedAt || item.startedAt,
        locale,
        messages.valueNotAvailable,
      ),
    ],
    status: item.status || "unknown",
    statusLabel: resolveCatalogStatusLabel(item.status, displayMessages),
  };
}

function buildPagination(
  payload: SkillsPayload | JobsPayload | SyncJobsPayload,
): AdminCatalogPagination {
  const page = Math.max(payload.page || 1, 1);
  const limit = Math.max(payload.limit || payload.items.length || 20, 1);
  const total = Math.max(payload.total || payload.items.length, 0);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return {
    page,
    limit,
    total,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

function buildSkillsViewModel(
  payload: SkillsPayload,
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
): AdminCatalogViewModel {
  const publicCount = payload.items.filter(
    (item) => item.visibility.toLowerCase() === "public",
  ).length;
  const repositoryCount = payload.items.filter(
    (item) => item.sourceType.toLowerCase() === "repository",
  ).length;
  const averageQuality =
    payload.items.length > 0
      ? (
          payload.items.reduce((sum, item) => sum + item.qualityScore, 0) /
          payload.items.length
        ).toFixed(1)
      : "0.0";

  return {
    metrics: [
      { label: messages.metricTotalSkills, value: String(payload.total) },
      { label: messages.metricListedRows, value: String(payload.items.length) },
      { label: messages.metricPublicSkills, value: String(publicCount) },
      { label: messages.metricAverageQuality, value: averageQuality },
    ],
    sidePanel: [
      {
        title: messages.panelCatalogSignalsTitle,
        items: [
          {
            label: messages.panelCatalogSignalsRepositoryBacked,
            value: String(repositoryCount),
          },
          {
            label: messages.panelCatalogSignalsManualOther,
            value: String(payload.items.length - repositoryCount),
          },
        ],
      },
    ],
    table: {
      title: messages.metricTotalSkills,
      rows: buildSkillRows(payload, locale, messages, displayMessages),
      pagination: buildPagination(payload),
    },
    editor: null,
  };
}

function buildJobsViewModel(
  payload: JobsPayload,
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
): AdminCatalogViewModel {
  const runningCount = payload.items.filter(
    (item) => item.status.toLowerCase() === "running",
  ).length;
  const failedCount = payload.items.filter(
    (item) => item.status.toLowerCase() === "failed",
  ).length;
  const retryPressure = payload.items.filter((item) => item.attempt > 1).length;
  const latestRunningJobType =
    payload.items.find((item) => item.status.toLowerCase() === "running")
      ?.jobType || "";

  return {
    metrics: [
      { label: messages.metricQueuedJobs, value: String(payload.total) },
      { label: messages.metricRunningJobs, value: String(runningCount) },
      { label: messages.metricFailedJobs, value: String(failedCount) },
      { label: messages.metricRetryPressure, value: String(retryPressure) },
    ],
    sidePanel: [
      {
        title: messages.panelExecutionSignalsTitle,
        items: [
          {
            label: messages.panelExecutionSignalsLatestRunning,
            value: latestRunningJobType
              ? resolveCatalogJobTypeLabel(
                  latestRunningJobType,
                  displayMessages,
                )
              : messages.valueNotAvailable,
          },
          {
            label: messages.panelExecutionSignalsMaxRetrySpan,
            value: String(
              Math.max(
                ...payload.items.map((item) => item.maxAttempts || 0),
                0,
              ),
            ),
          },
        ],
      },
    ],
    table: {
      title: messages.metricQueuedJobs,
      rows: payload.items.map((item) =>
        buildJobRow(item, locale, messages, displayMessages),
      ),
      pagination: buildPagination(payload),
    },
    editor: null,
  };
}

function buildSyncJobsViewModel(
  payload: SyncJobsPayload,
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
): AdminCatalogViewModel {
  const failedItems = payload.items.reduce((sum, item) => sum + item.failed, 0);
  const syncedItems = payload.items.reduce((sum, item) => sum + item.synced, 0);

  return {
    metrics: [
      { label: messages.metricSyncRuns, value: String(payload.total) },
      { label: messages.metricSyncedItems, value: String(syncedItems) },
      { label: messages.metricFailedItems, value: String(failedItems) },
      {
        label: messages.metricLatestDuration,
        value: payload.items[0]
          ? formatDuration(payload.items[0].durationMs, messages)
          : messages.valueNotAvailable,
      },
    ],
    sidePanel: [
      {
        title: messages.panelRunDistributionTitle,
        items: [
          {
            label: messages.panelRunDistributionScheduledRuns,
            value: String(
              payload.items.filter((item) => item.trigger === "schedule")
                .length,
            ),
          },
          {
            label: messages.panelRunDistributionManualRuns,
            value: String(
              payload.items.filter((item) => item.trigger !== "schedule")
                .length,
            ),
          },
        ],
      },
    ],
    table: {
      title: messages.metricSyncRuns,
      rows: payload.items.map((item) =>
        buildSyncRunRow(item, locale, messages, displayMessages),
      ),
      pagination: buildPagination(payload),
    },
    editor: null,
  };
}

function buildSyncPolicyViewModel(
  payload: RepositorySyncPolicy,
  messages: AdminCatalogModelMessages,
): AdminCatalogViewModel {
  return {
    metrics: [
      {
        label: messages.metricSchedulerEnabled,
        value: payload.enabled ? messages.valueYes : messages.valueNo,
      },
      { label: messages.metricInterval, value: payload.interval },
      { label: messages.metricTimeout, value: payload.timeout },
      { label: messages.metricBatchSize, value: String(payload.batchSize) },
    ],
    sidePanel: [
      {
        title: messages.panelPolicyNotesTitle,
        items: [
          {
            label: messages.panelPolicyExecutionMode,
            value: payload.enabled
              ? messages.valueScheduledSyncEnabled
              : messages.valueManualExecutionOnly,
          },
          {
            label: messages.panelPolicyRecommendedPosture,
            value:
              payload.batchSize >= 100
                ? messages.valueHighThroughput
                : messages.valueControlledThroughput,
          },
        ],
      },
    ],
    table: null,
    editor: payload,
  };
}

export function buildAdminCatalogViewModel(
  route: AdminCatalogRoute,
  payload: SkillsPayload | JobsPayload | SyncJobsPayload | RepositorySyncPolicy,
  options?: AdminCatalogViewModelOptions,
): AdminCatalogViewModel {
  const locale = options?.locale || "en";
  const messages = resolveModelMessages(options);
  const displayMessages = resolveAdminCatalogDisplayMessages(
    options?.messages as Partial<AdminCatalogDisplayMessages> | undefined,
  );

  if (route === adminSkillsRoute) {
    return buildSkillsViewModel(
      payload as SkillsPayload,
      locale,
      messages,
      displayMessages,
    );
  }

  if (route === adminJobsRoute) {
    return buildJobsViewModel(
      payload as JobsPayload,
      locale,
      messages,
      displayMessages,
    );
  }

  if (route === adminSyncJobsRoute) {
    return buildSyncJobsViewModel(
      payload as SyncJobsPayload,
      locale,
      messages,
      displayMessages,
    );
  }

  return buildSyncPolicyViewModel(payload as RepositorySyncPolicy, messages);
}
