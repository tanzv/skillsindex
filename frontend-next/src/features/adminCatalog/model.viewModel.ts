import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import type { AdminCatalogDisplayMessages } from "./display";
import {
  resolveAdminCatalogDisplayMessages,
  resolveCatalogCategoryLabel,
  resolveCatalogJobTypeLabel,
  resolveCatalogOwnerLabel,
  resolveCatalogScopeLabel,
  resolveCatalogSkillName,
  resolveCatalogSourceTypeLabel,
  resolveCatalogStatusLabel,
  resolveCatalogTriggerLabel,
  resolveCatalogVisibilityLabel
} from "./display";
import { resolveModelMessages } from "./model.messages";
import type {
  AdminCatalogDetailSection,
  AdminCatalogDetailTopology,
  AdminCatalogModelMessages,
  AdminCatalogRoute,
  AdminCatalogRow,
  AdminCatalogViewModel,
  AdminCatalogViewModelOptions,
  JobsPayload,
  RepositorySyncPolicy,
  SkillsPayload,
  SyncJobsPayload
} from "./model.types";

function formatDateTime(value: string, locale: PublicLocale, notAvailable: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return notAvailable;
  }

  return new Date(parsed).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDuration(durationMs: number, messages: AdminCatalogModelMessages): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return messages.valueNotAvailable;
  }

  if (durationMs < 1000) {
    return `${Math.round(durationMs)} ms`;
  }

  return `${(durationMs / 1000).toFixed(1)} s`;
}

function hasSourceAnalysisData(item: SkillsPayload["items"][number]): boolean {
  return Boolean(
    item.sourceAnalysis.entryFile ||
      item.sourceAnalysis.mechanism ||
      item.sourceAnalysis.metadataSources.length ||
      item.sourceAnalysis.referencePaths.length ||
      item.sourceAnalysis.dependencies.length
  );
}

function buildDetailValueList(
  values: string[],
  emptyValue: string,
  buildHref?: (value: string) => string | undefined
): AdminCatalogDetailSection["items"] {
  if (!values.length) {
    return [{ value: emptyValue }];
  }

  return values.map((value) => ({ value, href: buildHref?.(value) }));
}

function buildAdminSkillSearchLink(value: string): string | undefined {
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  return `/admin/skills?q=${encodeURIComponent(normalized)}`;
}

function normalizeSkillLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractSkillLookupKeys(item: SkillsPayload["items"][number]): string[] {
  const lookupKeys = new Set<string>();
  const pushValue = (value: string) => {
    const normalized = normalizeSkillLookupKey(value);
    if (normalized) {
      lookupKeys.add(normalized);
    }
  };

  pushValue(String(item.id));
  pushValue(item.name);

  item.sourceAnalysis.referencePaths.forEach((referencePath) => {
    pushValue(referencePath);
    const pathSegments = referencePath.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || "";
    pushValue(lastSegment);
  });

  return Array.from(lookupKeys);
}

function buildPublicSkillDetailLinkResolver(items: SkillsPayload["items"]): (value: string) => string | undefined {
  const skillHrefByKey = new Map<string, string>();

  items.forEach((item) => {
    if (item.visibility.toLowerCase() !== "public") {
      return;
    }

    const href = `/skills/${item.id}`;
    extractSkillLookupKeys(item).forEach((lookupKey) => {
      if (!skillHrefByKey.has(lookupKey)) {
        skillHrefByKey.set(lookupKey, href);
      }
    });
  });

  return (value: string) => {
    const lookupKey = normalizeSkillLookupKey(value);
    if (!lookupKey) {
      return undefined;
    }

    return skillHrefByKey.get(lookupKey);
  };
}

function buildDependencyDetailItems(
  item: SkillsPayload["items"][number],
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
  resolvePublicSkillDetailLink: (value: string) => string | undefined
): AdminCatalogDetailSection["items"] {
  if (!item.sourceAnalysis.dependencies.length) {
    return [{ value: messages.detailNoDependencies }];
  }

  return item.sourceAnalysis.dependencies.map((dependency) => ({
    label: dependency.kind || displayMessages.valueUnknown,
    value: dependency.target || messages.valueNotAvailable,
    href:
      dependency.kind === "skill"
        ? resolvePublicSkillDetailLink(dependency.target || "") || buildAdminSkillSearchLink(dependency.target || "")
        : undefined
  }));
}

function buildTopologyNodes(values: string[]): { value: string; href?: string }[] {
  return values.map((value) => ({
    value,
    href: buildAdminSkillSearchLink(value)
  }));
}

function buildDependencyTopologyNodes(
  item: SkillsPayload["items"][number],
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
  resolvePublicSkillDetailLink: (value: string) => string | undefined
): { label?: string; value: string; href?: string }[] {
  if (!item.sourceAnalysis.dependencies.length) {
    return [{ value: messages.detailNoDependencies }];
  }

  return item.sourceAnalysis.dependencies.map((dependency) => ({
    label: dependency.kind || displayMessages.valueUnknown,
    value: dependency.target || messages.valueNotAvailable,
    href:
      dependency.kind === "skill"
        ? resolvePublicSkillDetailLink(dependency.target || "") || buildAdminSkillSearchLink(dependency.target || "")
        : undefined
  }));
}

function buildSkillDetailTopology(
  item: SkillsPayload["items"][number],
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
  resolvePublicSkillDetailLink: (value: string) => string | undefined
): AdminCatalogDetailTopology | undefined {
  if (!hasSourceAnalysisData(item)) {
    return undefined;
  }

  return {
    title: messages.detailTopologyTitle,
    rootLabel: messages.detailTopologyRootTitle,
    rootValue: item.sourceAnalysis.entryFile || messages.valueNotAvailable,
    rootMetaLabel: messages.detailMechanismLabel,
    rootMetaValue: item.sourceAnalysis.mechanism || messages.valueNotAvailable,
    lanes: [
      {
        title: messages.detailMetadataSourcesTitle,
        nodes: buildTopologyNodes(item.sourceAnalysis.metadataSources),
        emptyValue: messages.detailNoMetadataSources
      },
      {
        title: messages.detailReferencePathsTitle,
        nodes: buildTopologyNodes(item.sourceAnalysis.referencePaths),
        emptyValue: messages.detailNoReferencePaths
      },
      {
        title: messages.detailDependenciesTitle,
        nodes: buildDependencyTopologyNodes(item, messages, displayMessages, resolvePublicSkillDetailLink),
        emptyValue: messages.detailNoDependencies
      }
    ]
  };
}

function buildSkillDetailSections(
  item: SkillsPayload["items"][number],
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
  resolvePublicSkillDetailLink: (value: string) => string | undefined
): AdminCatalogDetailSection[] | undefined {
  if (!hasSourceAnalysisData(item)) {
    return undefined;
  }

  return [
    {
      title: messages.detailSourceAnalysisTitle,
      items: [
        {
          label: messages.detailEntryFileLabel,
          value: item.sourceAnalysis.entryFile || messages.valueNotAvailable
        },
        {
          label: messages.detailMechanismLabel,
          value: item.sourceAnalysis.mechanism || messages.valueNotAvailable
        }
      ]
    },
    {
      title: messages.detailMetadataSourcesTitle,
      items: buildDetailValueList(item.sourceAnalysis.metadataSources, messages.detailNoMetadataSources, buildAdminSkillSearchLink)
    },
    {
      title: messages.detailReferencePathsTitle,
      items: buildDetailValueList(item.sourceAnalysis.referencePaths, messages.detailNoReferencePaths, buildAdminSkillSearchLink)
    },
    {
      title: messages.detailDependenciesTitle,
      items: buildDependencyDetailItems(item, messages, displayMessages, resolvePublicSkillDetailLink)
    }
  ];
}

function buildSkillRow(
  item: SkillsPayload["items"][number],
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
  resolvePublicSkillDetailLink: (value: string) => string | undefined
): AdminCatalogRow {
  return {
    id: item.id,
    name: resolveCatalogSkillName(item.name, displayMessages),
    summary: [
      resolveCatalogCategoryLabel(item.category, displayMessages),
      resolveCatalogSourceTypeLabel(item.sourceType, displayMessages),
      resolveCatalogOwnerLabel(item.ownerUsername, displayMessages)
    ].join(" · "),
    meta: [
      `${item.starCount} ${messages.starsSuffix}`,
      `${item.qualityScore.toFixed(1)} ${messages.qualitySuffix}`,
      formatDateTime(item.updatedAt, locale, messages.valueNotAvailable)
    ],
    status: item.visibility || "private",
    statusLabel: resolveCatalogVisibilityLabel(item.visibility, displayMessages),
    detailTopology: buildSkillDetailTopology(item, messages, displayMessages, resolvePublicSkillDetailLink),
    detailSections: buildSkillDetailSections(item, messages, displayMessages, resolvePublicSkillDetailLink),
    syncable: item.sourceType.toLowerCase() === "repository"
  };
}

function buildJobRow(
  item: JobsPayload["items"][number],
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages
): AdminCatalogRow {
  return {
    id: item.id,
    name: `${resolveCatalogJobTypeLabel(item.jobType, displayMessages)} #${item.id}`,
    summary: `${messages.summarySkillPrefix} ${item.targetSkillId || messages.valueNotAvailable} · ${messages.summaryOwnerPrefix} ${item.ownerUserId || messages.valueNotAvailable} · ${messages.summaryActorPrefix} ${item.actorUserId || messages.valueNotAvailable}`,
    meta: [
      formatProtectedMessage(messages.attemptTemplate, { attempt: item.attempt, maxAttempts: item.maxAttempts }),
      formatDateTime(item.updatedAt, locale, messages.valueNotAvailable)
    ],
    status: item.status || "unknown",
    statusLabel: resolveCatalogStatusLabel(item.status, displayMessages),
    detail: item.errorMessage || undefined
  };
}

function buildSyncRunRow(
  item: SyncJobsPayload["items"][number],
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages
): AdminCatalogRow {
  return {
    id: item.id,
    name: `${resolveCatalogTriggerLabel(item.trigger, displayMessages)} · ${resolveCatalogScopeLabel(item.scope, displayMessages)}`,
    summary: `${item.synced} ${messages.syncedSummarySuffix} / ${item.failed} ${messages.failedSummarySuffix} / ${item.candidates} ${messages.candidatesSummarySuffix}`,
    meta: [
      formatDuration(item.durationMs, messages),
      formatDateTime(item.finishedAt || item.startedAt, locale, messages.valueNotAvailable)
    ],
    status: item.status || "unknown",
    statusLabel: resolveCatalogStatusLabel(item.status, displayMessages)
  };
}

function buildSkillsViewModel(
  payload: SkillsPayload,
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages
): AdminCatalogViewModel {
  const publicCount = payload.items.filter((item) => item.visibility.toLowerCase() === "public").length;
  const repositoryCount = payload.items.filter((item) => item.sourceType.toLowerCase() === "repository").length;
  const resolvePublicSkillDetailLink = buildPublicSkillDetailLinkResolver(payload.items);
  const averageQuality =
    payload.items.length > 0
      ? (payload.items.reduce((sum, item) => sum + item.qualityScore, 0) / payload.items.length).toFixed(1)
      : "0.0";

  return {
    metrics: [
      { label: messages.metricTotalSkills, value: String(payload.total) },
      { label: messages.metricListedRows, value: String(payload.items.length) },
      { label: messages.metricPublicSkills, value: String(publicCount) },
      { label: messages.metricAverageQuality, value: averageQuality }
    ],
    sidePanel: [
      {
        title: messages.panelCatalogSignalsTitle,
        items: [
          { label: messages.panelCatalogSignalsRepositoryBacked, value: String(repositoryCount) },
          { label: messages.panelCatalogSignalsManualOther, value: String(payload.items.length - repositoryCount) }
        ]
      }
    ],
    table: {
      title: messages.metricTotalSkills,
      rows: payload.items.map((item) => buildSkillRow(item, locale, messages, displayMessages, resolvePublicSkillDetailLink))
    },
    editor: null
  };
}

function buildJobsViewModel(
  payload: JobsPayload,
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages
): AdminCatalogViewModel {
  const runningCount = payload.items.filter((item) => item.status.toLowerCase() === "running").length;
  const failedCount = payload.items.filter((item) => item.status.toLowerCase() === "failed").length;
  const retryPressure = payload.items.filter((item) => item.attempt > 1).length;
  const latestRunningJobType = payload.items.find((item) => item.status.toLowerCase() === "running")?.jobType || "";

  return {
    metrics: [
      { label: messages.metricQueuedJobs, value: String(payload.total) },
      { label: messages.metricRunningJobs, value: String(runningCount) },
      { label: messages.metricFailedJobs, value: String(failedCount) },
      { label: messages.metricRetryPressure, value: String(retryPressure) }
    ],
    sidePanel: [
      {
        title: messages.panelExecutionSignalsTitle,
        items: [
          {
            label: messages.panelExecutionSignalsLatestRunning,
            value: latestRunningJobType
              ? resolveCatalogJobTypeLabel(latestRunningJobType, displayMessages)
              : messages.valueNotAvailable
          },
          {
            label: messages.panelExecutionSignalsMaxRetrySpan,
            value: String(Math.max(...payload.items.map((item) => item.maxAttempts || 0), 0))
          }
        ]
      }
    ],
    table: {
      title: messages.metricQueuedJobs,
      rows: payload.items.map((item) => buildJobRow(item, locale, messages, displayMessages))
    },
    editor: null
  };
}

function buildSyncJobsViewModel(
  payload: SyncJobsPayload,
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages
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
        value: payload.items[0] ? formatDuration(payload.items[0].durationMs, messages) : messages.valueNotAvailable
      }
    ],
    sidePanel: [
      {
        title: messages.panelRunDistributionTitle,
        items: [
          {
            label: messages.panelRunDistributionScheduledRuns,
            value: String(payload.items.filter((item) => item.trigger === "schedule").length)
          },
          {
            label: messages.panelRunDistributionManualRuns,
            value: String(payload.items.filter((item) => item.trigger !== "schedule").length)
          }
        ]
      }
    ],
    table: {
      title: messages.metricSyncRuns,
      rows: payload.items.map((item) => buildSyncRunRow(item, locale, messages, displayMessages))
    },
    editor: null
  };
}

function buildSyncPolicyViewModel(
  payload: RepositorySyncPolicy,
  messages: AdminCatalogModelMessages
): AdminCatalogViewModel {
  return {
    metrics: [
      { label: messages.metricSchedulerEnabled, value: payload.enabled ? messages.valueYes : messages.valueNo },
      { label: messages.metricInterval, value: payload.interval },
      { label: messages.metricTimeout, value: payload.timeout },
      { label: messages.metricBatchSize, value: String(payload.batchSize) }
    ],
    sidePanel: [
      {
        title: messages.panelPolicyNotesTitle,
        items: [
          {
            label: messages.panelPolicyExecutionMode,
            value: payload.enabled ? messages.valueScheduledSyncEnabled : messages.valueManualExecutionOnly
          },
          {
            label: messages.panelPolicyRecommendedPosture,
            value: payload.batchSize >= 100 ? messages.valueHighThroughput : messages.valueControlledThroughput
          }
        ]
      }
    ],
    table: null,
    editor: payload
  };
}

export function buildAdminCatalogViewModel(
  route: AdminCatalogRoute,
  payload: SkillsPayload | JobsPayload | SyncJobsPayload | RepositorySyncPolicy,
  options?: AdminCatalogViewModelOptions
): AdminCatalogViewModel {
  const locale = options?.locale || "en";
  const messages = resolveModelMessages(options);
  const displayMessages = resolveAdminCatalogDisplayMessages(
    options?.messages as Partial<AdminCatalogDisplayMessages> | undefined
  );

  if (route === "/admin/skills") {
    return buildSkillsViewModel(payload as SkillsPayload, locale, messages, displayMessages);
  }

  if (route === "/admin/jobs") {
    return buildJobsViewModel(payload as JobsPayload, locale, messages, displayMessages);
  }

  if (route === "/admin/sync-jobs") {
    return buildSyncJobsViewModel(payload as SyncJobsPayload, locale, messages, displayMessages);
  }

  return buildSyncPolicyViewModel(payload as RepositorySyncPolicy, messages);
}
